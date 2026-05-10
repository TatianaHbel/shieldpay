import { Shield, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react'
import { Button } from './Button'

export type ConnectState =
  | 'landing'
  | 'wallet-selector'
  | 'connecting'
  | 'eip712-setup'
  | 'eip712-active'
  | 'error'

export type WalletName = 'MetaMask' | 'Rabby' | 'WalletConnect'

export type ConnectError =
  | 'not-installed'
  | 'rejected'
  | 'eip712-rejected'
  | 'wrong-network'

export interface ConnectWalletCardProps {
  state: ConnectState
  selectedWallet?: WalletName
  error?: ConnectError
  onConnect: (wallet: WalletName) => void
  onBack: () => void
  onCancel: () => void
  onEnableShielded: () => void
  onSkipShielded: () => void
  onDashboard: () => void
  onRetry: () => void
}

const WALLETS: { name: WalletName; icon: string }[] = [
  { name: 'MetaMask', icon: '🦊' },
  { name: 'Rabby', icon: '🐰' },
  { name: 'WalletConnect', icon: '🔗' },
]

const ERROR_CONFIG: Record<ConnectError, { title: string; desc: string; cta: string; action: 'retry' | 'dashboard' }> = {
  'not-installed': {
    title: "MetaMask isn't installed",
    desc: 'Install it to continue.',
    cta: 'Install MetaMask →',
    action: 'retry',
  },
  rejected: {
    title: 'Connection cancelled',
    desc: 'No changes were made.',
    cta: 'Try again',
    action: 'retry',
  },
  'eip712-rejected': {
    title: 'Setup cancelled',
    desc: 'You can enable shielded access later from the Shielded section.',
    cta: 'Go to dashboard →',
    action: 'dashboard',
  },
  'wrong-network': {
    title: 'Wrong network',
    desc: 'ShieldPay runs on Ethereum Mainnet. Switch your network to continue.',
    cta: 'Switch network',
    action: 'retry',
  },
}

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--color-surface-raised)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  padding: '32px',
  width: '340px',
  boxShadow: 'var(--shadow-md)',
}

const SPINNER_STYLE = (color: string): React.CSSProperties => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '3px solid var(--color-border)',
  borderTopColor: color,
  animation: 'spin 0.8s linear infinite',
  margin: '0 auto 20px',
})

function ManualOpenLink({ wallet }: { wallet?: string }) {
  return (
    <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
      Not seeing a popup?{' '}
      <button
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-blue)',
          fontWeight: 600,
          fontFamily: 'Manrope, sans-serif',
          fontSize: '12px',
          padding: 0,
        }}
      >
        Open {wallet ?? 'wallet'} manually
      </button>
    </p>
  )
}

export function ConnectWalletCard({
  state,
  selectedWallet,
  error,
  onConnect,
  onBack,
  onCancel,
  onEnableShielded,
  onSkipShielded,
  onDashboard,
  onRetry,
}: ConnectWalletCardProps) {
  if (state === 'landing') {
    return (
      <div style={CARD_STYLE}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(55,72,255,0.1)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Shield size={24} style={{ color: 'var(--color-blue)' }} />
          </div>
          <h2
            style={{
              margin: '0 0 6px',
              fontSize: 'var(--text-heading)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Connect your wallet
          </h2>
          <p style={{ margin: 0, fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
            No new account needed.
          </p>
        </div>
        <Button variant="primary" style={{ width: '100%' }} onClick={() => onConnect('MetaMask')}>
          Connect wallet
        </Button>
        <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          Supports MetaMask · Rabby · WalletConnect
        </p>
      </div>
    )
  }

  if (state === 'wallet-selector') {
    return (
      <div style={CARD_STYLE}>
        <h2
          style={{
            margin: '0 0 20px',
            fontSize: 'var(--text-heading)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Choose your wallet
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {WALLETS.map(w => (
            <button
              key={w.name}
              onClick={() => onConnect(w.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--text-small)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontFamily: 'Manrope, sans-serif',
                textAlign: 'left',
                transition: 'border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-blue)'
                e.currentTarget.style.background = 'rgba(55,72,255,0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.background = 'var(--color-surface)'
              }}
            >
              <span style={{ fontSize: '20px' }}>{w.icon}</span>
              {w.name}
            </button>
          ))}
        </div>
        <Button variant="ghost" leftIcon={<ChevronLeft size={14} />} onClick={onBack}>
          Back
        </Button>
      </div>
    )
  }

  if (state === 'connecting') {
    return (
      <div style={CARD_STYLE}>
        <div style={{ textAlign: 'center', paddingBottom: '8px' }}>
          <div style={SPINNER_STYLE('var(--color-blue)')} />
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--text-heading)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Connecting to {selectedWallet ?? 'wallet'}
          </h2>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            Check your browser extension for a connection request.
          </p>
          <ManualOpenLink wallet={selectedWallet} />
        </div>
        <Button variant="ghost" style={{ width: '100%' }} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    )
  }

  if (state === 'eip712-setup') {
    return (
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-success)', fontWeight: 600 }}>
            Wallet connected
          </span>
        </div>
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: 'var(--text-heading)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
          }}
        >
          One more step to enable shielded transactions.
        </h2>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
          }}
        >
          Your wallet will ask you to sign.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
          {['This is free - no network fee.', 'You only need to do this once.'].map(item => (
            <div
              key={item}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}
            >
              <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span>
              {item}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button variant="primary" style={{ width: '100%' }} onClick={onEnableShielded}>
            Enable shielded access →
          </Button>
          <Button variant="ghost" style={{ width: '100%' }} onClick={onSkipShielded}>
            Skip for now
          </Button>
        </div>
      </div>
    )
  }

  if (state === 'eip712-active') {
    return (
      <div style={CARD_STYLE}>
        <div style={{ textAlign: 'center', paddingBottom: '8px' }}>
          <div style={SPINNER_STYLE('var(--color-shielded)')} />
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--text-heading)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Setting up shielded access...
          </h2>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            Check your wallet for a signature request.
          </p>
          <ManualOpenLink wallet={selectedWallet} />
        </div>
        <Button variant="ghost" style={{ width: '100%' }} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    )
  }

  if (state === 'error' && error) {
    const cfg = ERROR_CONFIG[error]
    return (
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {cfg.title}
            </h2>
            <p style={{ margin: 0, fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              {cfg.desc}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            variant="primary"
            style={{ width: '100%' }}
            onClick={cfg.action === 'dashboard' ? onDashboard : onRetry}
          >
            {cfg.cta}
          </Button>
          <Button variant="ghost" style={{ width: '100%' }} onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  return null
}
