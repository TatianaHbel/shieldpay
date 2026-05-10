import { Eye, EyeOff, ShieldCheck, Wallet } from 'lucide-react'
import { Asterisk } from '@phosphor-icons/react'

interface TokenAvatar {
  symbol: string
  imageUrl: string
}

interface BalanceCardProps {
  type: 'public' | 'shielded'
  amount: string
  currency: string
  hidden: boolean
  delta?: string
  onToggleHidden?: () => void
  usdValue?: string
  tokenAvatars?: TokenAvatar[]
}

function StackedAvatars({ avatars }: { avatars: TokenAvatar[] }) {
  const visible = avatars.slice(0, 3)
  const overflow = avatars.length - visible.length

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((avatar, i) => (
        <img
          key={avatar.symbol}
          src={avatar.imageUrl}
          alt={avatar.symbol}
          width={22}
          height={22}
          style={{
            borderRadius: '50%',
            border: '2px solid var(--color-surface-raised)',
            marginLeft: i === 0 ? 0 : -8,
            position: 'relative',
            zIndex: visible.length - i,
            objectFit: 'cover',
          }}
        />
      ))}
      {overflow > 0 && (
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'var(--color-surface)',
            border: '2px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -8,
            fontSize: '9px',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}

export function BalanceCard({
  type,
  amount,
  currency,
  hidden,
  delta,
  onToggleHidden,
  usdValue,
  tokenAvatars,
}: BalanceCardProps) {
  const isPublic = type === 'public'
  const accentColor = isPublic ? 'var(--color-public)' : 'var(--color-shielded)'
  const Icon = isPublic ? Wallet : ShieldCheck

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
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Icon size={16} style={{ color: accentColor, flexShrink: 0 }} />
          <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {isPublic ? 'Public balance' : 'Shielded balance'}
          </span>
        </div>
        {onToggleHidden && (
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
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
          >
            {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>

      {/* Amount row - fixed height so toggling never shifts layout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', height: '40px', overflow: 'hidden' }}>
        {hidden ? (
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
                lineHeight: 1,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.5px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {amount}
            </span>
            {currency && (
              <span style={{ fontSize: 'var(--text-body)', lineHeight: 1, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {currency}
              </span>
            )}
          </>
        )}
      </div>

      {/* Secondary line - always in DOM at fixed height; invisible when hidden */}
      <div
        style={{
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          fontSize: 'var(--text-small)',
          lineHeight: 1,
          color: 'var(--color-text-secondary)',
          marginBottom: delta ? 'var(--space-2)' : 0,
          visibility: hidden || !usdValue ? 'hidden' : 'visible',
        }}
      >
        {usdValue ?? ' '}
      </div>

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {tokenAvatars ? (
          <StackedAvatars avatars={tokenAvatars} />
        ) : (
          <div
            style={{
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
        )}
      </div>
    </div>
  )
}
