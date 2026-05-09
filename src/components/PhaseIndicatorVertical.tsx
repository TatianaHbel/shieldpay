import type { OperationType } from '../types/operation'

interface PhaseIndicatorVerticalProps {
  phases: string[]
  currentPhase: number
  operation: OperationType
}

const OPERATION_PHASES: Record<OperationType, string[]> = {
  shield: ['Auth', 'Confirm', 'Encrypt', 'Done'],
  send: ['Confirm', 'Submit', 'Encrypt', 'Done'],
  unshield: ['Step 1', 'Wait', 'Step 2', 'Done'],
}

export function PhaseIndicatorVertical({ phases, currentPhase, operation }: PhaseIndicatorVerticalProps) {
  const labels = phases.length > 0 ? phases : OPERATION_PHASES[operation]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {labels.map((label, i) => {
        const isDone = i < currentPhase
        const isCurrent = i === currentPhase
        const isLast = i === labels.length - 1

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Dot + connector column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
              <div
                style={{
                  width: isCurrent ? '12px' : '8px',
                  height: isCurrent ? '12px' : '8px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: isDone
                    ? 'var(--color-shielded)'
                    : isCurrent
                    ? 'var(--color-text-primary)'
                    : 'var(--color-border)',
                  border: isCurrent ? '2px solid var(--color-shielded)' : 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? '0 0 0 3px rgba(109, 40, 217, 0.2)' : 'none',
                  marginTop: '2px',
                }}
              />
              {!isLast && (
                <div
                  style={{
                    width: '2px',
                    flex: 1,
                    minHeight: '24px',
                    background: isDone ? 'var(--color-shielded)' : 'var(--color-border)',
                    transition: 'background 0.3s ease',
                    marginTop: '4px',
                    marginBottom: '4px',
                  }}
                />
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: '13px',
                color: isDone || isCurrent
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
                fontWeight: isCurrent ? 600 : 400,
                transition: 'color 0.3s ease',
                paddingTop: '1px',
                paddingBottom: isLast ? 0 : '28px',
                lineHeight: '1.4',
              }}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
