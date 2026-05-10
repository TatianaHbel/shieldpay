import { ShieldCheck, Zap, ExternalLink } from 'lucide-react'
import type { OperationPhase, OperationType } from '../types/operation'

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'
const DEFAULT_TOKEN = { symbol: 'ETH', imageUrl: `${ICON_BASE}/eth.png` }

export interface ActivityRowProps {
  type: OperationType
  token?: { symbol: string; imageUrl: string }
  pairedToken?: { symbol: string; imageUrl: string }
  direction?: 'in' | 'out'
  counterparty?: string
  amount: string
  status: OperationPhase
  date: number
  txHash?: string
  hidden: boolean
  onClick?: () => void
  onComplete?: () => void
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (seconds < 60) return '< 1 min ago'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getRowState(status: OperationPhase): 'complete' | 'in-progress' | 'action-required' | 'failed' {
  if (status === 'proof_ready') return 'action-required'
  if (status.startsWith('failed_') || status === 'cancelled' || status === 'timed_out') return 'failed'
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
    awaiting_wallet_step1: 'Waiting for approval…',
    awaiting_wallet_step2: 'Waiting for approval…',
    submitted: 'Confirming on-chain…',
    processing: type === 'unshield' ? 'Preparing release…' : 'Confirming on-chain…',
    finalizing: type === 'unshield' ? 'Releasing to public balance…' : 'Encrypting balance…',
    proof_ready: 'Action required',
    failed_dropped: 'Failed — network dropped',
    failed_submission: 'Failed — rejected',
    failed_finalization: 'Failed — encryption error',
    cancelled: 'Cancelled',
    timed_out: 'Timed out',
  }
  return labels[status] ?? ''
}

function getRowLabel(type: OperationType, direction: 'in' | 'out', isInProgress: boolean, tokenSymbol: string, amount: string): string {
  const a = `${amount} ${tokenSymbol}`
  if (type === 'shield') return isInProgress ? `Shielding ${a}` : `Shielded ${a}`
  if (type === 'unshield') return isInProgress ? `Unshielding ${a}` : `Unshielded ${a}`
  if (type === 'send') return direction === 'in' ? `Received ${a}` : isInProgress ? `Sending ${a}` : `Sent ${a}`
  return ''
}

function getSubtitle(
  type: OperationType,
  token: { symbol: string },
  pairedToken: { symbol: string } | undefined,
  direction: 'in' | 'out',
  counterparty: string | undefined,
): string | null {
  if ((type === 'shield' || type === 'unshield') && pairedToken) {
    return `${token.symbol} → ${pairedToken.symbol}`
  }
  if (type === 'send' && counterparty) {
    const short = `${counterparty.slice(0, 6)}…${counterparty.slice(-4)}`
    return direction === 'out' ? `To ${short}` : `From ${short}`
  }
  return null
}

// ── Avatars ───────────────────────────────────────────────────────────────

function SingleAvatar({
  imageUrl,
  symbol,
  size = 48,
  border,
  opacity = 1,
}: {
  imageUrl: string
  symbol: string
  size?: number
  border?: string
  opacity?: number
}) {
  return (
    <img
      src={imageUrl}
      alt={symbol}
      width={size}
      height={size}
      style={{
        borderRadius: '50%',
        objectFit: 'cover',
        border: border ?? 'none',
        opacity,
        display: 'block',
      }}
    />
  )
}

function ActivityAvatar({
  token,
  pairedToken,
  rowState,
  type,
}: {
  token: { symbol: string; imageUrl: string }
  pairedToken?: { symbol: string; imageUrl: string }
  rowState: 'complete' | 'in-progress' | 'action-required' | 'failed'
  type: OperationType
}) {
  const isSwap = (type === 'shield' || type === 'unshield') && !!pairedToken
  const isComplete = rowState === 'complete'
  const isInProgress = rowState === 'in-progress'
  const isActionRequired = rowState === 'action-required'

  if (isSwap && isComplete) {
    // Two-token pair: from (left/back) + to (right/front)
    return (
      <div style={{ position: 'relative', width: '56px', height: '48px', flexShrink: 0 }}>
        {/* From token */}
        <div style={{ position: 'absolute', top: '6px', left: 0 }}>
          <SingleAvatar imageUrl={token.imageUrl} symbol={token.symbol} size={34} />
        </div>
        {/* To token — overlaps, has shield badge */}
        <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
          <div style={{ position: 'relative' }}>
            <SingleAvatar
              imageUrl={pairedToken.imageUrl}
              symbol={pairedToken.symbol}
              size={30}
              border="2px solid var(--color-surface-raised)"
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-3px',
                right: '-3px',
                width: '16px',
                height: '16px',
                borderRadius: '5px',
                background: 'var(--color-shielded)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid var(--color-surface-raised)',
              }}
            >
              <ShieldCheck size={9} color="#fff" strokeWidth={2.5} aria-hidden />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Single-token avatar (send, in-progress shield/unshield)
  const showShieldBadge = isComplete && type === 'send'
  const showZapBadge = isActionRequired

  return (
    <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
      <img
        src={token.imageUrl}
        alt={token.symbol}
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

      {isInProgress && (
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

// ── Main component ────────────────────────────────────────────────────────

export function ActivityRow({
  type,
  token = DEFAULT_TOKEN,
  pairedToken,
  direction = 'out',
  counterparty,
  amount,
  status,
  date,
  txHash,
  hidden,
  onClick,
  onComplete,
}: ActivityRowProps) {
  const rowState = getRowState(status)
  const isComplete = rowState === 'complete'
  const isInProgress = rowState === 'in-progress'
  const isActionRequired = rowState === 'action-required'
  const isFailed = rowState === 'failed'

  const rowLabel = getRowLabel(type, direction, isInProgress || isActionRequired, token.symbol, amount)
  const subtitle = getSubtitle(type, token, pairedToken, direction, counterparty)

  // Primary: always outgoing (what left the user's balance)
  const primarySign = direction === 'in' ? '+' : '−'
  const primaryAmount = `${primarySign}${amount} ${token.symbol}`

  // Paired: shown only on completed swaps (what arrived)
  const showPaired = isComplete && !!pairedToken
  const pairedAmount = showPaired ? `+${amount} ${pairedToken!.symbol}` : null

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      onMouseEnter={onClick ? (e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-subtle)' } : undefined}
      onMouseLeave={onClick ? (e) => { (e.currentTarget as HTMLElement).style.background = '' } : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderBottom: '1px solid var(--color-border)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background var(--duration-fast)',
      }}
    >
      <ActivityAvatar
        token={token}
        pairedToken={pairedToken}
        rowState={rowState}
        type={type}
      />

      {/* Info column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: label + phase label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: subtitle ? '2px' : '3px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-small)', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
            {rowLabel}
          </span>
          {(isInProgress || isActionRequired) && (
            <span style={{ fontSize: '12px', color: 'var(--color-processing)', fontWeight: 500 }}>
              {getPhaseLabel(status, type)}
            </span>
          )}
          {isFailed && (
            <span style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 500 }}>
              {getPhaseLabel(status, type)}
            </span>
          )}
        </div>

        {/* Row 2: subtitle (token pair or counterparty) */}
        {subtitle && (
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '2px', fontVariantNumeric: 'tabular-nums' }}>
            {subtitle}
          </div>
        )}

        {/* Row 3: time */}
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {formatRelativeTime(date)}
        </span>
      </div>

      {/* Amount column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        {hidden ? (
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px', letterSpacing: '3px', fontWeight: 700 }}>
            ••••
          </span>
        ) : (
          <>
            <span
              style={{
                fontSize: 'var(--text-small)',
                fontWeight: 600,
                color: isActionRequired ? '#78350F' : isFailed ? 'var(--color-error)' : 'var(--color-text-primary)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.2,
              }}
            >
              {primaryAmount}
            </span>
            {pairedAmount && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--color-success)',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1.2,
                }}
              >
                {pairedAmount}
              </span>
            )}
          </>
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
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              textDecoration: 'none',
            }}
            aria-label="View on Etherscan"
          >
            <ExternalLink size={11} />
            Etherscan
          </a>
        )}
      </div>
    </div>
  )
}
