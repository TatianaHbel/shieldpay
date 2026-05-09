import { Zap } from 'lucide-react'
import { Button } from './Button'

export interface NavigationWarningProps {
  urgency: 'soft' | 'urgent'
  onStay: () => void
  onLeave: () => void
}

export function NavigationWarning({ urgency, onStay, onLeave }: NavigationWarningProps) {
  const isUrgent = urgency === 'urgent'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nav-warning-title"
      style={{
        background: 'var(--color-surface-raised)',
        border: `1px solid ${isUrgent ? 'rgba(180,83,9,0.3)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '400px',
        animation: 'fade-in var(--duration-normal) var(--ease-out)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        {isUrgent && (
          <Zap
            size={16}
            style={{ color: 'var(--color-warning)', flexShrink: 0 }}
            aria-hidden="true"
          />
        )}
        <h3
          id="nav-warning-title"
          style={{
            margin: 0,
            fontSize: 'var(--text-heading)',
            fontWeight: 700,
            color: isUrgent ? 'var(--color-warning)' : 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
          }}
        >
          {isUrgent
            ? 'Your unshield needs one more step'
            : 'Your unshield is still in progress'}
        </h3>
      </div>

      <p
        style={{
          margin: '0 0 24px',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.65,
        }}
      >
        {isUrgent
          ? "Step 2 is ready. If you leave now, your funds stay secured but won't be released until you return."
          : "If you leave now, your unshield will be paused. You'll need to return to complete Step 2 and release your funds. Your funds are secured while you're away."}
      </p>

      <div style={{ display: 'flex', gap: '10px' }}>
        <Button variant={isUrgent ? 'primary' : 'secondary'} onClick={onStay}>
          {isUrgent ? 'Complete now' : 'Stay'}
        </Button>
        <Button variant="ghost" onClick={onLeave}>
          Leave anyway
        </Button>
      </div>
    </div>
  )
}
