import { useState } from 'react'
import { Send, Download, ShieldCheck, ShieldOff } from 'lucide-react'
import type { DrawerAction } from '../context/DrawerContext'

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        height: '40px',
        borderRadius: '12px',
        background: hovered ? 'var(--color-surface-raised)' : 'var(--color-surface-subtle)',
        border: '1px solid',
        borderColor: hovered ? 'var(--color-blue)' : 'transparent',
        cursor: 'pointer',
        padding: '0 16px',
        fontFamily: 'Manrope, sans-serif',
        transition: 'background var(--duration-fast), border-color var(--duration-fast)',
      }}
    >
      <div style={{ color: hovered ? 'var(--color-blue)' : 'var(--color-text-primary)', display: 'flex', transition: 'color var(--duration-fast)' }}>
        {icon}
      </div>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: hovered ? 'var(--color-blue)' : 'var(--color-text-primary)',
          transition: 'color var(--duration-fast)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  )
}

interface ActionButtonRowProps {
  onAction: (action: DrawerAction) => void
}

export function ActionButtonRow({ onAction }: ActionButtonRowProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ActionButton
        icon={<Send size={16} />}
        label="Send"
        onClick={() => onAction('send')}
      />
      <ActionButton
        icon={<Download size={16} />}
        label="Receive"
        onClick={() => onAction('receive')}
      />
      <ActionButton
        icon={<ShieldCheck size={16} />}
        label="Shield"
        onClick={() => onAction('shield')}
      />
      <ActionButton
        icon={<ShieldOff size={16} />}
        label="Unshield"
        onClick={() => onAction('unshield')}
      />
    </div>
  )
}
