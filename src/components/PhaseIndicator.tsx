import type { OperationType } from '../types/operation'

interface PhaseIndicatorProps {
  phases: string[]
  currentPhase: number
  operation: OperationType
}

const OPERATION_PHASES: Record<OperationType, string[]> = {
  shield: ['Auth', 'Confirm', 'Encrypt', 'Done'],
  send: ['Confirm', 'Submitted', 'Confirming', 'Done'],
  unshield: ['Step 1', 'Wait', 'Step 2', 'Done'],
}

export function PhaseIndicator({ phases, currentPhase, operation }: PhaseIndicatorProps) {
  const labels = phases.length > 0 ? phases : OPERATION_PHASES[operation]

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, width: '100%' }}>
      {labels.map((label, i) => {
        const isDone = i < currentPhase
        const isCurrent = i === currentPhase
        const isLast = i === labels.length - 1

        return (
          <div
            key={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '20px' }}>
              {i > 0 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: isDone || isCurrent
                      ? 'var(--color-shielded)'
                      : 'var(--color-border)',
                    transition: 'background 0.3s ease',
                  }}
                />
              )}
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
                }}
              />
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: isDone ? 'var(--color-shielded)' : 'var(--color-border)',
                    transition: 'background 0.3s ease',
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: '11px',
                color: isDone || isCurrent
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
                marginTop: '6px',
                fontWeight: isCurrent ? 600 : 400,
                textAlign: 'center',
                transition: 'color 0.3s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
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
