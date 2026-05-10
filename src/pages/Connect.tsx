import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { ConnectWalletCard } from '../components/ConnectWalletCard'
import type { ConnectState, WalletName } from '../components/ConnectWalletCard'

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

interface ConnectProps {
  onConnected: () => void
}

export function Connect({ onConnected }: ConnectProps) {
  const [state, setState] = useState<ConnectState>('landing')
  const [selectedWallet, setSelectedWallet] = useState<WalletName | undefined>()
  const navigate = useNavigate()

  const handleConnect = async (wallet: WalletName) => {
    setSelectedWallet(wallet)
    setState('connecting')
    await delay(2000)
    setState('eip712-setup')
  }

  const handleEnableShielded = async () => {
    setState('eip712-active')
    await delay(2000)
    onConnected()
    navigate('/')
  }

  const handleSkipShielded = () => {
    onConnected()
    navigate('/')
  }

  const handleDashboard = () => {
    onConnected()
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-surface)',
      padding: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={18} color="#fff" />
        </div>
        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.4px' }}>
          ShieldPay
        </span>
      </div>

      <ConnectWalletCard
        state={state}
        selectedWallet={selectedWallet}
        onConnect={handleConnect}
        onBack={() => setState('landing')}
        onCancel={() => setState('landing')}
        onEnableShielded={handleEnableShielded}
        onSkipShielded={handleSkipShielded}
        onDashboard={handleDashboard}
        onRetry={() => setState('landing')}
      />
    </div>
  )
}
