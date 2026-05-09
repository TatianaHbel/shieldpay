import { ShieldCheck, ArrowUpRight, ArrowDownLeft, ExternalLink, Zap } from 'lucide-react'
import { Asterisk } from '@phosphor-icons/react'
import type { OperationPhase, OperationType } from '../types/operation'

interface ActivityRowProps {
  type: OperationType
  amount: string
  status: OperationPhase
  date: number
  txHash?: string
  hidden: boolean
  onComplete?: () => void
}

const TYPE_CONFIG: Record<OperationType, { label: string; icon: typeof ShieldCheck; directionLabel: Record<'in' | 'out', string> }> = {
  shield: {
    label: 'Shielded',
    icon: ShieldCheck,
    directionLabel: { in: 'Shielded in', out: 'Shielded' },
  },
  send: {
    label: 'Sent shielded',
    icon: ArrowUpRight,
    directionLabel: { in: 'Received shielded', out: 'Sent shielded' },
  },
  unshield: {
    label: 'Unshielded',
    icon: ArrowDownLeft,
    directionLabel: { in: 'Unshielded', out: 'Unshielding' },
  },
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getRowState(status: OperationPhase): 'complete' | 'in-progress' | 'action-required' | 'decrypting' {
  if (status === 'completed') return 'complete'
  if (status === 'proof_ready') return 'action-required'
  if (status === 'processing' || status === 'submitted' || status === 'finalizing' || status === 'preparing' || status === 'awaiting_wallet_step1' || status === 'awaiting_wallet_step2') return 'in-progress'
  return 'complete'
}

function getPhaseLabel(status: OperationPhase, type: OperationType): string {
  const labels: Partial<Record<OperationPhase, string>> = {
    preparing: 'Preparing…',
    awaiting_wallet_step1: 'Awaiting wallet…',
    awaiting_wallet_step2: 'Awaiting wallet…',
    submitted: 'Submitted…',
    processing: type === 'unshield' ? 'Waiting for proof…' : 'Confirming…',
    finalizing: 'Encrypting…',
    proof_ready: 'Action required',
  }
  return labels[status] ?? ''
}

function Spinner() {
  return (
    <div
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '2.5px solid var(--color-border)',
        borderTopColor: 'var(--color-processing)',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

export function ActivityRow({ type, amount, status, date, txHash, hidden, onComplete }: ActivityRowProps) {
  const config = TYPE_CONFIG[type]
  const rowState = getRowState(status)
  const isComplete = rowState === 'complete'
  const isInProgress = rowState === 'in-progress'
  const isActionRequired = rowState === 'action-required'

  const isHiddenAmount = hidden && type !== 'unshield'
  const displayAmount = isHiddenAmount ? null : `${amount} ETH`
  const dirKey = type === 'unshield' ? 'out' : 'out'
  const rowLabel = isInProgress && type === 'unshield' ? 'Unshielding' : config.directionLabel[dirKey]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Leading element — 64×64 circular, no background */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isInProgress ? (
          <Spinner />
        ) : isActionRequired ? (
          <Zap
            size={28}
            style={{
              color: '#78350F',
              animation: 'pulse-badge 1.5s ease-in-out infinite',
            }}
          />
        ) : (
          <config.icon
            size={28}
            style={{ color: 'var(--color-text-secondary)' }}
          />
        )}
      </div>

      {/* Content — primary (heading) + phase label + timestamp */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 'var(--text-heading)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            {rowLabel}
          </span>
          {isInProgress && (
            <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-processing)', fontWeight: 500 }}>
              {getPhaseLabel(status, type)}
            </span>
          )}
        </div>
        <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          {formatRelativeTime(date)}
        </span>
      </div>

      {/* Trailing — amount stacked above action/link */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        {isHiddenAmount ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-text-secondary)' }}>
            <Asterisk weight="bold" size={16} />
            <Asterisk weight="bold" size={16} />
            <Asterisk weight="bold" size={16} />
          </span>
        ) : (
          <span
            style={{
              fontSize: 'var(--text-small)',
              fontWeight: 600,
              color: isActionRequired ? '#78350F' : 'var(--color-text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {displayAmount}
          </span>
        )}

        {isActionRequired && onComplete && (
          <button
            onClick={onComplete}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #78350F',
              background: 'rgba(245, 167, 0, 0.10)',
              color: '#78350F',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Complete →
          </button>
        )}

        {isComplete && txHash && (
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-text-secondary)', display: 'flex' }}
            aria-label="View on Etherscan"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  )
}
