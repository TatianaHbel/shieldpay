import { useState, useEffect } from 'react'
import { ExternalLink, Zap, CheckCircle, AlertCircle, AlertTriangle, X, QrCode, ArrowLeft, ArrowDown, ChevronDown, Check, ShieldCheck, Copy } from 'lucide-react'
import { PhaseIndicatorVertical } from './PhaseIndicatorVertical'
import { Button } from './Button'
import { TextField } from './TextField'
import type { OperationPhase, OperationType } from '../types/operation'
import type { DrawerAction } from '../context/DrawerContext'

// ── Token data ─────────────────────────────────────────────────────────────

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'

interface TokenOption {
  symbol: string
  name: string
  imageUrl: string
  balance: string
  pairedSymbol: string
  isShielded: boolean
}

const PUBLIC_TOKENS: TokenOption[] = [
  { symbol: 'ETH',  name: 'Ethereum',      imageUrl: `${ICON_BASE}/eth.png`,  balance: '4.2831',  pairedSymbol: 'cETH',  isShielded: false },
  { symbol: 'USDC', name: 'USD Coin',       imageUrl: `${ICON_BASE}/usdc.png`, balance: '2500.00', pairedSymbol: 'cUSDC', isShielded: false },
  { symbol: 'DAI',  name: 'Dai Stablecoin', imageUrl: `${ICON_BASE}/dai.png`,  balance: '500.00',  pairedSymbol: 'cDAI',  isShielded: false },
]

const SHIELDED_TOKENS: TokenOption[] = [
  { symbol: 'cETH',  name: 'Shielded Ethereum', imageUrl: `${ICON_BASE}/eth.png`,  balance: '1.5000',  pairedSymbol: 'ETH',  isShielded: true },
  { symbol: 'cUSDC', name: 'Shielded USD Coin',  imageUrl: `${ICON_BASE}/usdc.png`, balance: '1000.00', pairedSymbol: 'USDC', isShielded: true },
  { symbol: 'cDAI',  name: 'Shielded Dai',       imageUrl: `${ICON_BASE}/dai.png`,  balance: '250.00',  pairedSymbol: 'cDAI', isShielded: true },
]

const ALL_TOKENS = [...PUBLIC_TOKENS, ...SHIELDED_TOKENS]

function getToken(symbol: string): TokenOption {
  return ALL_TOKENS.find(t => t.symbol === symbol) ?? PUBLIC_TOKENS[0]
}

function numericBalance(balance: string): number {
  return parseFloat(balance.replace(/,/g, '')) || 0
}

// ── Props ──────────────────────────────────────────────────────────────────

export interface RightPanelProps {
  isOpen: boolean
  onClose: () => void
  activeAction: DrawerAction
  phase: OperationPhase
  operationType: OperationType
  amount?: string
  recipient?: string
  publicBalance: string
  shieldedBalance: string
  startedAt?: number
  txHashStep1?: string
  txHashStep2?: string
  replayToken?: string
  onStartShield: (amount: string, token: string) => void
  onStartSend: (amount: string, recipient: string, isShielded: boolean, token: string) => void
  onStartUnshield: (amount: string, token: string) => void
  onConfirmWalletStep?: () => void
  onCancel: () => void
  onComplete: () => void
  onDone: () => void
  onOverlayIntensity?: (v: 0 | 30 | 50) => void
  demo?: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function getOverlayIntensity(phase: OperationPhase): 0 | 30 | 50 {
  if (phase === 'awaiting_wallet_step1' || phase === 'awaiting_wallet_step2' || phase === 'proof_ready') return 50
  if (phase === 'submitted' || phase === 'processing' || phase === 'finalizing') return 30
  return 0
}

function getPhaseIndex(phase: OperationPhase, op: OperationType): number {
  const m: Record<OperationType, Partial<Record<OperationPhase, number>>> = {
    shield:   { awaiting_wallet_step1: 0, awaiting_wallet_step2: 1, submitted: 1, processing: 1, finalizing: 2, completed: 3 },
    send:     { awaiting_wallet_step1: 0, submitted: 1, processing: 2, finalizing: 2, completed: 3 },
    unshield: { awaiting_wallet_step1: 0, submitted: 1, processing: 1, proof_ready: 2, awaiting_wallet_step2: 2, finalizing: 2, completed: 3 },
  }
  return m[op][phase] ?? 0
}

function elapsed(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  return `${Math.floor(s / 60)} min ago`
}

function truncateAddress(addr: string): string {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

const MOCK_ADDRESS = '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'

// ── Shared layout primitives ───────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
      {children}
    </div>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-surface-subtle)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      fontSize: 'var(--text-small)',
      color: 'var(--color-text-secondary)',
      lineHeight: 1.6,
      marginBottom: '16px',
    }}>
      {children}
    </div>
  )
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

function FeeTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: '20px' }}>
      {rows.map(r => <FeeRow key={r.label} label={r.label} value={r.value} />)}
    </div>
  )
}

function QuickAmounts({ balance, onSelect }: { balance: string; onSelect: (v: string) => void }) {
  const b = numericBalance(balance)
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
      {[25, 50, 75, 100].map(pct => (
        <button
          key={pct}
          onClick={() => onSelect((b * pct / 100).toFixed(4).replace(/\.?0+$/, '') || '0')}
          style={{
            flex: 1, padding: '6px 0', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-surface)',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            color: 'var(--color-text-secondary)', fontFamily: 'Manrope, sans-serif',
            transition: 'border-color var(--duration-fast), color var(--duration-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-blue)'; e.currentTarget.style.color = 'var(--color-blue)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
        >
          {pct === 100 ? 'Max' : `${pct}%`}
        </button>
      ))}
    </div>
  )
}

function AfterPreview({ rows }: { rows: { label: string; value: string; delta?: string; unit?: string }[] }) {
  return (
    <div style={{ marginBottom: '20px', padding: '10px 12px', background: 'rgba(55,72,255,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(55,72,255,0.1)' }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', lineHeight: 1.8 }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>After · {r.label}</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {r.value} {r.unit ?? 'ETH'}{r.delta ? <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}> ({r.delta})</span> : null}
          </span>
        </div>
      ))}
    </div>
  )
}

function CautionNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '8px',
      padding: '10px 12px',
      background: 'rgba(245, 207, 0, 0.08)',
      border: '1px solid rgba(245, 207, 0, 0.3)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '12px',
    }}>
      <AlertTriangle size={13} style={{ color: '#78350F', flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
        {children}
      </span>
    </div>
  )
}

// ── Token converter UI ─────────────────────────────────────────────────────

function ConverterBox({
  label,
  token,
  amount,
  onAmountChange,
  onSelectToken,
  error,
}: {
  label: string
  token: TokenOption | null
  amount: string
  onAmountChange?: (v: string) => void
  onSelectToken?: () => void
  error?: string
}) {
  const isReadOnly = !onAmountChange
  return (
    <div style={{
      background: 'var(--color-surface-subtle)',
      border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {label}
        </span>
        {onSelectToken ? (
          <button
            onClick={onSelectToken}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px',
              background: token ? 'var(--color-surface-raised)' : 'var(--color-blue)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: token ? 'var(--color-text-primary)' : '#fff',
              fontFamily: 'Manrope, sans-serif',
              transition: 'all var(--duration-fast)',
            }}
          >
            {token ? (
              <>
                <img src={token.imageUrl} alt={token.symbol} width={16} height={16} style={{ borderRadius: '50%' }} />
                {token.symbol}
                <ChevronDown size={12} />
              </>
            ) : (
              <>Select token <ChevronDown size={12} /></>
            )}
          </button>
        ) : token && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px', fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}>
            <img src={token.imageUrl} alt={token.symbol} width={16} height={16} style={{ borderRadius: '50%' }} />
            {token.symbol}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={e => onAmountChange?.(e.target.value)}
          readOnly={isReadOnly}
          placeholder="0"
          style={{
            fontSize: '28px', fontWeight: 700,
            background: 'none', border: 'none', outline: 'none',
            color: isReadOnly ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            fontFamily: 'Manrope, sans-serif',
            width: 0, flex: 1, padding: 0,
            cursor: isReadOnly ? 'default' : 'text',
          }}
        />
        {token && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', marginLeft: '8px', paddingBottom: '4px' }}>
            {token.balance} {token.symbol}
          </span>
        )}
      </div>
      {error && (
        <div style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '6px' }}>
          {error}
        </div>
      )}
    </div>
  )
}

function ConverterDivider() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
      <div style={{
        width: '34px', height: '34px',
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <ArrowDown size={15} color="var(--color-text-secondary)" />
      </div>
    </div>
  )
}

function TokenPicker({
  tokens,
  title,
  onSelect,
  onBack,
}: {
  tokens: TokenOption[]
  title: string
  onSelect: (t: TokenOption) => void
  onBack: () => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
            borderRadius: 'var(--radius-sm)', transition: 'color var(--duration-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 'var(--text-small)', color: 'var(--color-text-primary)' }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {tokens.map(token => (
          <button
            key={token.symbol}
            onClick={() => onSelect(token)}
            style={{
              display: 'flex', width: '100%', alignItems: 'center', gap: '12px',
              padding: '10px 12px',
              background: 'none', border: '1px solid transparent',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif', textAlign: 'left',
              transition: 'background var(--duration-fast), border-color var(--duration-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-surface-subtle)'
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <img src={token.imageUrl} alt={token.symbol} width={38} height={38} style={{ borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {token.symbol}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {token.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {token.balance}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {token.symbol}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Phase header ───────────────────────────────────────────────────────────

function PhaseHeader({ op, amount, phase, token = 'ETH', description, note, startedAt }: {
  op: OperationType; amount: string; phase: OperationPhase; token?: string
  description?: string; note?: string; startedAt?: number
}) {
  const tokenData = getToken(token)
  const pairedSymbol = tokenData.pairedSymbol
  const pairedTokenData = pairedSymbol ? getToken(pairedSymbol) : null
  const verb = { shield: 'Shielding', send: 'Sending', unshield: 'Unshielding' }[op]

  const currentIndex = getPhaseIndex(phase, op)
  const t = startedAt ?? Date.now()
  const rawTs = [t + 2_000, t + 5_000, t + 10_000, t + 14_000]
  const fmtTime = (ms: number) =>
    new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  const timestamps = startedAt
    ? rawTs.map((ms, i) => (i < currentIndex ? fmtTime(ms) : undefined))
    : undefined

  // Source (token) always behind, destination (paired) always in front.
  // Shield: badge on front token. Unshield: badge on back token at its corner -
  // front token paints over it (rendered later), creating the sandwiched look.
  const isUnshield = op === 'unshield'
  const panelBadge = (
    <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '16px', height: '16px', borderRadius: '5px', background: 'var(--color-shielded)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--color-surface-raised)' }}>
      <ShieldCheck size={9} color="#fff" strokeWidth={2.5} aria-hidden />
    </div>
  )

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        {op !== 'send' && pairedTokenData ? (
          <div style={{ position: 'relative', width: '72px', height: '60px' }}>
            <div style={{ position: 'absolute', top: '8px', left: 0 }}>
              {isUnshield ? (
                <div style={{ position: 'relative' }}>
                  <img src={tokenData.imageUrl} alt={token} width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                  {panelBadge}
                </div>
              ) : (
                <img src={tokenData.imageUrl} alt={token} width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
              )}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
              <div style={{ position: 'relative' }}>
                <img src={pairedTokenData.imageUrl} alt={pairedTokenData.symbol} width={38} height={38} style={{ borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--color-surface-raised)', display: 'block' }} />
                {!isUnshield && panelBadge}
              </div>
            </div>
          </div>
        ) : (
          <img src={tokenData.imageUrl} alt={token} width={48} height={48} style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>
      {/* Hero text */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{verb}</div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '6px' }}>
          {amount} {token}
        </div>
        {op !== 'send' && pairedSymbol && (
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            {amount} {token} → {amount} {pairedSymbol}
          </div>
        )}
      </div>
      <PhaseIndicatorVertical
        phases={[]}
        currentPhase={currentIndex}
        operation={op}
        timestamps={timestamps}
        currentDescription={description}
        currentNote={note}
      />
    </div>
  )
}

function ManualOpenLink() {
  return (
    <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
      Not seeing a popup?{' '}
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue)', fontWeight: 600, fontFamily: 'Manrope, sans-serif', fontSize: '12px', padding: 0 }}>
        Open wallet manually
      </button>
    </p>
  )
}

function EtherscanLink({ txHash }: { txHash: string }) {
  return (
    <a
      href={`https://etherscan.io/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'none' }}
    >
      View on Etherscan <ExternalLink size={12} aria-hidden="true" />
    </a>
  )
}

// ── Tab bar ────────────────────────────────────────────────────────────────

type TabId = 'shield' | 'unshield' | 'send' | 'receive'

const PRIVACY_TABS: { id: TabId; label: string }[] = [
  { id: 'shield', label: 'Shield' },
  { id: 'unshield', label: 'Unshield' },
]

const TRANSFER_TABS: { id: TabId; label: string }[] = [
  { id: 'send', label: 'Send' },
  { id: 'receive', label: 'Receive' },
]

function TabBar({ tabs, active, onChange }: { tabs: { id: TabId; label: string }[]; active: TabId; onChange: (id: TabId) => void }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
      {tabs.map(t => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1, padding: '12px 8px',
              background: 'none', border: 'none', borderBottom: `2px solid ${isActive ? 'var(--color-blue)' : 'transparent'}`,
              cursor: 'pointer', fontSize: 'var(--text-small)', fontWeight: isActive ? 700 : 400,
              color: isActive ? 'var(--color-blue)' : 'var(--color-text-secondary)',
              fontFamily: 'Manrope, sans-serif', marginBottom: '-1px',
              transition: 'color var(--duration-fast), border-color var(--duration-fast)',
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Idle forms ─────────────────────────────────────────────────────────────

const GAS_RESERVE_ETH = 0.005
const MIN_SHIELD_AMOUNT: Partial<Record<string, number>> = { ETH: 0.001, DAI: 0.001, cETH: 0.001, cDAI: 0.001 }

function ShieldForm({ preparing, onSubmit }: {
  preparing: boolean
  onSubmit: (amount: string, token: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<TokenOption>(PUBLIC_TOKENS[0])
  const [picking, setPicking] = useState(false)

  const paired = getToken(selectedToken.pairedSymbol)
  const a = parseFloat(amount) || 0
  const balance = numericBalance(selectedToken.balance)
  const err = a > balance ? `Amount exceeds your ${selectedToken.symbol} balance.` : undefined

  const showGasWarning = selectedToken.symbol === 'ETH' && a > 0 && a > balance - GAS_RESERVE_ETH
  const minAmount = MIN_SHIELD_AMOUNT[selectedToken.symbol]
  const showMinWarning = !!minAmount && a > 0 && a < minAmount

  const isReady = a > 0 && !err && !showGasWarning && !showMinWarning

  if (picking) {
    return (
      <TokenPicker
        tokens={PUBLIC_TOKENS}
        title="Select token to shield"
        onSelect={t => { setSelectedToken(t); setAmount(''); setPicking(false) }}
        onBack={() => setPicking(false)}
      />
    )
  }

  return (
    <div>
      <ConverterBox
        label="From · Public balance"
        token={selectedToken}
        amount={amount}
        onAmountChange={setAmount}
        onSelectToken={() => setPicking(true)}
        error={err}
      />
      <div style={{ marginTop: '10px' }}>
        <QuickAmounts balance={selectedToken.balance} onSelect={setAmount} />
      </div>
      {showGasWarning && (
        <CautionNote>
          Shielding your full ETH balance leaves nothing to pay the network fee (~{GAS_RESERVE_ETH} ETH). Reduce your amount to avoid a failed transaction.
        </CautionNote>
      )}
      {showMinWarning && (
        <CautionNote>
          This amount may be rounded to zero by the protocol - you'd pay a network fee but receive nothing. Shield at least {minAmount} {selectedToken.symbol}.
        </CautionNote>
      )}
      <ConverterDivider />
      <ConverterBox
        label="To · Shielded balance"
        token={paired}
        amount={amount}
      />
      {isReady && (
        <FeeTable rows={[
          { label: 'Network fee', value: '~0.002 ETH' },
          { label: 'Time', value: '~2–3 min' },
          { label: 'Confirmations', value: '2' },
        ]} />
      )}
      {isReady && (
        <AfterPreview rows={[
          { label: 'Public', value: Math.max(balance - a, 0).toFixed(2), delta: `−${a.toFixed(2)}`, unit: selectedToken.symbol },
          { label: 'Shielded', value: (numericBalance(paired.balance) + a).toFixed(2), delta: `+${a.toFixed(2)}`, unit: paired.symbol },
        ]} />
      )}
      <Button variant="primary" style={{ width: '100%', marginTop: '20px' }} loading={preparing}
        disabled={!amount || a <= 0 || !!err || showGasWarning || showMinWarning}
        onClick={() => onSubmit(amount, selectedToken.symbol)}>
        Shield funds
      </Button>
    </div>
  )
}

function SendForm({ preparing, onSubmit }: {
  preparing: boolean
  onSubmit: (amount: string, recipient: string, token: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [selectedToken, setSelectedToken] = useState<TokenOption>(PUBLIC_TOKENS[0])
  const [picking, setPicking] = useState(false)

  const a = parseFloat(amount) || 0
  const balance = numericBalance(selectedToken.balance)
  const amtErr = a > balance ? `Amount exceeds your ${selectedToken.symbol} balance.` : undefined
  const recErr = recipient && !recipient.startsWith('0x') ? 'Enter a valid Ethereum address.' : undefined
  const isReady = a > 0 && !amtErr && recipient.startsWith('0x')

  const balanceLabel = selectedToken.isShielded ? 'Shielded balance' : 'Public balance'
  const addressHint = selectedToken.isShielded
    ? 'The recipient needs a ShieldPay-compatible app to access shielded funds.'
    : `Any Ethereum address that can hold ${selectedToken.symbol}.`
  const feeTime = selectedToken.isShielded ? '~2–3 min' : '~30 sec'

  if (picking) {
    return (
      <TokenPicker
        tokens={ALL_TOKENS}
        title="Select token to send"
        onSelect={t => { setSelectedToken(t); setAmount(''); setPicking(false) }}
        onBack={() => setPicking(false)}
      />
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <SectionLabel>Token</SectionLabel>
        <button
          onClick={() => setPicking(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '10px 14px',
            background: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
            transition: 'border-color var(--duration-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-blue)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <img src={selectedToken.imageUrl} alt={selectedToken.symbol} width={24} height={24} style={{ borderRadius: '50%' }} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {selectedToken.symbol}
              {selectedToken.isShielded && (
                <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 500, color: 'var(--color-blue)', background: 'rgba(55,72,255,0.08)', padding: '1px 6px', borderRadius: '4px' }}>
                  Shielded
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {balanceLabel}: {selectedToken.balance} {selectedToken.symbol}
            </div>
          </div>
          <ChevronDown size={16} color="var(--color-text-secondary)" />
        </button>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <TextField label="To" placeholder="0x recipient address…" value={recipient}
          onChange={e => setRecipient(e.target.value)} error={recErr}
          hint={addressHint}
        />
      </div>
      {selectedToken.isShielded && recipient.startsWith('0x') && !recErr && (
        <CautionNote>
          Shielded funds are only visible in apps that support confidential tokens. The recipient won't see them in a standard wallet.
        </CautionNote>
      )}
      <SectionLabel>From · {balanceLabel} · {selectedToken.balance} {selectedToken.symbol}</SectionLabel>
      <TextField label="Amount" placeholder="0.00" inputMode="decimal" value={amount}
        onChange={e => setAmount(e.target.value)} error={amtErr}
        rightIcon={<span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{selectedToken.symbol}</span>}
      />
      {isReady && (
        <FeeTable rows={[
          { label: 'Network fee', value: selectedToken.isShielded ? '~0.003 ETH' : '~0.001 ETH' },
          { label: 'Time', value: feeTime },
          { label: 'Confirmations', value: '1' },
        ]} />
      )}
      {isReady && (
        <AfterPreview rows={[
          { label: balanceLabel, value: Math.max(balance - a, 0).toFixed(2), delta: `−${a.toFixed(2)}`, unit: selectedToken.symbol },
        ]} />
      )}
      <Button variant="primary" style={{ width: '100%', marginTop: '20px' }} loading={preparing}
        disabled={!amount || a <= 0 || !!amtErr || !recipient.startsWith('0x')}
        onClick={() => onSubmit(amount, recipient, selectedToken.symbol)}>
        Send
      </Button>
    </div>
  )
}

function UnshieldForm({ preparing, onSubmit }: {
  preparing: boolean
  onSubmit: (amount: string, token: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<TokenOption>(SHIELDED_TOKENS[0])
  const [picking, setPicking] = useState(false)

  const paired = getToken(selectedToken.pairedSymbol)
  const a = parseFloat(amount) || 0
  const balance = numericBalance(selectedToken.balance)
  const err = a > balance ? `Amount exceeds your ${selectedToken.symbol} balance.` : undefined

  const minAmount = MIN_SHIELD_AMOUNT[selectedToken.symbol]
  const showMinWarning = !!minAmount && a > 0 && a < minAmount

  const isReady = a > 0 && !err && !showMinWarning

  if (picking) {
    return (
      <TokenPicker
        tokens={SHIELDED_TOKENS}
        title="Select token to unshield"
        onSelect={t => { setSelectedToken(t); setAmount(''); setPicking(false) }}
        onBack={() => setPicking(false)}
      />
    )
  }

  return (
    <div>
      <ConverterBox
        label="From · Shielded balance"
        token={selectedToken}
        amount={amount}
        onAmountChange={setAmount}
        onSelectToken={() => setPicking(true)}
        error={err}
      />
      <div style={{ marginTop: '10px' }}>
        <QuickAmounts balance={selectedToken.balance} onSelect={setAmount} />
      </div>
      {showMinWarning && (
        <CautionNote>
          This amount may be rounded to zero by the protocol - you'd pay a network fee but receive nothing. Unshield at least {minAmount} {selectedToken.symbol}.
        </CautionNote>
      )}
      <ConverterDivider />
      <ConverterBox
        label="To · Public balance"
        token={paired}
        amount={amount}
      />
      {isReady && (
        <FeeTable rows={[
          { label: 'Network fee', value: '~0.005 ETH' },
          { label: 'Time', value: '~3–5 min' },
          { label: 'Confirmations', value: '2 - with a wait' },
        ]} />
      )}
      {isReady && (
        <AfterPreview rows={[
          { label: 'Shielded', value: Math.max(balance - a, 0).toFixed(2), delta: `−${a.toFixed(2)}`, unit: selectedToken.symbol },
          { label: 'Public', value: (numericBalance(paired.balance) + a).toFixed(2), delta: `+${a.toFixed(2)}`, unit: paired.symbol },
        ]} />
      )}
      <Button variant="primary" style={{ width: '100%', marginTop: '20px' }} loading={preparing}
        disabled={!amount || a <= 0 || !!err || showMinWarning}
        onClick={() => onSubmit(amount, selectedToken.symbol)}>
        Unshield funds
      </Button>
    </div>
  )
}

// ── Receive view ───────────────────────────────────────────────────────────

function ReceiveView() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div style={{
        background: 'var(--color-surface-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
      }}>
        <QrCode size={88} color="var(--color-text-primary)" />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--color-surface-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        marginBottom: '16px',
      }}>
        <code style={{
          flex: 1, fontSize: '12px', color: 'var(--color-text-primary)',
          fontFamily: 'monospace', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {MOCK_ADDRESS.slice(0, 20)}…{MOCK_ADDRESS.slice(-4)}
        </code>
        <button
          onClick={handleCopy}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600,
            color: copied ? 'var(--color-success)' : 'var(--color-blue)',
            flexShrink: 0, fontFamily: 'Manrope, sans-serif',
            transition: 'color var(--duration-fast)',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 8px' }}>
        Share this address to receive funds. Public transfers (ETH, USDC, DAI) are visible on-chain. Shielded transfers are encrypted - only you and the sender can see the amount.
      </p>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>
        To receive shielded funds, the sender needs a ShieldPay-compatible app. For public funds, any standard Ethereum wallet works.
      </p>
    </div>
  )
}

// ── Phase views ────────────────────────────────────────────────────────────

interface PhaseViewProps {
  op: OperationType; amount: string; phase: OperationPhase
  recipient?: string; startedAt?: number; txHashStep1?: string; txHashStep2?: string
  onConfirmWalletStep?: () => void
  onCancel: () => void; onComplete: () => void; onDone: () => void
  publicBalance: string; shieldedBalance: string
  token?: string
}

function WalletConfirmView({ op, amount, phase, recipient, onConfirmWalletStep, onCancel, token = 'ETH' }: PhaseViewProps) {
  const isStep2 = phase === 'awaiting_wallet_step2'

  const getSubtitle = () => {
    if (op === 'send') return null
    if (op === 'shield') return isStep2 ? 'Step 2 of 2 - Move funds' : 'Step 1 of 2 - Authorization'
    return isStep2 ? 'Step 2 of 2 - Release funds' : 'Step 1 of 2 - Remove from shielded balance'
  }

  const getSummary = () => {
    if (op === 'shield' && !isStep2)
      return `Authorizing ShieldPay to move ${amount} ${token} from your public balance.\nNetwork fee: ~0.002 ETH (~$4.70)`
    if (op === 'shield' && isStep2)
      return `Approving transfer of ${amount} ${token} to shielded balance.\nNetwork fee: ~0.003 ETH (~$7.05)`
    if (op === 'send')
      return `Sending ${amount} ${token} shielded to ${recipient ? truncateAddress(recipient) : '…'}\nNetwork fee: ~0.003 ETH (~$7.05)`
    if (op === 'unshield' && !isStep2)
      return `You'll receive ${amount} ${getToken(token).pairedSymbol} in your public balance. This step removes ${amount} ${token} from your shielded balance.\nNetwork fee: ~0.002 ETH (~$4.70)`
    return `Releasing ${amount} ${getToken(token).pairedSymbol} to your public balance.\nNetwork fee: ~0.003 ETH (~$7.05)`
  }

  const getNote = () => {
    if (op === 'shield' && !isStep2)
      return 'Your wallet will show a balance decrease - this is correct. Shielded balance updates after the operation completes.'
    if (op === 'send')
      return 'The transaction amount is private. Only you and the recipient can see it.'
    if (op === 'unshield' && !isStep2)
      return 'After confirming, your shielded balance will decrease. A second confirmation releases the funds to your public balance.'
    return null
  }

  const subtitle = getSubtitle()
  const note = getNote()

  return (
    <div>
      <PhaseHeader op={op} amount={amount} phase={phase} token={token} />
      <h3 style={{ margin: '0 0 4px', fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Confirm in your wallet
      </h3>
      {subtitle && (
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{subtitle}</p>
      )}
      <InfoBox>
        {getSummary()?.split('\n').map((line, i) => <div key={i}>{line}</div>)}
      </InfoBox>
      {note && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 16px' }}>
          {note}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button variant="primary" style={{ width: '100%' }} onClick={onConfirmWalletStep}>
          Approve →
        </Button>
        <Button variant="ghost" style={{ width: '100%' }} onClick={onCancel}>
          Cancel operation
        </Button>
      </div>
    </div>
  )
}

function ProcessingView({ op, amount, phase, startedAt, txHashStep1, txHashStep2, token = 'ETH' }: PhaseViewProps) {
  const isFinalizing = phase === 'finalizing'
  const isUnshield = op === 'unshield'
  const isSend = op === 'send'

  const body = (() => {
    if (isFinalizing && !isUnshield && !isSend)
      return 'Your transaction is confirmed. We\'re now encrypting your shielded balance - ~1 min. Your funds are safe. They will appear in your shielded balance once encryption completes.'
    if (isFinalizing && isSend)
      return 'Your transaction is confirmed. The transfer is being encrypted for sender and recipient - ~1 min. Your funds are safe.'
    if (isFinalizing && isUnshield)
      return 'Almost done. Your funds are being transferred to your public balance - ~30 seconds.'
    if (isUnshield)
      return 'Step 1 is complete. We\'re now preparing your funds for release to your public balance. This takes about 1–2 minutes. Your funds are secured.'
    return 'Your transaction is being confirmed on the network. Usually takes 1–2 minutes.'
  })()

  const note = !isUnshield && isFinalizing && !isSend
    ? "You may see this as 'Confirmed' on Etherscan before your balance updates - that's expected."
    : isUnshield && !isFinalizing
    ? "You can close this panel - we'll notify you when Step 2 is ready."
    : 'You can close this panel - your balance updates automatically.'

  return (
    <div>
      <PhaseHeader
        op={op} amount={amount} phase={phase} token={token}
        description={body}
        note={note}
        startedAt={startedAt}
      />
      {startedAt && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
          Started {elapsed(startedAt)}
        </p>
      )}
      {(txHashStep2 ?? txHashStep1) && (op !== 'send' || !SHIELDED_TOKENS.some(t => t.symbol === token)) && (
        <EtherscanLink txHash={(txHashStep2 ?? txHashStep1)!} />
      )}
    </div>
  )
}

function ProofReadyView({ amount, onComplete, token = 'ETH' }: PhaseViewProps) {
  const plural = parseFloat(amount) === 1 ? 'is' : 'are'
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Zap size={18} style={{ color: '#78350F', animation: 'pulse-badge 1.5s ease-in-out infinite' }} aria-hidden="true" />
        <h3 style={{ margin: 0, fontSize: 'var(--text-heading)', fontWeight: 700, color: '#78350F', letterSpacing: '-0.01em' }}>
          Action required
        </h3>
      </div>
      <PhaseIndicatorVertical phases={[]} currentPhase={2} operation="unshield" />
      <div style={{ height: '20px' }} />
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 8px' }}>
        Your <strong style={{ color: 'var(--color-text-primary)' }}>{amount} {token}</strong> {plural} ready to be released to your public balance. One more wallet confirmation will complete this.
      </p>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 24px' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>Your funds are secured.</strong> Complete this step to release them.
      </p>
      <Button variant="primary" style={{ width: '100%' }} onClick={onComplete}>
        Complete unshield →
      </Button>
    </div>
  )
}

const STATUS_PHASES: Record<OperationType, string[]> = {
  shield:   ['Authorized', 'Submitted & confirmed', 'Balance encrypted', 'Complete'],
  unshield: ['Unshield initiated', 'Confirmed on-chain', 'Released to public balance', 'Complete'],
  send:     ['Confirmed', 'Submitted to network', 'Confirmed on-chain', 'Sent'],
}

function SuccessView({ op, amount, recipient, txHashStep1, txHashStep2, startedAt, onDone, token = 'ETH' }: PhaseViewProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'details'>('status')
  const [copied, setCopied] = useState(false)

  function copyRecipient() {
    if (!recipient) return
    navigator.clipboard.writeText(recipient).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  const tokenData = getToken(token)
  const pairedSymbol = tokenData.pairedSymbol
  const pairedTokenData = pairedSymbol ? getToken(pairedSymbol) : null
  const isShieldedSend = op === 'send' && tokenData.isShielded

  // Shield: badge on front token. Unshield: badge on back token - front paints over it.
  const isUnshieldOp = op === 'unshield'
  const successBadge = (
    <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '16px', height: '16px', borderRadius: '5px', background: 'var(--color-shielded)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--color-surface-raised)' }}>
      <ShieldCheck size={9} color="#fff" strokeWidth={2.5} aria-hidden />
    </div>
  )

  const completedAt = startedAt
    ? new Date(startedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : 'just now'
  const feeAmount = op === 'unshield' ? '~0.005 ETH' : isShieldedSend ? '~0.003 ETH' : op === 'send' ? '~0.001 ETH' : '~0.002 ETH'
  const showEtherscan = !!(txHashStep1 || txHashStep2)
  const step1Label = op === 'shield' ? 'Authorization' : op === 'unshield' ? 'Unshield' : 'Transaction'
  const step2Label = op === 'shield' ? 'Shield' : op === 'unshield' ? 'Release' : 'Transaction'
  const hasBoth = !!txHashStep1 && !!txHashStep2

  // Simulated per-phase timestamps spaced chronologically from startedAt
  const t = startedAt ?? (Date.now() - 14_000)
  const phaseTimestamps = [t + 2_000, t + 5_000, t + 10_000, t + 14_000]
  const fmtTime = (ms: number) =>
    new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  const verb = op === 'shield' ? 'Shielded' : op === 'unshield' ? 'Unshielded' : 'Sent'

  const cellStyle = { display: 'flex', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid var(--color-border)', fontSize: '13px' } as const
  const lastCellStyle = { ...cellStyle, borderBottom: 'none' }

  return (
    <div>
      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        {op !== 'send' && pairedTokenData ? (
          <div style={{ position: 'relative', width: '72px', height: '60px' }}>
            <div style={{ position: 'absolute', top: '8px', left: 0 }}>
              {isUnshieldOp ? (
                <div style={{ position: 'relative' }}>
                  <img src={tokenData.imageUrl} alt={token} width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                  {successBadge}
                </div>
              ) : (
                <img src={tokenData.imageUrl} alt={token} width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
              )}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
              <div style={{ position: 'relative' }}>
                <img src={pairedTokenData.imageUrl} alt={pairedTokenData.symbol} width={38} height={38} style={{ borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--color-surface-raised)', display: 'block' }} />
                {!isUnshieldOp && successBadge}
              </div>
            </div>
          </div>
        ) : (
          <img src={tokenData.imageUrl} alt={token} width={56} height={56} style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>

      {/* Hero text */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{verb}</div>
        <div style={{ fontSize: '30px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '6px' }}>
          {amount} {token}
        </div>
        {op !== 'send' && pairedSymbol && (
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            {amount} {token} → {amount} {pairedSymbol}
          </div>
        )}
        {op === 'send' && recipient && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            To {truncateAddress(recipient)}
            <button
              onClick={copyRecipient}
              title="Copy address"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)', transition: 'color 0.15s' }}
            >
              {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} />}
            </button>
          </div>
        )}
      </div>

      {/* Pill tab switcher */}
      <div style={{ display: 'flex', background: 'var(--color-surface-subtle)', borderRadius: '100px', padding: '3px', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
        {(['status', 'details'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '7px 12px', borderRadius: '100px',
              border: 'none', cursor: 'pointer', fontSize: '13px',
              fontWeight: activeTab === tab ? 600 : 400,
              background: activeTab === tab ? 'var(--color-surface-raised)' : 'transparent',
              color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease', fontFamily: 'Manrope, sans-serif',
            }}
          >
            {tab === 'status' ? 'Status' : 'Details'}
          </button>
        ))}
      </div>

      {/* Status tab: vertical timeline */}
      {activeTab === 'status' && (
        <div style={{ marginBottom: '24px' }}>
          {STATUS_PHASES[op].map((label, i) => {
            const isLast = i === STATUS_PHASES[op].length - 1
            return (
              <div key={label} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color="#fff" strokeWidth={2.5} aria-hidden />
                  </div>
                  {!isLast && (
                    <div style={{ width: '2px', flex: 1, minHeight: '20px', background: 'rgba(21,128,61,0.25)', marginTop: '2px' }} />
                  )}
                </div>
                <div style={{ paddingBottom: isLast ? 0 : '16px', flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{fmtTime(phaseTimestamps[i])}</div>
                </div>
              </div>
            )
          })}
          {op === 'send' && (txHashStep2 ?? txHashStep1) && (
            <div style={{ marginTop: '16px' }}>
              <EtherscanLink txHash={(txHashStep2 ?? txHashStep1)!} />
            </div>
          )}
        </div>
      )}

      {/* Details tab: key-value table */}
      {activeTab === 'details' && (
        <div style={{ background: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={cellStyle}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Sent</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-primary)' }}>{amount} {token}</span>
          </div>
          {op !== 'send' && pairedSymbol && (
            <div style={cellStyle}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Received</span>
              <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--color-success)' }}>+{amount} {pairedSymbol}</span>
            </div>
          )}
          {op === 'send' && recipient && (
            <div style={cellStyle}>
              <span style={{ color: 'var(--color-text-secondary)' }}>To</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)', fontSize: '12px' }}>{truncateAddress(recipient)}</span>
                <button
                  onClick={copyRecipient}
                  title="Copy address"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)', transition: 'color 0.15s' }}
                >
                  {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
                </button>
              </span>
            </div>
          )}
          <div style={cellStyle}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Network fee</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-secondary)' }}>{feeAmount}</span>
          </div>
          {showEtherscan && txHashStep1 && hasBoth && (
            <div style={cellStyle}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{step1Label}</span>
              <a href={`https://etherscan.io/tx/${txHashStep1}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-blue)', fontSize: '12px', textDecoration: 'none' }}>
                <ExternalLink size={11} /> Etherscan
              </a>
            </div>
          )}
          {showEtherscan && txHashStep2 && (
            <div style={cellStyle}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{hasBoth ? step2Label : 'Transaction'}</span>
              <a href={`https://etherscan.io/tx/${txHashStep2}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-blue)', fontSize: '12px', textDecoration: 'none' }}>
                <ExternalLink size={11} /> Etherscan
              </a>
            </div>
          )}
          <div style={lastCellStyle}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Completed</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{completedAt}</span>
          </div>
        </div>
      )}

      {isShieldedSend && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.55 }}>
          Only you and the recipient can see this transaction.
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="secondary" style={{ flex: 1 }} onClick={onDone}>
          {op === 'send' ? 'Send again' : op === 'unshield' ? 'Unshield more' : 'Shield more'}
        </Button>
        <Button variant="ghost" style={{ flex: 1 }} onClick={onDone}>Done</Button>
      </div>
    </div>
  )
}

function FailedOrCancelledView({ op, phase, onDone, amount = '0', token = 'ETH' }: PhaseViewProps) {
  const tokenData = getToken(token)
  const isCancelled = phase === 'cancelled' || phase === 'timed_out'
  const isInterrupted = phase === 'interrupted'
  const opLabel = { shield: 'Shielding', send: 'Sending', unshield: 'Unshielding' }[op]

  const heading = (() => {
    if (isInterrupted) return 'Unshield paused'
    if (isCancelled) return `${opLabel} cancelled`
    return 'Something went wrong'
  })()

  const fundSafetyCopy = (() => {
    if (isInterrupted) return 'Your funds are secured.'
    if (isCancelled) return 'No funds were moved. Your balances are unchanged.'
    if (phase === 'failed_finalization' && op === 'shield')
      return 'Your public balance has been refunded.'
    return 'Your funds are safe - nothing was deducted from your balance.'
  })()

  const failureCopy = (() => {
    if (isInterrupted) return 'You have an unfinished unshield from your last session. Return to complete the proof step and release your funds to your public balance.'
    if (phase === 'failed_dropped') return 'The transaction didn\'t go through - the network was congested. Retry with the same amount.'
    if (phase === 'failed_submission') return 'The network rejected this transaction. This is usually temporary. Please try again.'
    if (phase === 'failed_finalization') return 'An error occurred while encrypting your balance.'
    return null
  })()

  return (
    <div>
      {/* Hero block */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <img
          src={tokenData.imageUrl}
          alt={token}
          width={52}
          height={52}
          style={{ borderRadius: '50%', objectFit: 'cover', display: 'block', opacity: 0.55 }}
        />
      </div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{opLabel}</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '6px' }}>
          {amount} {token}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: isCancelled || isInterrupted ? 'var(--color-text-secondary)' : 'var(--color-error)' }}>
          {heading}
        </div>
      </div>

      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 8px' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>{fundSafetyCopy}</strong>
      </p>
      {failureCopy && (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 20px' }}>
          {failureCopy}
        </p>
      )}
      {!failureCopy && <div style={{ height: '16px' }} />}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="primary" style={{ flex: 1 }} onClick={onDone}>Try again</Button>
        {!isCancelled && (
          <Button variant="ghost" style={{ flex: 1 }} onClick={onDone}>Contact support</Button>
        )}
        {isCancelled && (
          <Button variant="ghost" style={{ flex: 1 }} onClick={onDone}>Done</Button>
        )}
      </div>
    </div>
  )
}

// ── Drawer header ──────────────────────────────────────────────────────────

function drawerTitle(activeTab: TabId, phase: OperationPhase, operationType: OperationType): string {
  const isIdle = phase === 'idle' || phase === 'preparing'
  if (isIdle) {
    if (activeTab === 'shield') return 'Shield funds'
    if (activeTab === 'unshield') return 'Unshield funds'
    if (activeTab === 'send') return 'Send'
    if (activeTab === 'receive') return 'Receive'
  }
  const opLabel = { shield: 'Shield', send: 'Send', unshield: 'Unshield' }[operationType]
  if (phase === 'awaiting_wallet_step1' || phase === 'awaiting_wallet_step2') return `${opLabel} · Approve in wallet`
  if (phase === 'submitted' || phase === 'processing' || phase === 'finalizing') return `${opLabel} · In progress`
  if (phase === 'proof_ready') return 'Action required'
  if (phase === 'completed') return `${opLabel} complete`
  if (phase === 'cancelled' || phase === 'timed_out') return `${opLabel} cancelled`
  if (phase.startsWith('failed_')) return 'Something went wrong'
  return opLabel
}

// ── Main export ────────────────────────────────────────────────────────────

export function RightPanel({
  isOpen,
  onClose,
  activeAction,
  phase,
  operationType,
  amount = '0',
  recipient,
  publicBalance,
  shieldedBalance,
  startedAt,
  txHashStep1,
  txHashStep2,
  replayToken,
  onStartShield,
  onStartSend,
  onStartUnshield,
  onConfirmWalletStep,
  onCancel,
  onComplete,
  onDone,
  onOverlayIntensity = () => {},
  demo = false,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('shield')
  const [activeToken, setActiveToken] = useState(replayToken ?? 'ETH')

  useEffect(() => {
    if (isOpen && (activeAction === 'shield' || activeAction === 'unshield' || activeAction === 'send' || activeAction === 'receive')) {
      setActiveTab(activeAction)
    }
  }, [isOpen, activeAction])

  useEffect(() => {
    if (replayToken) setActiveToken(replayToken)
  }, [replayToken])

  useEffect(() => {
    onOverlayIntensity(getOverlayIntensity(phase))
  }, [phase, onOverlayIntensity])

  const handleStartShield = (amt: string, token: string) => {
    setActiveToken(token)
    onStartShield(amt, token)
  }

  const handleStartUnshield = (amt: string, token: string) => {
    setActiveToken(token)
    onStartUnshield(amt, token)
  }

  const handleStartSend = (amt: string, rec: string, token: string) => {
    setActiveToken(token)
    const isShielded = SHIELDED_TOKENS.some(t => t.symbol === token)
    onStartSend(amt, rec, isShielded, token)
  }

  const isIdle = phase === 'idle'
  const isPreparing = phase === 'preparing'
  const isWalletConfirm = phase === 'awaiting_wallet_step1' || phase === 'awaiting_wallet_step2'
  const isProcessing = phase === 'submitted' || phase === 'processing' || phase === 'finalizing'
  const isProofReady = phase === 'proof_ready'
  const isCompleted = phase === 'completed'
  const isFailed = phase.startsWith('failed_')
  const isCancelled = phase === 'cancelled' || phase === 'timed_out' || phase === 'interrupted'

  const phaseViewProps: PhaseViewProps = {
    op: operationType, amount, phase, recipient, startedAt, txHashStep1, txHashStep2,
    onConfirmWalletStep, onCancel, onComplete, onDone, publicBalance, shieldedBalance,
    token: activeToken,
  }

  const showIdleForms = isIdle || isPreparing
  const isPrivacyTab = activeTab === 'shield' || activeTab === 'unshield'
  const isTransferTab = activeTab === 'send' || activeTab === 'receive'

  const panelBody = (
    <>
      {showIdleForms && isPrivacyTab && (
        <>
          <TabBar tabs={PRIVACY_TABS} active={activeTab} onChange={setActiveTab} />
          {activeTab === 'shield' && (
            <ShieldForm
              preparing={isPreparing && operationType === 'shield'}
              onSubmit={handleStartShield}
            />
          )}
          {activeTab === 'unshield' && (
            <UnshieldForm
              preparing={isPreparing && operationType === 'unshield'}
              onSubmit={handleStartUnshield}
            />
          )}
        </>
      )}
      {showIdleForms && isTransferTab && (
        <>
          <TabBar tabs={TRANSFER_TABS} active={activeTab} onChange={setActiveTab} />
          {activeTab === 'send' && (
            <SendForm
              preparing={isPreparing && operationType === 'send'}
              onSubmit={handleStartSend}
            />
          )}
          {activeTab === 'receive' && <ReceiveView />}
        </>
      )}
      {isWalletConfirm && <WalletConfirmView {...phaseViewProps} />}
      {isProcessing && <ProcessingView {...phaseViewProps} />}
      {isProofReady && <ProofReadyView {...phaseViewProps} />}
      {isCompleted && <SuccessView {...phaseViewProps} />}
      {(isFailed || isCancelled) && <FailedOrCancelledView {...phaseViewProps} />}
    </>
  )

  if (demo) {
    return (
      <div style={{
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {drawerTitle(activeTab, phase, operationType)}
        </div>
        <div style={{ overflowY: 'auto', padding: '24px' }}>
          {panelBody}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(20, 20, 26, 0.4)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s var(--ease-out)',
        }}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Action panel"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'var(--layout-right-panel-width)',
          background: 'var(--color-surface-raised)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 201, display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s var(--ease-out)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--color-border)', flexShrink: 0,
        }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '7px' }}>
            {phase === 'completed' && <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} aria-hidden="true" />}
            {drawerTitle(activeTab, phase, operationType)}
          </span>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-secondary)', padding: '4px',
              display: 'flex', alignItems: 'center',
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--duration-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {panelBody}
        </div>
      </div>
    </>
  )
}
