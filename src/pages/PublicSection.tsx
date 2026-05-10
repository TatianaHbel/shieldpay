import { BalanceCard } from '../components/BalanceCard'
import { ActivityRow } from '../components/ActivityRow'
import { Button } from '../components/Button'
import { useDrawer } from '../context/DrawerContext'

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'
const ETH_TOKEN = { symbol: 'ETH', imageUrl: `${ICON_BASE}/eth.png` }

interface PublicSectionProps {
  publicBalance: string
}

const now = Date.now()
const MOCK_ACTIVITY = [
  { id: '1', type: 'shield' as const, token: ETH_TOKEN, amount: '0.50', status: 'completed' as const, date: now - 86400000, txHash: '0xabc123' },
  { id: '2', type: 'unshield' as const, token: ETH_TOKEN, amount: '0.20', status: 'completed' as const, date: now - 432000000, txHash: '0xdef456' },
]

export function PublicSection({ publicBalance }: PublicSectionProps) {
  const { openDrawer } = useDrawer()
  const isEmpty = parseFloat(publicBalance) === 0
  const usdValue = `$${(parseFloat(publicBalance) * 2351.12).toFixed(2)}`

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '64px auto 0' }}>
      <h1 style={{ fontSize: '34px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '24px' }}>
        Public balance
      </h1>

      <div style={{ marginBottom: '40px' }}>
        <BalanceCard
          type="public"
          amount={publicBalance}
          currency="ETH"
          hidden={false}
          usdValue={usdValue}
        />

        {isEmpty ? (
          <div style={{ marginTop: '20px', padding: '24px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Your public balance is empty.<br />
              Unshield funds to move them here, or receive ETH to get started.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Button variant="primary" size="md" onClick={() => openDrawer('unshield')}>Unshield →</Button>
              <Button variant="secondary" size="md" onClick={() => openDrawer('receive')}>Receive</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Button variant="primary" size="md" onClick={() => openDrawer('shield')}>Shield funds →</Button>
            <Button variant="secondary" size="md" onClick={() => openDrawer('receive')}>Add funds</Button>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
        Activity
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {MOCK_ACTIVITY.map(row => (
          <ActivityRow
            key={row.id}
            type={row.type}
            amount={row.amount}
            status={row.status}
            date={row.date}
            txHash={row.txHash}
            hidden={false}
          />
        ))}
      </div>
    </div>
  )
}
