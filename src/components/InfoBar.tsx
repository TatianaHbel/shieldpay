import { useEffect, useState } from 'react'
import { Clock, CheckCircle, AlertCircle, TriangleAlert, ArrowRight, X } from 'lucide-react'
import type { OperationPhase, OperationType } from '../types/operation'

export interface InfoBarProps {
  phase: OperationPhase
  operation: OperationType
  amount: string
  token?: string
  startedAt: number
  onView: () => void
  onDismiss?: () => void
}

type BannerVariant = 'processing' | 'action-required' | 'completed' | 'failed'

function getBannerVariant(phase: OperationPhase): BannerVariant | null {
  if (phase === 'idle') return null
  if (phase === 'completed') return 'completed'
  if (
    phase === 'awaiting_wallet_step1' ||
    phase === 'awaiting_wallet_step2' ||
    phase === 'proof_ready' ||
    phase === 'interrupted'
  ) return 'action-required'
  if (
    phase === 'failed_submission' ||
    phase === 'failed_dropped' ||
    phase === 'failed_finalization' ||
    phase === 'cancelled' ||
    phase === 'timed_out'
  ) return 'failed'
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
    bg: 'rgba(55, 72, 255, 0.07)',
    border: 'none',
    borderLeft: '2px solid #3748FF',
    Icon: Clock,
    iconColor: '#3748FF',
    iconSize: 16,
    titleColor: '#1A1F6E',
    subtitleColor: '#5B65CC',
    dismissable: false,
    pulse: false,
    filledCta: false,
    ctaBg: '',
    ctaColor: '',
  },
  'action-required': {
    bg: 'rgba(255, 235, 105, 0.3)',
    border: 'none',
    borderLeft: '2px solid #FFB74D',
    Icon: TriangleAlert,
    iconColor: '#FFB74D',
    iconSize: 18,
    titleColor: '#3A341C',
    subtitleColor: '#D1AC45',
    dismissable: false,
    pulse: true,
    filledCta: true,
    ctaBg: '#EBBB00',
    ctaColor: '#FFF9D2',
  },
  completed: {
    bg: 'rgba(91, 184, 30, 0.08)',
    border: 'none',
    borderLeft: '2px solid #5BB81E',
    Icon: CheckCircle,
    iconColor: '#5BB81E',
    iconSize: 16,
    titleColor: '#1C4A08',
    subtitleColor: '#4A8C16',
    dismissable: true,
    pulse: false,
    filledCta: false,
    ctaBg: '',
    ctaColor: '',
  },
  failed: {
    bg: 'rgba(185, 28, 28, 0.07)',
    border: 'none',
    borderLeft: '2px solid #B91C1C',
    Icon: AlertCircle,
    iconColor: '#B91C1C',
    iconSize: 16,
    titleColor: '#7F1212',
    subtitleColor: '#C53030',
    dismissable: true,
    pulse: false,
    filledCta: false,
    ctaBg: '',
    ctaColor: '',
  },
}

export function InfoBar({
  phase,
  operation,
  amount,
  token,
  startedAt,
  onView,
  onDismiss,
}: InfoBarProps) {
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
  const tokenLabel = token ? ` ${token}` : ''
  const amountToken = `${amount}${tokenLabel}`

  const title = (() => {
    if (variant === 'processing') {
      if (phase === 'finalizing') {
        if (operation === 'shield') return `Encrypting ${amountToken} into your shielded balance`
        if (operation === 'unshield') return `Releasing ${amountToken} to your public balance`
        return `Encrypting transfer of ${amountToken}`
      }
      return `${opLabel} ${amountToken} in progress`
    }
    if (variant === 'action-required') {
      if (phase === 'interrupted' || phase === 'proof_ready') return `Action required - complete your unshield of ${amountToken}`
      // awaiting_wallet_step1 or step2
      return `Approve in your wallet - ${opLabel.toLowerCase()} ${amountToken}`
    }
    if (variant === 'completed') {
      const outcome = operation === 'shield' ? 'shielded' : operation === 'unshield' ? 'released' : 'sent'
      return `${opLabel} complete - ${amountToken} ${outcome}`
    }
    // failed
    if (phase === 'cancelled' || phase === 'timed_out') return `${opLabel} cancelled - no funds were moved`
    return `${opLabel} failed - your funds are safe`
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
        border: cfg.border,
        borderLeft: cfg.borderLeft,
        animation: 'fade-in var(--duration-normal) var(--ease-out)',
      }}
    >
      <Icon
        size={cfg.iconSize}
        style={{
          color: cfg.iconColor,
          flexShrink: 0,
          animation: cfg.pulse ? 'pulse-badge 1.5s ease-in-out infinite' : undefined,
        }}
        aria-hidden="true"
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: cfg.titleColor, lineHeight: 1.4 }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: cfg.subtitleColor, marginTop: '2px' }}>
          Started {formatElapsed(elapsed)}
        </div>
      </div>

      {cfg.filledCta ? (
        <button
          onClick={onView}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: cfg.ctaBg,
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            color: cfg.ctaColor,
            padding: '8px 10px',
            borderRadius: '4px',
            height: '28px',
            flexShrink: 0,
            fontFamily: 'Manrope, sans-serif',
            transition: 'opacity var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Complete
          <ArrowRight size={12} />
        </button>
      ) : (
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
      )}

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
