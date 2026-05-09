import { forwardRef } from 'react'

type CardProps = React.HTMLAttributes<HTMLDivElement>

export const Card = forwardRef<HTMLDivElement, CardProps>(({ style, children, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      background: 'var(--color-surface-raised)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
))
Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(({ style, children, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '24px 24px 0',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ style, children, ...props }, ref) => (
    <h3
      ref={ref}
      style={{
        margin: 0,
        fontSize: 'var(--text-h5)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-text-primary)',
        lineHeight: 1.3,
        ...style,
      }}
      {...props}
    >
      {children}
    </h3>
  )
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ style, children, ...props }, ref) => (
    <p
      ref={ref}
      style={{
        margin: 0,
        fontSize: 'var(--text-small)',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.5,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  )
)
CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, CardProps>(({ style, children, ...props }, ref) => (
  <div
    ref={ref}
    style={{ padding: '24px', ...style }}
    {...props}
  >
    {children}
  </div>
))
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, CardProps>(({ style, children, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px 24px',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
))
CardFooter.displayName = 'CardFooter'
