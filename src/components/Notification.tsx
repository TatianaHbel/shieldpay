import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

export type NotificationVariant = 'info' | 'success' | 'warning' | 'error'

export interface NotificationItem {
  id: string
  message: string
  variant: NotificationVariant
  action?: { label: string; onClick: () => void }
  duration?: number
}

const ICONS: Record<NotificationVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
}

const ICON_COLORS: Record<NotificationVariant, string> = {
  info: 'var(--color-processing)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
}

function NotificationCard({
  item,
  onDismiss,
}: {
  item: NotificationItem
  onDismiss: (id: string) => void
}) {
  const [paused, setPaused] = useState(false)
  // UIPlaybook: 4s standard, 10s actionable
  const duration = item.duration ?? (item.action ? 10000 : 4000)
  const isUrgent = item.variant === 'error'

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => onDismiss(item.id), duration)
    return () => clearTimeout(t)
  }, [paused, item.id, duration, onDismiss])

  const Icon = ICONS[item.variant]

  return (
    <div
      className="sp-notification"
      role={isUrgent ? 'alert' : 'status'}
      aria-live={isUrgent ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Icon size={16} style={{ color: ICON_COLORS[item.variant], flexShrink: 0 }} aria-hidden="true" />

      <span className="sp-notification__message">{item.message}</span>

      {item.action && (
        <button
          className="sp-notification__action"
          onClick={() => {
            item.action!.onClick()
            onDismiss(item.id)
          }}
        >
          {item.action.label}
        </button>
      )}

      <button
        className="sp-notification__close"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function NotificationContainer({
  items,
  onDismiss,
}: {
  items: NotificationItem[]
  onDismiss: (id: string) => void
}) {
  // UIPlaybook: max 3 in stack
  const visible = items.slice(-3)

  return (
    <div className="sp-notification-container" aria-label="Notifications">
      {visible.map(item => (
        <NotificationCard key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([])

  const add = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9)
    setItems(prev => [...prev.slice(-2), { ...notification, id }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setItems(prev => prev.filter(n => n.id !== id))
  }, [])

  return { items, add, dismiss }
}
