interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

const HEIGHT: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: '4px',
  md: '8px',
  lg: '12px',
}

const TRACK_COLOR: Record<NonNullable<ProgressBarProps['variant']>, string> = {
  default: 'var(--color-blue)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  destructive: 'var(--color-destructive)',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <span style={{ fontSize: 'var(--text-small)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        style={{
          width: '100%',
          height: HEIGHT[size],
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface-subtle)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 'var(--radius-full)',
            background: TRACK_COLOR[variant],
            transition: 'width var(--duration-slow) var(--ease-out)',
          }}
        />
      </div>
    </div>
  )
}
