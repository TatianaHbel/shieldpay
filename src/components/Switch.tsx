interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  id?: string
}

export function Switch({ checked, onChange, disabled = false, label, id }: SwitchProps) {
  const switchId = id ?? `switch-${Math.random().toString(36).slice(2, 7)}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button
        id={switchId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          width: '44px',
          height: '24px',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: checked ? 'var(--color-blue)' : 'var(--color-border)',
          transition: 'background var(--duration-normal) var(--ease-out)',
          padding: '2px',
          flexShrink: 0,
          outline: 'none',
          opacity: disabled ? 0.4 : 1,
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(55, 72, 255, 0.2)`
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <span
          style={{
            display: 'block',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: 'var(--shadow-sm)',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform var(--duration-normal) var(--ease-out)',
          }}
        />
      </button>
      {label && (
        <label
          htmlFor={switchId}
          style={{
            fontSize: 'var(--text-small)',
            color: disabled ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            fontWeight: 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
          }}
        >
          {label}
        </label>
      )}
    </div>
  )
}
