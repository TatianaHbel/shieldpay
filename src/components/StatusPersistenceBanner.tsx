import { useEffect, useState } from 'react'
import { Clock, CheckCircle, AlertCircle, Zap, X } from 'lucide-react'
import type { OperationPhase, OperationType } from '../types/operation'

export interface StatusPersistenceBannerProps {
  phase: OperationPhase
  operation: OperationType
  amount: string
  startedAt: number
  onView: () => void
  onDismiss?: () => void
}

type BannerVariant = 'processing' | 'action-required' | 'completed' | 'failed'

function getBannerVariant(phase: OperationPhase): BannerVariant | null {
  if (phase === 'idle') return null
  if (phase === 'completed') return 'completed'
  if (phase === 'proof_ready' || phase === 'interrupted') return 'action-required'
  if (
    phase === 'failed_submission' ||
    phase === 'failed_dropped' ||
    phase === 'failed_finalization' ||
    phase === 'cancelled' ||
    phase === 'timed_out'
  )
    return 'failed'
  return 'processing'
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 minute ago'
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  return `${hours} hour${hours > 1 ? 's' : ''} ago`
}

const OPERATION_LABEL: Record<OperationType, string> = {
  shield: 'Shielding',
  send: 'Sending',
  unshield: 'Unshielding',
}

const VARIANT_CONFIG = {
  processing: {
    bg: 'rgba(3,105,161,0.06)',
    border: 'rgba(3,105,161,0.2)',
    Icon: Clock,
    iconColor: 'var(--color-processing)',
    dismissable: false,
    pulse: false,
  },
  'action-required': {
    bg: 'rgba(180,83,9,0.06)',
    border: 'rgba(180,83,9,0.25)',
    Icon: Zap,
    iconColor: '#78350F',
    dismissable: false,
    pulse: true,
  },
  completed: {
    bg: 'rgba(21,128,61,0.06)',
    border: 'rgba(21,128,61,0.2)',
    Icon: CheckCircle,
    iconColor: 'var(--color-success)',
    dismissable: true,
    pulse: false,
  },
  failed: {
    bg: 'rgba(185,28,28,0.06)',
    border: 'rgba(185,28,28,0.2)',
    Icon: AlertCircle,
    iconColor: 'var(--color-error)',
    dismissable: true,
    pulse: false,
  },
}

export function StatusPersistenceBanner({
  phase,
  operation,
  amount,
  startedAt,
  onView,
  onDismiss,
}: StatusPersistenceBannerProps) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startedAt)
  const variant = getBannerVariant(phase)

  useEffect(() => {
    const t = setInterval(() => setElapsed(Date.now() - startedAt), 30_000)
    return () => clearInterval(t)
  }, [startedAt])

  if (!variant) return null

  const cfg = VARIANT_CONFIG[variant]
  const { Icon } = cfg
  const opLabel = OPERATION_LABEL[operation]

  const title = (() => {
    if (variant === 'processing') return `${opLabel} ${amount} ETH in progress`
    if (variant === 'action-required')
      return phase === 'interrupted'
        ? 'Unshield paused — action required'
        : 'Action required: Your unshield is ready'
    if (variant === 'completed')
      return `${opLabel} complete — ${amount} ETH ${operation === 'shield' ? 'shielded' : operation === 'unshield' ? 'released' : 'sent'}`
    if (phase === 'cancelled' || phase === 'timed_out')
      return `${opLabel} cancelled — no funds were moved`
    return `${opLabel} failed — your funds are safe`
  })()

  const ctaLabel = variant === 'action-required' ? 'Complete →' : 'View →'

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 'var(--radius-md)',
        animation: 'fade-in var(--duration-normal) var(--ease-out)',
      }}
    >
      <Icon
        size={16}
        style={{
          color: cfg.iconColor,
          flexShrink: 0,
          animation: cfg.pulse ? 'pulse-badge 1.5s ease-in-out infinite' : undefined,
        }}
        aria-hidden="true"
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Started {formatElapsed(elapsed)}
        </div>
      </div>

      <button
        onClick={onView}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--text-small)',
          fontWeight: 700,
          color: cfg.iconColor,
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
          fontFamily: 'Manrope, sans-serif',
          transition: 'opacity var(--duration-fast) var(--ease-out)',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {ctaLabel}
      </button>

      {cfg.dismissable && onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss banner"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
