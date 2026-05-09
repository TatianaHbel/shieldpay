import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  bordered?: boolean
  accessibilityLabel?: string
}

export function Table({ children, bordered = false, accessibilityLabel }: TableProps) {
  return (
    <div
      style={{ overflowX: 'auto', width: '100%' }}
      role="region"
      aria-label={accessibilityLabel}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: bordered ? '1px solid var(--color-border)' : 'none',
          borderRadius: bordered ? 'var(--radius-lg)' : undefined,
          overflow: 'hidden',
        }}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableFooter({ children }: { children: ReactNode }) {
  return <tfoot>{children}</tfoot>
}

interface TableRowProps {
  children: ReactNode
  hoverable?: boolean
}

export function TableRow({ children, hoverable = false }: TableRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      style={{
        background: hoverable && hovered ? 'var(--color-surface-subtle)' : 'transparent',
        transition: 'background var(--duration-fast) var(--ease-out)',
      }}
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
    >
      {children}
    </tr>
  )
}

interface TableCellProps {
  children?: ReactNode
  title?: string
  subtitle?: string
  start?: ReactNode
  width?: string
  alignItems?: CSSProperties['alignItems']
  justifyContent?: CSSProperties['justifyContent']
  direction?: 'column' | 'row'
  colSpan?: number
  asHeader?: boolean
}

export function TableCell({
  children,
  title,
  subtitle,
  start,
  width,
  alignItems,
  justifyContent,
  direction = 'column',
  colSpan,
  asHeader = false,
}: TableCellProps) {
  const Tag = asHeader ? 'th' : 'td'

  const inner =
    children !== undefined ? (
      <div
        style={{
          display: 'flex',
          flexDirection: direction,
          alignItems: alignItems ?? (direction === 'row' ? 'center' : 'flex-start'),
          justifyContent,
          gap: direction === 'row' ? '8px' : '3px',
        }}
      >
        {children}
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent }}>
        {start}
        {(title || subtitle) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            {title && (
              <span
                style={{
                  fontSize: asHeader ? '11px' : 'var(--text-small)',
                  fontWeight: asHeader ? 700 : 500,
                  color: asHeader ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                  textTransform: asHeader ? 'uppercase' : undefined,
                  letterSpacing: asHeader ? '0.07em' : undefined,
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </span>
            )}
            {subtitle && !asHeader && (
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    )

  return (
    <Tag
      colSpan={colSpan}
      style={{
        padding: asHeader ? '10px 16px' : '14px 16px',
        borderBottom: '1px solid var(--color-border)',
        width,
        verticalAlign: 'middle',
        textAlign: 'left',
        background: asHeader ? 'var(--color-surface-subtle)' : 'transparent',
        fontWeight: 'normal',
      }}
    >
      {inner}
    </Tag>
  )
}
