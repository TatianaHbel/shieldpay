import { useId } from 'react'

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  required?: boolean
}

export function TextField({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  required,
  disabled,
  readOnly,
  id: idProp,
  className,
  ...props
}: TextFieldProps) {
  const generated = useId()
  const id = idProp ?? generated
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const hasError = Boolean(error)
  const describedBy = [hasError ? errorId : hint ? hintId : ''].filter(Boolean).join(' ') || undefined

  const wrapClass = [
    'sp-field__wrap',
    leftIcon ? 'sp-field__wrap--left-icon' : '',
    rightIcon ? 'sp-field__wrap--right-icon' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const inputClass = [
    'sp-field__input',
    hasError ? 'sp-field__input--error' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="sp-field">
      <label htmlFor={id} className="sp-field__label">
        {label}
        {required && (
          <span className="sp-field__required" aria-hidden="true">
            {' '}*
          </span>
        )}
      </label>

      <div className={wrapClass}>
        {leftIcon && (
          <span className="sp-field__icon sp-field__icon--left" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <input
          id={id}
          className={inputClass}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          {...props}
        />

        {rightIcon && (
          <span className="sp-field__icon sp-field__icon--right" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>

      {hasError ? (
        <span id={errorId} className="sp-field__error">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="sp-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
