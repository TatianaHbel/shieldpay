import { useState, useCallback, useRef, useEffect } from 'react'
import type { OperationPhase, OperationType, ActiveOperation } from '../types/operation'

const STORAGE_KEY = 'shieldpay_active_operation'

interface OperationState {
  phase: OperationPhase
  type: OperationType
  amount: string
  recipient?: string
  startedAt: number
  txHash?: string
}

const IDLE: OperationState = {
  phase: 'idle',
  type: 'shield',
  amount: '',
  startedAt: 0,
}

function delay(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms))
}

function persist(op: OperationState) {
  if (op.phase === 'idle') {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    const saved: ActiveOperation = {
      type: op.type,
      phase: op.phase,
      amount: op.amount,
      startedAt: op.startedAt,
      ...(op.txHash ? { unwrapTxHash: op.txHash } : {}),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  }
}

function restore(): OperationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved: ActiveOperation = JSON.parse(raw)
    const interruptiblePhases: OperationPhase[] = ['processing', 'proof_ready', 'interrupted']
    if (!interruptiblePhases.includes(saved.phase)) return null
    return {
      phase: saved.phase === 'proof_ready' ? 'proof_ready' : 'interrupted',
      type: saved.type,
      amount: saved.amount,
      startedAt: saved.startedAt,
      txHash: saved.unwrapTxHash,
    }
  } catch {
    return null
  }
}

export function useOperation() {
  const [op, setOp] = useState<OperationState>(() => {
    const saved = restore()
    return saved ?? IDLE
  })

  const abortRef = useRef(false)

  const update = useCallback((patch: Partial<OperationState>) => {
    setOp(prev => {
      const next = { ...prev, ...patch }
      persist(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    abortRef.current = true
    setOp(IDLE)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const startShield = useCallback(async (amount: string) => {
    abortRef.current = false
    const base: OperationState = { phase: 'preparing', type: 'shield', amount, startedAt: Date.now() }
    setOp(base)
    persist(base)

    await delay(1200)
    if (abortRef.current) return
    update({ phase: 'awaiting_wallet_step1' })

    await delay(2500)
    if (abortRef.current) return
    update({ phase: 'awaiting_wallet_step2' })

    await delay(2500)
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
  }, [update])

  const startSend = useCallback(async (amount: string, recipient: string) => {
    abortRef.current = false
    const base: OperationState = { phase: 'preparing', type: 'send', amount, recipient, startedAt: Date.now() }
    setOp(base)
    persist(base)

    await delay(1200)
    if (abortRef.current) return
    update({ phase: 'awaiting_wallet_step1' })

    await delay(2500)
    if (abortRef.current) return
    update({ phase: 'submitted' })

    await delay(3000)
    if (abortRef.current) return

    if (Math.random() < 0.2) {
      update({ phase: 'failed_submission' })
      return
    }

    update({ phase: 'processing' })

    await delay(4000)
    if (abortRef.current) return
    update({ phase: 'finalizing' })

    await delay(3000)
    if (abortRef.current) return
    update({ phase: 'completed' })
  }, [update])

  const startUnshield = useCallback(async (amount: string) => {
    abortRef.current = false
    const base: OperationState = { phase: 'preparing', type: 'unshield', amount, startedAt: Date.now() }
    setOp(base)
    persist(base)

    await delay(1200)
    if (abortRef.current) return
    update({ phase: 'awaiting_wallet_step1' })

    await delay(2500)
    if (abortRef.current) return
    update({ phase: 'submitted', txHash: '0xmock_unshield_tx' })

    await delay(2000)
    if (abortRef.current) return
    update({ phase: 'processing' })

    await delay(6000)
    if (abortRef.current) return
    update({ phase: 'proof_ready' })
  }, [update])

  const completeUnshield = useCallback(async () => {
    abortRef.current = false
    update({ phase: 'awaiting_wallet_step2' })

    await delay(2500)
    if (abortRef.current) return
    update({ phase: 'finalizing' })

    await delay(3000)
    if (abortRef.current) return
    update({ phase: 'completed' })
  }, [update])

  const cancel = useCallback(() => {
    abortRef.current = true
    update({ phase: 'cancelled' })
    setTimeout(() => {
      setOp(IDLE)
      localStorage.removeItem(STORAGE_KEY)
    }, 3000)
  }, [update])

  useEffect(() => {
    return () => { abortRef.current = true }
  }, [])

  return {
    phase: op.phase,
    operationType: op.type,
    amount: op.amount,
    recipient: op.recipient,
    startedAt: op.startedAt,
    txHash: op.txHash,
    isActive: op.phase !== 'idle',
    startShield,
    startSend,
    startUnshield,
    completeUnshield,
    cancel,
    reset,
  }
}
