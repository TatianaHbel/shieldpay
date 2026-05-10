import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { BalanceCard } from '../components/BalanceCard'
import { ActivityRow } from '../components/ActivityRow'
import { TokenTable } from '../components/TokenTable'
import { ActionButtonRow } from '../components/ActionButtonRow'
import { useDrawer } from '../context/DrawerContext'
import { MOCK_ACTIVITY, IN_PROGRESS_STATUSES } from '../mocks/activityMocks'

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'

const PUBLIC_AVATARS = [
  { symbol: 'ETH',  imageUrl: `${ICON_BASE}/eth.png`  },
  { symbol: 'USDC', imageUrl: `${ICON_BASE}/usdc.png` },
  { symbol: 'DAI',  imageUrl: `${ICON_BASE}/dai.png`  },
]

const SHIELDED_AVATARS = [
  { symbol: 'ETH',  imageUrl: `${ICON_BASE}/eth.png`  },
  { symbol: 'USDC', imageUrl: `${ICON_BASE}/usdc.png` },
  { symbol: 'DAI',  imageUrl: `${ICON_BASE}/dai.png`  },
]

interface OverviewProps {
  publicBalance: string
  shieldedBalance: string
  shieldedHidden: boolean
  onToggleShielded: () => void
}

type BottomTab = 'tokens' | 'activity' | 'in-progress'

function BottomTabBar({ active, onChange }: { active: BottomTab; onChange: (t: BottomTab) => void }) {
  const tabs: { id: BottomTab; label: string }[] = [
    { id: 'tokens',      label: 'Tokens' },
    { id: 'activity',    label: 'Recent activity' },
    { id: 'in-progress', label: 'In-progress' },
  ]
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
      {tabs.map(t => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              padding: '10px 0',
              marginRight: '24px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${isActive ? 'var(--color-blue)' : 'transparent'}`,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-blue)' : 'var(--color-text-secondary)',
              fontFamily: 'Manrope, sans-serif',
              marginBottom: '-1px',
              transition: 'color var(--duration-fast), border-color var(--duration-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

export function Overview({ shieldedHidden, onToggleShielded }: OverviewProps) {
  const { openDrawer } = useDrawer()
  const [bottomTab, setBottomTab] = useState<BottomTab>('tokens')

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '64px auto 0' }}>
      {/* Page header: title + eye left, action buttons right */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            Portfolio
          </h1>
          <button
            onClick={onToggleShielded}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={shieldedHidden ? 'Show all balances' : 'Hide all balances'}
          >
            {shieldedHidden ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <ActionButtonRow onAction={openDrawer} />
      </div>

      {/* Balance cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <BalanceCard
            type="public"
            amount="$17,203"
            currency=""
            hidden={shieldedHidden}
            usdValue="5.19 ETH"
            tokenAvatars={PUBLIC_AVATARS}
          />
        </div>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <BalanceCard
            type="shielded"
            amount="$6,225"
            currency=""
            hidden={shieldedHidden}
            usdValue="1.88 ETH"
            tokenAvatars={SHIELDED_AVATARS}
          />
        </div>
      </div>

      {/* Tabbed bottom section */}
      <BottomTabBar active={bottomTab} onChange={setBottomTab} />

      {bottomTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {MOCK_ACTIVITY.map(row => (
            <ActivityRow
              key={row.id}
              type={row.type}
              token={row.token}
              amount={row.amount}
              status={row.status}
              date={row.date}
              txHash={row.txHash}
              hidden={shieldedHidden}
            />
          ))}
        </div>
      )}

      {bottomTab === 'tokens' && (
        <TokenTable hidden={shieldedHidden} />
      )}

      {bottomTab === 'in-progress' && (() => {
        const active = MOCK_ACTIVITY.filter(r => IN_PROGRESS_STATUSES.has(r.status))
        if (active.length === 0) {
          return (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                No operations in progress
              </span>
            </div>
          )
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {active.map(row => (
              <ActivityRow
                key={row.id}
                type={row.type}
                token={row.token}
                amount={row.amount}
                status={row.status}
                date={row.date}
                txHash={row.txHash}
                hidden={shieldedHidden}
                onComplete={row.status === 'proof_ready' ? () => {} : undefined}
              />
            ))}
          </div>
        )
      })()}
    </div>
  )
}
