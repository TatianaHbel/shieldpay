import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  iconOnly?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconOnly = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const classes = [
      'sp-btn',
      `sp-btn--${variant}`,
      `sp-btn--${size}`,
      iconOnly ? 'sp-btn--icon-only' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="sp-btn__spinner" aria-hidden="true" />
        ) : leftIcon ? (
          <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
            {leftIcon}
          </span>
        ) : null}

        {children !== undefined && (
          <span>{children}</span>
        )}

        {!loading && rightIcon && (
          <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
