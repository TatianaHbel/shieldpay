import { Check } from 'lucide-react'
import type { OperationType } from '../types/operation'

interface PhaseIndicatorVerticalProps {
  phases: string[]
  currentPhase: number
  operation: OperationType
  timestamps?: (string | null | undefined)[]
  currentDescription?: string
  currentNote?: string
  variant?: 'progress' | 'complete'
}

const OPERATION_PHASES: Record<OperationType, string[]> = {
  shield:   ['Authorize', 'Shield', 'Encrypting', 'Done'],
  send:     ['Confirm', 'Submitted', 'Processing', 'Done'],
  unshield: ['Unshield', 'Confirming', 'Releasing', 'Done'],
}

export function PhaseIndicatorVertical({
  phases,
  currentPhase,
  operation,
  timestamps,
  currentDescription,
  currentNote,
  variant = 'progress',
}: PhaseIndicatorVerticalProps) {
  const labels = phases.length > 0 ? phases : OPERATION_PHASES[operation]
  const isComplete = variant === 'complete'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {labels.map((label, i) => {
        const isDone = i < currentPhase
        const isCurrent = i === currentPhase
        const isLast = i === labels.length - 1
        const ts = timestamps?.[i]
        const hasExtraContent = isCurrent && (currentDescription || currentNote)

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Dot + connector column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
              {isComplete ? (
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'var(--color-success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '1px',
                }}>
                  <Check size={11} color="#fff" strokeWidth={2.5} aria-hidden />
                </div>
              ) : (
                <div style={{
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
                }} />
              )}
              {!isLast && (
                <div style={{
                  width: '2px',
                  flex: 1,
                  minHeight: '24px',
                  background: isComplete
                    ? 'rgba(21,128,61,0.25)'
                    : isDone
                    ? 'var(--color-shielded)'
                    : 'var(--color-border)',
                  transition: 'background 0.3s ease',
                  marginTop: '4px',
                  marginBottom: '4px',
                }} />
              )}
            </div>

            {/* Content column */}
            <div style={{
              paddingBottom: isLast ? 0 : (hasExtraContent ? '16px' : '24px'),
              flex: 1,
            }}>
              <span style={{
                fontSize: '13px',
                color: (isDone || isCurrent || isComplete)
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
                fontWeight: (isCurrent || isComplete) ? 600 : 400,
                transition: 'color 0.3s ease',
                lineHeight: '1.4',
                display: 'block',
              }}>
                {label}
              </span>
              {(isDone || isComplete) && ts && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {ts}
                </div>
              )}
              {isCurrent && currentDescription && (
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '6px 0 0', padding: 0 }}>
                  {currentDescription}
                </p>
              )}
              {isCurrent && currentNote && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '6px 0 0', padding: 0 }}>
                  {currentNote}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
