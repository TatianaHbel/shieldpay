import { BalanceCard } from '../components/BalanceCard'
import { ActivityRow } from '../components/ActivityRow'
import { Button } from '../components/Button'
import { useDrawer } from '../context/DrawerContext'
import { MOCK_ACTIVITY } from '../mocks/activityMocks'
import type { MockActivityEntry } from '../mocks/activityMocks'

interface ShieldedSectionProps {
  shieldedBalance: string
  shieldedHidden: boolean
  onToggleShielded: () => void
}

function useRowClick() {
  const { openDrawerReplay } = useDrawer()
  return (row: MockActivityEntry) => {
    if (row.type === 'send' && row.direction === 'in') return undefined
    return () => openDrawerReplay({ action: row.type, phase: row.status, amount: row.amount, txHash: row.txHash, recipient: row.counterparty })
  }
}

export function ShieldedSection({ shieldedBalance, shieldedHidden, onToggleShielded }: ShieldedSectionProps) {
  const { openDrawer } = useDrawer()
  const getRowClick = useRowClick()
  const isEmpty = parseFloat(shieldedBalance) === 0
  const usdValue = `$${(parseFloat(shieldedBalance) * 2351.12).toFixed(2)}`

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '64px auto 0' }}>
      <h1 style={{ fontSize: '34px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '24px' }}>
        Shielded balance
      </h1>

      <div style={{ marginBottom: '40px' }}>
        <BalanceCard
          type="shielded"
          amount={shieldedBalance}
          currency="ETH"
          hidden={shieldedHidden}
          usdValue={usdValue}
          onToggleHidden={onToggleShielded}
        />

        {isEmpty ? (
          <div style={{ marginTop: '20px', padding: '24px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Your shielded balance is empty.<br />
              Shield funds to start using private transactions.
            </p>
            <Button variant="primary" size="md" onClick={() => openDrawer('shield')}>Shield funds →</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Button variant="primary" size="md" onClick={() => openDrawer('send')}>Send →</Button>
            <Button variant="secondary" size="md" onClick={() => openDrawer('unshield')}>Unshield →</Button>
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
            token={row.token}
            pairedToken={row.pairedToken}
            direction={row.direction}
            counterparty={row.counterparty}
            amount={row.amount}
            status={row.status}
            date={row.date}
            txHash={row.txHash}
            hidden={shieldedHidden}
            onClick={getRowClick(row)}
            onComplete={row.status === 'proof_ready' ? () => {} : undefined}
          />
        ))}
      </div>
    </div>
  )
}
