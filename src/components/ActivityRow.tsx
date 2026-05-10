import { ShieldCheck, Zap, ExternalLink } from 'lucide-react'
import { Asterisk } from '@phosphor-icons/react'
import type { OperationPhase, OperationType } from '../types/operation'

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'
const DEFAULT_TOKEN = { symbol: 'ETH', imageUrl: `${ICON_BASE}/eth.png` }

interface ActivityRowProps {
  type: OperationType
  token?: { symbol: string; imageUrl: string }
  amount: string
  status: OperationPhase
  date: number
  txHash?: string
  hidden: boolean
  onComplete?: () => void
}

const TYPE_CONFIG: Record<OperationType, {
  directionLabel: Record<'in' | 'out', string>
  defaultDirection: '+' | '-'
}> = {
  shield: {
    directionLabel: { in: 'Shielded in', out: 'Shielded' },
    defaultDirection: '-',
  },
  send: {
    directionLabel: { in: 'Received shielded', out: 'Sent shielded' },
    defaultDirection: '-',
  },
  unshield: {
    directionLabel: { in: 'Unshielded', out: 'Unshielded' },
    defaultDirection: '+',
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

function getRowState(status: OperationPhase): 'complete' | 'in-progress' | 'action-required' {
  if (status === 'proof_ready') return 'action-required'
  if (
    status === 'processing' ||
    status === 'submitted' ||
    status === 'finalizing' ||
    status === 'preparing' ||
    status === 'awaiting_wallet_step1' ||
    status === 'awaiting_wallet_step2'
  ) return 'in-progress'
  return 'complete'
}

function getPhaseLabel(status: OperationPhase, type: OperationType): string {
  const labels: Partial<Record<OperationPhase, string>> = {
    preparing: 'Preparing…',
    awaiting_wallet_step1: 'Waiting for wallet…',
    awaiting_wallet_step2: 'Waiting for wallet…',
    submitted: 'Confirming on-chain…',
    processing: type === 'unshield' ? 'Preparing release…' : 'Confirming on-chain…',
    finalizing: type === 'unshield' ? 'Releasing to public balance…' : 'Encrypting balance…',
    proof_ready: 'Action required',
  }
  return labels[status] ?? ''
}

function ActivityAvatar({
  imageUrl,
  symbol,
  rowState,
  type,
}: {
  imageUrl: string
  symbol: string
  rowState: 'complete' | 'in-progress' | 'action-required'
  type: OperationType
}) {
  const showShieldBadge = rowState === 'complete' && (type === 'shield' || type === 'send')
  const showZapBadge = rowState === 'action-required'
  const isSpinning = rowState === 'in-progress'

  return (
    <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
      <img
        src={imageUrl}
        alt={symbol}
        width={48}
        height={48}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />

      {isSpinning && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2.5px solid var(--color-border)',
            borderTopColor: 'var(--color-processing)',
            animation: 'spin 0.8s linear infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {showShieldBadge && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid var(--color-shielded)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: 'var(--color-shielded)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-surface-raised)',
            }}
          >
            <ShieldCheck size={12} color="#fff" strokeWidth={2.5} aria-hidden />
          </div>
        </>
      )}

      {showZapBadge && (
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            background: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--color-surface-raised)',
            animation: 'pulse-badge 1.5s ease-in-out infinite',
          }}
        >
          <Zap size={11} color="#fff" strokeWidth={2.5} aria-hidden />
        </div>
      )}
    </div>
  )
}

export function ActivityRow({
  type,
  token = DEFAULT_TOKEN,
  amount,
  status,
  date,
  txHash,
  hidden,
  onComplete,
}: ActivityRowProps) {
  const config = TYPE_CONFIG[type]
  const rowState = getRowState(status)
  const isComplete = rowState === 'complete'
  const isInProgress = rowState === 'in-progress'
  const isActionRequired = rowState === 'action-required'

  const rowLabel = isInProgress && type === 'unshield'
    ? 'Unshielding'
    : config.directionLabel['out']

  const dirSign = config.defaultDirection === '-' ? '−' : '+'
  const amountDisplay = `${dirSign}${amount} ${token.symbol}`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <ActivityAvatar
        imageUrl={token.imageUrl}
        symbol={token.symbol}
        rowState={rowState}
        type={type}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 'var(--text-small)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            {rowLabel}
          </span>
          {isInProgress && (
            <span style={{ fontSize: '12px', color: 'var(--color-processing)', fontWeight: 500 }}>
              {getPhaseLabel(status, type)}
            </span>
          )}
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {formatRelativeTime(date)}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        {hidden ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '1px', color: 'var(--color-text-secondary)' }}>
            <Asterisk weight="bold" size={13} />
            <Asterisk weight="bold" size={13} />
            <Asterisk weight="bold" size={13} />
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
            {amountDisplay}
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
