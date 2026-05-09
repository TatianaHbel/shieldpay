import { useState, useEffect } from 'react'
import { ShieldCheck, Send as SendIcon, ArrowDown, ExternalLink, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { PhaseIndicator } from './PhaseIndicator'
import { Button } from './Button'
import { TextField } from './TextField'
import type { OperationPhase, OperationType } from '../types/operation'

// ── Props ──────────────────────────────────────────────────────────────────

export interface RightPanelProps {
  phase: OperationPhase
  operationType: OperationType
  amount?: string
  recipient?: string
  publicBalance: string
  shieldedBalance: string
  startedAt?: number
  txHash?: string
  onStartShield: (amount: string) => void
  onStartSend: (amount: string, recipient: string) => void
  onStartUnshield: (amount: string) => void
  onCancel: () => void
  onComplete: () => void
  onDone: () => void
  onOverlayIntensity: (v: 0 | 30 | 50) => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function getOverlayIntensity(phase: OperationPhase): 0 | 30 | 50 {
  if (phase === 'awaiting_wallet_step1' || phase === 'awaiting_wallet_step2' || phase === 'proof_ready') return 50
  if (phase === 'submitted' || phase === 'processing' || phase === 'finalizing') return 30
  return 0
}

function getPhaseIndex(phase: OperationPhase, op: OperationType): number {
  const m: Record<OperationType, Partial<Record<OperationPhase, number>>> = {
    shield: { awaiting_wallet_step1: 0, awaiting_wallet_step2: 1, submitted: 1, processing: 1, finalizing: 2, completed: 3 },
    send: { awaiting_wallet_step1: 0, submitted: 1, processing: 2, finalizing: 2, completed: 3 },
    unshield: { awaiting_wallet_step1: 0, submitted: 1, processing: 1, proof_ready: 2, awaiting_wallet_step2: 2, finalizing: 2, completed: 3 },
  }
  return m[op][phase] ?? 0
}

function elapsed(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  return `${Math.floor(s / 60)} min ago`
}

function truncateAddress(addr: string): string {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

// ── Shared layout primitives ───────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
      {children}
    </div>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-surface-subtle)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      fontSize: 'var(--text-small)',
      color: 'var(--color-text-secondary)',
      lineHeight: 1.6,
      marginBottom: '16px',
    }}>
      {children}
    </div>
  )
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

function FeeTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: '20px' }}>
      {rows.map(r => <FeeRow key={r.label} label={r.label} value={r.value} />)}
    </div>
  )
}

function QuickAmounts({ balance, onSelect }: { balance: string; onSelect: (v: string) => void }) {
  const b = parseFloat(balance) || 0
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
      {[25, 50, 75, 100].map(pct => (
        <button
          key={pct}
          onClick={() => onSelect((b * pct / 100).toFixed(4).replace(/\.?0+$/, '') || '0')}
          style={{
            flex: 1, padding: '6px 0', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-surface)',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            color: 'var(--color-text-secondary)', fontFamily: 'Manrope, sans-serif',
            transition: 'border-color var(--duration-fast), color var(--duration-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-blue)'; e.currentTarget.style.color = 'var(--color-blue)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
        >
          {pct === 100 ? 'Max' : `${pct}%`}
        </button>
      ))}
    </div>
  )
}

function AfterPreview({ rows }: { rows: { label: string; value: string; delta?: string }[] }) {
  return (
    <div style={{ marginBottom: '20px', padding: '10px 12px', background: 'rgba(55,72,255,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(55,72,255,0.1)' }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', lineHeight: 1.8 }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>After · {r.label}</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {r.value} ETH{r.delta ? <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}> ({r.delta})</span> : null}
          </span>
        </div>
      ))}
    </div>
  )
}

function PhaseHeader({ op, amount, phase }: { op: OperationType; amount: string; phase: OperationPhase }) {
  const opLabel = { shield: 'Shielding', send: 'Sending shielded', unshield: 'Unshielding' }[op]
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '14px', letterSpacing: '-0.01em' }}>
        {opLabel} {amount} ETH
      </div>
      <PhaseIndicator phases={[]} currentPhase={getPhaseIndex(phase, op)} operation={op} />
    </div>
  )
}

function ManualOpenLink() {
  return (
    <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
      Not seeing a popup?{' '}
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue)', fontWeight: 600, fontFamily: 'Manrope, sans-serif', fontSize: '12px', padding: 0 }}>
        Open wallet manually
      </button>
    </p>
  )
}

function EtherscanLink({ txHash }: { txHash: string }) {
  return (
    <a
      href={`https://etherscan.io/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'none' }}
    >
      View on Etherscan <ExternalLink size={12} aria-hidden="true" />
    </a>
  )
}

// ── Tab bar ────────────────────────────────────────────────────────────────

const TABS: { id: OperationType; label: string; Icon: typeof ShieldCheck }[] = [
  { id: 'shield', label: 'Shield', Icon: ShieldCheck },
  { id: 'send', label: 'Send', Icon: SendIcon },
  { id: 'unshield', label: 'Unshield', Icon: ArrowDown },
]

function TabBar({ active, onChange }: { active: OperationType; onChange: (id: OperationType) => void }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
      {TABS.map(t => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1, padding: '12px 8px',
              background: 'none', border: 'none', borderBottom: `2px solid ${isActive ? 'var(--color-blue)' : 'transparent'}`,
              cursor: 'pointer', fontSize: 'var(--text-small)', fontWeight: isActive ? 700 : 400,
              color: isActive ? 'var(--color-blue)' : 'var(--color-text-secondary)',
              fontFamily: 'Manrope, sans-serif', marginBottom: '-1px',
              transition: 'color var(--duration-fast), border-color var(--duration-fast)',
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Idle forms ─────────────────────────────────────────────────────────────

function ShieldForm({ publicBalance, shieldedBalance, preparing, onSubmit }: {
  publicBalance: string; shieldedBalance: string; preparing: boolean; onSubmit: (a: string) => void
}) {
  const [amount, setAmount] = useState('')
  const a = parseFloat(amount) || 0
  const pub = parseFloat(publicBalance) || 0
  const shi = parseFloat(shieldedBalance) || 0
  const err = a > pub ? 'Amount exceeds your public balance.' : undefined

  return (
    <div>
      <SectionLabel>From: Public balance · {publicBalance} ETH</SectionLabel>
      <TextField label="Amount" placeholder="0.00" inputMode="decimal" value={amount}
        onChange={e => setAmount(e.target.value)} error={err}
        rightIcon={<span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>ETH</span>}
      />
      <QuickAmounts balance={publicBalance} onSelect={setAmount} />
      <SectionLabel>To: Shielded balance · {shieldedBalance} ETH</SectionLabel>
      <FeeTable rows={[
        { label: 'Network fee', value: '~0.002 ETH' },
        { label: 'Time', value: '~2–3 min' },
        { label: 'Confirmations', value: '2' },
      ]} />
      {a > 0 && !err && (
        <AfterPreview rows={[
          { label: 'Public', value: Math.max(pub - a, 0).toFixed(2), delta: `−${a.toFixed(2)}` },
          { label: 'Shielded', value: (shi + a).toFixed(2), delta: `+${a.toFixed(2)}` },
        ]} />
      )}
      <Button variant="primary" style={{ width: '100%' }} loading={preparing}
        disabled={!amount || a <= 0 || a > pub} onClick={() => onSubmit(amount)}>
        Shield funds
      </Button>
    </div>
  )
}

function SendForm({ shieldedBalance, preparing, onSubmit }: {
  shieldedBalance: string; preparing: boolean; onSubmit: (a: string, r: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const a = parseFloat(amount) || 0
  const shi = parseFloat(shieldedBalance) || 0
  const amtErr = a > shi ? 'Amount exceeds your shielded balance.' : undefined
  const recErr = recipient && !recipient.startsWith('0x') ? 'Enter a valid Ethereum address.' : undefined

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <TextField label="To" placeholder="0x recipient address…" value={recipient}
          onChange={e => setRecipient(e.target.value)} error={recErr}
          hint="The recipient must support shielded tokens."
        />
      </div>
      <SectionLabel>From: Shielded balance · {shieldedBalance} ETH</SectionLabel>
      <TextField label="Amount" placeholder="0.00" inputMode="decimal" value={amount}
        onChange={e => setAmount(e.target.value)} error={amtErr}
        rightIcon={<span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>ETH</span>}
      />
      <QuickAmounts balance={shieldedBalance} onSelect={setAmount} />
      <FeeTable rows={[
        { label: 'Network fee', value: '~0.003 ETH' },
        { label: 'Time', value: '~2–3 min' },
        { label: 'Confirmations', value: '1' },
      ]} />
      {a > 0 && !amtErr && (
        <AfterPreview rows={[
          { label: 'Shielded', value: Math.max(shi - a, 0).toFixed(2), delta: `−${a.toFixed(2)}` },
        ]} />
      )}
      <Button variant="primary" style={{ width: '100%' }} loading={preparing}
        disabled={!amount || a <= 0 || a > shi || !recipient.startsWith('0x')}
        onClick={() => onSubmit(amount, recipient)}>
        Send shielded
      </Button>
    </div>
  )
}

function UnshieldForm({ publicBalance, shieldedBalance, preparing, onSubmit }: {
  publicBalance: string; shieldedBalance: string; preparing: boolean; onSubmit: (a: string) => void
}) {
  const [amount, setAmount] = useState('')
  const a = parseFloat(amount) || 0
  const pub = parseFloat(publicBalance) || 0
  const shi = parseFloat(shieldedBalance) || 0
  const err = a > shi ? 'Amount exceeds your shielded balance.' : undefined

  return (
    <div>
      <SectionLabel>From: Shielded balance · {shieldedBalance} ETH</SectionLabel>
      <TextField label="Amount" placeholder="0.00" inputMode="decimal" value={amount}
        onChange={e => setAmount(e.target.value)} error={err}
        rightIcon={<span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>ETH</span>}
      />
      <QuickAmounts balance={shieldedBalance} onSelect={setAmount} />
      <SectionLabel>To: Public balance · {publicBalance} ETH</SectionLabel>
      <FeeTable rows={[
        { label: 'Network fee', value: '~0.005 ETH' },
        { label: 'Time', value: '~3–5 min' },
        { label: 'Confirmations', value: '2 — with a wait' },
      ]} />
      {a > 0 && !err && (
        <AfterPreview rows={[
          { label: 'Public', value: (pub + a).toFixed(2), delta: `+${a.toFixed(2)}` },
          { label: 'Shielded', value: Math.max(shi - a, 0).toFixed(2), delta: `−${a.toFixed(2)}` },
        ]} />
      )}
      <Button variant="primary" style={{ width: '100%' }} loading={preparing}
        disabled={!amount || a <= 0 || a > shi} onClick={() => onSubmit(amount)}>
        Unshield funds
      </Button>
    </div>
  )
}

// ── Phase views ────────────────────────────────────────────────────────────

interface PhaseViewProps {
  op: OperationType; amount: string; phase: OperationPhase
  recipient?: string; startedAt?: number; txHash?: string
  onCancel: () => void; onComplete: () => void; onDone: () => void
  publicBalance: string; shieldedBalance: string
}

function WalletConfirmView({ op, amount, phase, recipient, onCancel }: PhaseViewProps) {
  const isStep2 = phase === 'awaiting_wallet_step2'

  const getSubtitle = () => {
    if (op === 'send') return null
    if (op === 'shield') return isStep2 ? 'Step 2 of 2 — Move funds' : 'Step 1 of 2 — Authorization'
    return isStep2 ? 'Step 2 of 2 — Release funds' : 'Step 1 of 2 — Remove from shielded balance'
  }

  const getSummary = () => {
    if (op === 'shield' && !isStep2)
      return `Authorizing ShieldPay to move ${amount} ETH from your public balance.\nFee: ~0.002 ETH (~$4.70)`
    if (op === 'shield' && isStep2)
      return `Approving transfer of ${amount} ETH to shielded balance.\nFee: ~0.003 ETH (~$7.05)`
    if (op === 'send')
      return `Sending ${amount} ETH shielded to ${recipient ? truncateAddress(recipient) : '…'}\nFee: ~0.003 ETH (~$7.05)`
    if (op === 'unshield' && !isStep2)
      return `Removing ${amount} ETH from your shielded balance.\nFee: ~0.002 ETH (~$4.70)`
    return `Releasing ${amount} ETH to your public balance.\nFee: ~0.003 ETH (~$7.05)`
  }

  const getNote = () => {
    if (op === 'shield' && !isStep2)
      return 'Your wallet will show a balance decrease — this is correct. Shielded balance updates after the operation completes.'
    if (op === 'send')
      return 'The transaction amount is private. Only you and the recipient can see it.'
    if (op === 'unshield' && !isStep2)
      return 'After confirming, your shielded balance will decrease. A second confirmation releases the funds to your public balance.'
    return null
  }

  const subtitle = getSubtitle()
  const note = getNote()

  return (
    <div>
      <PhaseHeader op={op} amount={amount} phase={phase} />
      <h3 style={{ margin: '0 0 4px', fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Confirm in your wallet
      </h3>
      {subtitle && (
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{subtitle}</p>
      )}
      <InfoBox>
        {getSummary()?.split('\n').map((line, i) => <div key={i}>{line}</div>)}
      </InfoBox>
      {note && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 16px' }}>
          {note}
        </p>
      )}
      <ManualOpenLink />
      <Button variant="ghost" style={{ width: '100%' }} onClick={onCancel}>
        Cancel operation
      </Button>
    </div>
  )
}

function ProcessingView({ op, amount, phase, startedAt, txHash }: PhaseViewProps) {
  const isFinalizing = phase === 'finalizing'
  const isUnshield = op === 'unshield'
  const isSend = op === 'send'

  const heading = (() => {
    if (isFinalizing && !isUnshield) return isSend ? 'Encrypting transfer' : 'Encrypting your balance'
    if (isFinalizing && isUnshield) return 'Releasing to public balance'
    return isUnshield ? 'Preparing release' : 'Moving your funds'
  })()

  const body = (() => {
    if (isFinalizing && !isUnshield && !isSend)
      return 'Your transaction is confirmed. We\'re now encrypting your shielded balance — ~1 min. Your funds are safe. They will appear in your shielded balance once encryption completes.'
    if (isFinalizing && isSend)
      return 'Your transaction is confirmed. The transfer is being encrypted for sender and recipient — ~1 min. Your funds are safe.'
    if (isFinalizing && isUnshield)
      return 'Almost done. Your funds are being transferred to your public balance — ~30 seconds.'
    if (isUnshield)
      return 'Step 1 is complete. We\'re now preparing your funds for release to your public balance. This takes about 1–2 minutes. Your funds are secured.'
    return 'Your transaction is being confirmed on the network. Usually takes 1–2 minutes.'
  })()

  const canClose = isUnshield || isFinalizing || (!isUnshield && !isFinalizing)
  const note = !isUnshield && isFinalizing && !isSend
    ? "You may see this as 'Confirmed' on Etherscan before your balance updates — that's expected."
    : isUnshield && !isFinalizing
    ? "You can close this tab — we'll notify you when Step 2 is ready."
    : 'You can close this tab — your balance updates automatically.'

  return (
    <div>
      <PhaseHeader op={op} amount={amount} phase={phase} />
      <h3 style={{ margin: '0 0 12px', fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {heading}
      </h3>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 12px' }}>
        {body}
      </p>
      {canClose && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 16px' }}>
          {note}
        </p>
      )}
      {startedAt && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
          Started {elapsed(startedAt)}
        </p>
      )}
      {txHash && op !== 'send' && <EtherscanLink txHash={txHash} />}
    </div>
  )
}

function ProofReadyView({ amount, onComplete }: PhaseViewProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Zap size={18} style={{ color: 'var(--color-warning)', animation: 'pulse-badge 1.5s ease-in-out infinite' }} aria-hidden="true" />
        <h3 style={{ margin: 0, fontSize: 'var(--text-heading)', fontWeight: 700, color: 'var(--color-warning)', letterSpacing: '-0.01em' }}>
          Action required
        </h3>
      </div>
      <PhaseIndicator phases={[]} currentPhase={2} operation="unshield" />
      <div style={{ height: '20px' }} />
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 8px' }}>
        Your unshield is ready to complete. One more confirmation will release{' '}
        <strong style={{ color: 'var(--color-text-primary)' }}>{amount} ETH</strong> to your public balance.
      </p>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 24px' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>Your funds are secured.</strong> Complete this step to release them.
      </p>
      <Button variant="primary" style={{ width: '100%' }} onClick={onComplete}>
        Complete unshield →
      </Button>
    </div>
  )
}

function SuccessView({ op, amount, recipient, txHash, publicBalance, shieldedBalance, onDone }: PhaseViewProps) {
  const a = parseFloat(amount) || 0
  const pub = parseFloat(publicBalance) || 0
  const shi = parseFloat(shieldedBalance) || 0

  const heading = { shield: 'Funds shielded', send: 'Transfer sent', unshield: 'Funds unshielded' }[op]

  const rows = op === 'shield'
    ? [
        { label: 'Public balance', value: Math.max(pub - a, 0).toFixed(2), delta: `−${a.toFixed(2)}` },
        { label: 'Shielded balance', value: (shi + a).toFixed(2), delta: `+${a.toFixed(2)}` },
      ]
    : op === 'send'
    ? [{ label: 'Shielded balance', value: Math.max(shi - a, 0).toFixed(2), delta: `−${a.toFixed(2)}` }]
    : [
        { label: 'Public balance', value: (pub + a).toFixed(2), delta: `+${a.toFixed(2)}` },
        { label: 'Shielded balance', value: Math.max(shi - a, 0).toFixed(2), delta: `−${a.toFixed(2)}` },
      ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <CheckCircle size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} aria-hidden="true" />
        <h3 style={{ margin: 0, fontSize: 'var(--text-heading)', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
          {heading}
        </h3>
      </div>
      <PhaseIndicator phases={[]} currentPhase={3} operation={op} />
      <div style={{ height: '20px' }} />

      {op === 'send' && recipient ? (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.55 }}>
          {amount} ETH sent to <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{truncateAddress(recipient)}</span>
        </p>
      ) : (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.55 }}>
          {amount} ETH {op === 'shield' ? 'added to your shielded balance.' : 'added to your public balance.'}
        </p>
      )}

      <div style={{ marginBottom: '16px' }}>
        {rows.map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>{r.label}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
              {r.value} ETH <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>({r.delta})</span>
            </span>
          </div>
        ))}
      </div>

      {op === 'send' && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.55 }}>
          Only you and the recipient can see this transaction.
        </p>
      )}

      {txHash && op !== 'send' && (
        <div style={{ marginBottom: '20px' }}>
          <EtherscanLink txHash={txHash} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="secondary" style={{ flex: 1 }} onClick={onDone}>
          {op === 'send' ? 'Send again' : op === 'unshield' ? 'Unshield more' : 'Shield more'}
        </Button>
        <Button variant="ghost" style={{ flex: 1 }} onClick={onDone}>Done</Button>
      </div>
    </div>
  )
}

function FailedOrCancelledView({ op, phase, onDone }: PhaseViewProps) {
  const isCancelled = phase === 'cancelled' || phase === 'timed_out'
  const opLabel = { shield: 'Shielding', send: 'Sending', unshield: 'Unshielding' }[op]

  const fundSafetyCopy = (() => {
    if (isCancelled) return 'No funds were moved. Your balances are unchanged.'
    if (phase === 'failed_finalization' && op === 'shield')
      return 'Your public balance has been refunded.'
    return 'Your funds are safe — nothing was deducted from your balance.'
  })()

  const failureCopy = (() => {
    if (phase === 'failed_dropped') return 'The transaction didn\'t go through — the network was congested. Retry with the same amount.'
    if (phase === 'failed_submission') return 'The network rejected this transaction. This is usually temporary. Please try again.'
    if (phase === 'failed_finalization') return 'An error occurred while encrypting your balance.'
    return null
  })()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        {isCancelled
          ? null
          : <AlertCircle size={18} style={{ color: 'var(--color-error)', flexShrink: 0 }} aria-hidden="true" />
        }
        <h3 style={{ margin: 0, fontSize: 'var(--text-heading)', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
          {isCancelled ? `${opLabel} cancelled` : 'Something went wrong'}
        </h3>
      </div>

      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 8px' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>{fundSafetyCopy}</strong>
      </p>

      {failureCopy && (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 20px' }}>
          {failureCopy}
        </p>
      )}

      {!failureCopy && <div style={{ height: '16px' }} />}

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="primary" style={{ flex: 1 }} onClick={onDone}>
          {isCancelled ? 'Try again' : 'Try again'}
        </Button>
        {!isCancelled && (
          <Button variant="ghost" style={{ flex: 1 }} onClick={onDone}>Contact support</Button>
        )}
        {isCancelled && (
          <Button variant="ghost" style={{ flex: 1 }} onClick={onDone}>Done</Button>
        )}
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

export function RightPanel({
  phase,
  operationType,
  amount = '0',
  recipient,
  publicBalance,
  shieldedBalance,
  startedAt,
  txHash,
  onStartShield,
  onStartSend,
  onStartUnshield,
  onCancel,
  onComplete,
  onDone,
  onOverlayIntensity,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<OperationType>('shield')

  useEffect(() => {
    onOverlayIntensity(getOverlayIntensity(phase))
  }, [phase, onOverlayIntensity])

  const isIdle = phase === 'idle'
  const isPreparing = phase === 'preparing'
  const isWalletConfirm = phase === 'awaiting_wallet_step1' || phase === 'awaiting_wallet_step2'
  const isProcessing = phase === 'submitted' || phase === 'processing' || phase === 'finalizing'
  const isProofReady = phase === 'proof_ready'
  const isCompleted = phase === 'completed'
  const isFailed = phase.startsWith('failed_')
  const isCancelled = phase === 'cancelled' || phase === 'timed_out'

  const phaseViewProps: PhaseViewProps = {
    op: operationType, amount, phase, recipient, startedAt, txHash,
    onCancel, onComplete, onDone, publicBalance, shieldedBalance,
  }

  return (
    <div style={{
      width: 'var(--layout-right-panel-width)',
      flexShrink: 0,
      background: 'var(--color-surface-raised)',
      borderLeft: '1px solid var(--color-border)',
      overflowY: 'auto',
    }}>
      <div style={{ padding: '24px' }}>

        {/* ── Idle / Preparing: show tab form ───────────────── */}
        {(isIdle || isPreparing) && (
          <>
            <TabBar active={activeTab} onChange={setActiveTab} />
            {activeTab === 'shield' && (
              <ShieldForm
                publicBalance={publicBalance}
                shieldedBalance={shieldedBalance}
                preparing={isPreparing && operationType === 'shield'}
                onSubmit={onStartShield}
              />
            )}
            {activeTab === 'send' && (
              <SendForm
                shieldedBalance={shieldedBalance}
                preparing={isPreparing && operationType === 'send'}
                onSubmit={onStartSend}
              />
            )}
            {activeTab === 'unshield' && (
              <UnshieldForm
                publicBalance={publicBalance}
                shieldedBalance={shieldedBalance}
                preparing={isPreparing && operationType === 'unshield'}
                onSubmit={onStartUnshield}
              />
            )}
          </>
        )}

        {/* ── Wallet confirmation ───────────────────────────── */}
        {isWalletConfirm && <WalletConfirmView {...phaseViewProps} />}

        {/* ── Processing / finalizing ───────────────────────── */}
        {isProcessing && <ProcessingView {...phaseViewProps} />}

        {/* ── Proof ready (unshield) ───────────────────────── */}
        {isProofReady && <ProofReadyView {...phaseViewProps} />}

        {/* ── Completed ─────────────────────────────────────── */}
        {isCompleted && <SuccessView {...phaseViewProps} />}

        {/* ── Failed / cancelled ───────────────────────────── */}
        {(isFailed || isCancelled) && <FailedOrCancelledView {...phaseViewProps} />}
      </div>
    </div>
  )
}
