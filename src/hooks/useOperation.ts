import { useState, useCallback, useRef, useEffect } from 'react'
import type { OperationPhase, OperationType, ActiveOperation } from '../types/operation'

const STORAGE_KEY = 'shieldpay_active_operation'

interface OperationState {
  phase: OperationPhase
  type: OperationType
  amount: string
  token: string
  recipient?: string
  startedAt: number
  txHash?: string
}

const IDLE: OperationState = {
  phase: 'idle',
  type: 'shield',
  amount: '',
  token: 'ETH',
  startedAt: 0,
}

function delay(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms))
}

function persist(op: OperationState) {
  if (op.phase === 'idle') {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    const saved: ActiveOperation & { token?: string } = {
      type: op.type,
      phase: op.phase,
      amount: op.amount,
      startedAt: op.startedAt,
      token: op.token,
      ...(op.txHash ? { unwrapTxHash: op.txHash } : {}),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  }
}

const RESTORABLE_PHASES = new Set<OperationPhase>([
  'processing', 'proof_ready', 'interrupted',
  'completed',
  'failed_submission', 'failed_dropped', 'failed_finalization',
  'cancelled', 'timed_out',
])

function restore(): OperationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as ActiveOperation & { token?: string }
    if (!RESTORABLE_PHASES.has(saved.phase)) return null
    const phase: OperationPhase = saved.phase === 'processing' ? 'interrupted' : saved.phase
    return {
      phase,
      type: saved.type,
      amount: saved.amount,
      token: saved.token ?? 'ETH',
      startedAt: saved.startedAt,
      txHash: saved.unwrapTxHash,
    }
  } catch {
    return null
  }
}

export function useOperation() {
  const [op, setOp] = useState<OperationState>(() => restore() ?? IDLE)
  const abortRef = useRef(false)
  const confirmRef = useRef<(() => void) | null>(null)

  const update = useCallback((patch: Partial<OperationState>) => {
    setOp(prev => {
      const next = { ...prev, ...patch }
      persist(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    abortRef.current = true
    confirmRef.current?.()
    confirmRef.current = null
    setOp(IDLE)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const waitForWalletConfirm = useCallback((): Promise<void> => {
    return new Promise(resolve => { confirmRef.current = resolve })
  }, [])

  const confirmWalletStep = useCallback(() => {
    confirmRef.current?.()
    confirmRef.current = null
  }, [])

  const startShield = useCallback(async (amount: string, token: string) => {
    abortRef.current = false
    const base: OperationState = { phase: 'preparing', type: 'shield', amount, token, startedAt: Date.now() }
    setOp(base)
    persist(base)

    await delay(600)
    if (abortRef.current) return
    update({ phase: 'awaiting_wallet_step1' })

    await waitForWalletConfirm()
    if (abortRef.current) return
    update({ phase: 'awaiting_wallet_step2' })

    await waitForWalletConfirm()
    if (abortRef.current) return
    update({ phase: 'submitted', txHash: '0xmock_shield_tx' })

    await delay(3000)
    if (abortRef.current) return

    if (Math.random() < 0.2) {
      update({ phase: 'failed_dropped' })
      return
    }

    update({ phase: 'processing' })

    await delay(5000)
    if (abortRef.current) return
    update({ phase: 'finalizing' })

    await delay(4000)
    if (abortRef.current) return
    update({ phase: 'completed' })
  }, [update, waitForWalletConfirm])

  // isShielded: skips finalizing for public token sends (ETH, USDC, DAI)
  const startSend = useCallback(async (amount: string, recipient: string, isShielded: boolean, token: string) => {
    abortRef.current = false
    const base: OperationState = { phase: 'preparing', type: 'send', amount, token, recipient, startedAt: Date.now() }
    setOp(base)
    persist(base)

    await delay(600)
    if (abortRef.current) return
    update({ phase: 'awaiting_wallet_step1' })

    await waitForWalletConfirm()
    if (abortRef.current) return
    update({ phase: 'submitted', txHash: '0xmock_send_tx' })

    await delay(3000)
    if (abortRef.current) return

    if (Math.random() < 0.2) {
      update({ phase: 'failed_submission' })
      return
    }

    update({ phase: 'processing' })

    await delay(4000)
    if (abortRef.current) return

    if (isShielded) {
      update({ phase: 'finalizing' })
      await delay(3000)
      if (abortRef.current) return
    }

    update({ phase: 'completed' })
  }, [update, waitForWalletConfirm])

  const startUnshield = useCallback(async (amount: string, token: string) => {
    abortRef.current = false
    const base: OperationState = { phase: 'preparing', type: 'unshield', amount, token, startedAt: Date.now() }
    setOp(base)
    persist(base)

    await delay(600)
    if (abortRef.current) return
    update({ phase: 'awaiting_wallet_step1' })

    await waitForWalletConfirm()
    if (abortRef.current) return
    update({ phase: 'submitted', txHash: '0xmock_unshield_tx' })

    await delay(2000)
    if (abortRef.current) return
    update({ phase: 'processing' })

    await delay(6000)
    if (abortRef.current) return
    update({ phase: 'proof_ready' })
  }, [update, waitForWalletConfirm])

  const completeUnshield = useCallback(async () => {
    abortRef.current = false
    update({ phase: 'awaiting_wallet_step2' })

    await waitForWalletConfirm()
    if (abortRef.current) return
    update({ phase: 'finalizing' })

    await delay(3000)
    if (abortRef.current) return
    update({ phase: 'completed' })
  }, [update, waitForWalletConfirm])

  const cancel = useCallback(() => {
    abortRef.current = true
    confirmRef.current?.()
    confirmRef.current = null
    update({ phase: 'cancelled' })
  }, [update])

  useEffect(() => {
    return () => { abortRef.current = true }
  }, [])

  return {
    phase: op.phase,
    operationType: op.type,
    amount: op.amount,
    token: op.token,
    recipient: op.recipient,
    startedAt: op.startedAt,
    txHash: op.txHash,
    isActive: op.phase !== 'idle',
    startShield,
    startSend,
    startUnshield,
    completeUnshield,
    confirmWalletStep,
    cancel,
    reset,
  }
}
