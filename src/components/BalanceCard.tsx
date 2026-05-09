import { Eye, EyeOff, ShieldCheck, Wallet } from 'lucide-react'
import { Asterisk } from '@phosphor-icons/react'

interface BalanceCardProps {
  type: 'public' | 'shielded'
  amount: string
  currency: string
  hidden: boolean
  delta?: string
  onToggleHidden?: () => void
  usdValue?: string
}

export function BalanceCard({
  type,
  amount,
  currency,
  hidden,
  delta,
  onToggleHidden,
  usdValue,
}: BalanceCardProps) {
  const isPublic = type === 'public'
  const accentColor = isPublic ? 'var(--color-public)' : 'var(--color-shielded)'
  const Icon = isPublic ? Wallet : ShieldCheck

  const isHidden = !isPublic && hidden
  const displayUsd = isHidden ? null : usdValue

  const isDeltaPositive = delta?.startsWith('+')
  const isDeltaNegative = delta?.startsWith('−') || delta?.startsWith('-')

  return (
    <div
      style={{
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: 'var(--space-5)',
        flex: 1,
        minWidth: 0,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Icon
            size={16}
            style={{ color: accentColor, flexShrink: 0 }}
          />
          <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {isPublic ? 'Public balance' : 'Shielded balance'}
          </span>
        </div>
        {!isPublic && onToggleHidden && (
          <button
            onClick={onToggleHidden}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={hidden ? 'Show shielded balance' : 'Hide shielded balance'}
          >
            {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', minHeight: '40px' }}>
        {isHidden ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-text-secondary)' }}>
            <Asterisk weight="bold" size={16} />
            <Asterisk weight="bold" size={16} />
            <Asterisk weight="bold" size={16} />
          </span>
        ) : (
          <>
            <span
              style={{
                fontSize: 'var(--text-display)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.5px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {amount}
            </span>
            <span style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {currency}
            </span>
          </>
        )}
      </div>

      {displayUsd && (
        <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: delta ? 'var(--space-2)' : 0 }}>
          {displayUsd}
        </div>
      )}

      {delta && (
        <div
          style={{
            fontSize: 'var(--text-small)',
            fontWeight: 600,
            color: isDeltaPositive
              ? 'var(--color-success)'
              : isDeltaNegative
              ? 'var(--color-error)'
              : 'var(--color-text-secondary)',
            marginTop: 'var(--space-1)',
          }}
        >
          {delta}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 'var(--space-3)',
          right: 'var(--space-3)',
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: `${accentColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: accentColor }}>
          {currency.slice(0, 3)}
        </span>
      </div>
    </div>
  )
}
