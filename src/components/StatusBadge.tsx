type StatusVariant = 'processing' | 'success' | 'failed' | 'cancelled' | 'pending' | 'action-required' | 'destructive' | 'outline'

interface StatusBadgeProps {
  variant: StatusVariant
  label?: string
}

const variantConfig: Record<StatusVariant, { bg: string; text: string; dot: string; label: string; pulse?: boolean; border?: string }> = {
  processing: {
    bg: 'rgba(55, 72, 255, 0.12)',
    text: 'var(--color-processing)',
    dot: 'var(--color-processing)',
    label: 'Processing',
  },
  success: {
    bg: 'rgba(5, 150, 105, 0.15)',
    text: 'var(--color-success)',
    dot: 'var(--color-success)',
    label: 'Complete',
  },
  failed: {
    bg: 'rgba(220, 38, 38, 0.15)',
    text: 'var(--color-error)',
    dot: 'var(--color-error)',
    label: 'Failed',
  },
  cancelled: {
    bg: 'rgba(139, 139, 167, 0.15)',
    text: 'var(--color-text-secondary)',
    dot: 'var(--color-text-secondary)',
    label: 'Cancelled',
  },
  pending: {
    bg: 'rgba(139, 139, 167, 0.15)',
    text: 'var(--color-text-secondary)',
    dot: 'var(--color-text-secondary)',
    label: 'Pending',
  },
  'action-required': {
    bg: 'rgba(245, 167, 0, 0.12)',
    text: '#78350F',
    dot: '#78350F',
    label: 'Action required',
    pulse: true,
  },
  destructive: {
    bg: 'rgba(220, 38, 38, 0.15)',
    text: 'var(--color-destructive)',
    dot: 'var(--color-destructive)',
    label: 'Error',
  },
  outline: {
    bg: 'transparent',
    text: 'var(--color-text-secondary)',
    dot: 'var(--color-text-secondary)',
    label: 'Unknown',
    border: '1px solid var(--color-border)',
  },
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  const config = variantConfig[variant]
  const displayLabel = label ?? config.label

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '99px',
        background: config.bg,
        border: config.border ?? 'none',
        fontSize: 'var(--text-small)',
        fontWeight: 500,
        color: config.text,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: config.dot,
          flexShrink: 0,
          animation: config.pulse ? 'pulse-badge 1.5s ease-in-out infinite' : undefined,
        }}
      />
      {displayLabel}
    </span>
  )
}
