import { useState } from 'react'
import { ShieldCheck, ArrowRight, Search, Wallet, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { NotificationContainer, useNotifications } from '../components/Notification'
import { StatusBadge } from '../components/StatusBadge'
import { PhaseIndicator } from '../components/PhaseIndicator'
import { PhaseIndicatorVertical } from '../components/PhaseIndicatorVertical'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card'
import { Switch } from '../components/Switch'
import { ProgressBar } from '../components/ProgressBar'
import { BalanceCard } from '../components/BalanceCard'
import { ActivityRow } from '../components/ActivityRow'
import { StatusPersistenceBanner } from '../components/StatusPersistenceBanner'
import { NavigationWarning } from '../components/NavigationWarning'
import { ConnectWalletCard } from '../components/ConnectWalletCard'
import type { ConnectState } from '../components/ConnectWalletCard'
import { LeftColumnOverlay } from '../components/LeftColumnOverlay'
import { RightPanel } from '../components/RightPanel'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/Table'
import { TokenTable } from '../components/TokenTable'
import type { OperationPhase, OperationType } from '../types/operation'

// ────────────────────────────────────────────────────────
// Navigation structure
// ────────────────────────────────────────────────────────

const FOUNDATION_ITEMS = [
  { id: 'color', label: 'Color' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'radius', label: 'Border Radius' },
  { id: 'elevation', label: 'Elevation' },
  { id: 'motion', label: 'Motion' },
  { id: 'layout', label: 'Layout' },
  { id: 'accessibility', label: 'Accessibility' },
]

const COMPONENT_ITEMS = [
  { id: 'button', label: 'Button', done: true },
  { id: 'text-field', label: 'TextField', done: true },
  { id: 'notification', label: 'Notification', done: true },
  { id: 'status-badge', label: 'StatusBadge', done: true },
  { id: 'phase-indicator', label: 'PhaseIndicator', done: true },
  { id: 'card', label: 'Card', done: true },
  { id: 'switch', label: 'Switch', done: true },
  { id: 'progress-bar', label: 'ProgressBar', done: true },
  { id: 'balance-card', label: 'BalanceCard', done: true },
  { id: 'activity-row', label: 'ActivityRow', done: true },
  { id: 'status-persistence-banner', label: 'StatusPersistenceBanner', done: true },
  { id: 'navigation-warning', label: 'NavigationWarning', done: true },
  { id: 'connect-wallet-card', label: 'ConnectWalletCard', done: true },
  { id: 'right-panel', label: 'Right Panel (Drawer)', done: true },
  { id: 'left-column-overlay', label: 'LeftColumnOverlay', done: true },
  { id: 'table', label: 'Table', done: true },
  { id: 'token-table', label: 'TokenTable', done: true },
]

// ────────────────────────────────────────────────────────
// Token data
// ────────────────────────────────────────────────────────

const COLOR_GROUPS = [
  {
    label: 'Brand palette',
    tokens: [
      { name: '--color-blue', value: '#3748FF', desc: 'Primary brand' },
      { name: '--color-midnight', value: '#14141A', desc: 'Dark anchor' },
      { name: '--color-lime', value: '#CEFF1C', desc: 'Accent highlight' },
      { name: '--color-ice-white', value: '#F5F6FC', desc: 'Base surface' },
    ],
  },
  {
    label: 'Surfaces',
    tokens: [
      { name: '--color-surface', value: '#F5F6FC', desc: 'Page background' },
      { name: '--color-surface-raised', value: '#FFFFFF', desc: 'Cards, panels' },
      { name: '--color-surface-subtle', value: '#ECEDF5', desc: 'Hover, inputs' },
      { name: '--color-border', value: '#E2E3EE', desc: 'Dividers, outlines' },
    ],
  },
  {
    label: 'Text',
    tokens: [
      { name: '--color-text-primary', value: '#14141A', desc: 'Primary copy' },
      { name: '--color-text-secondary', value: '#6B6C80', desc: 'Supporting copy' },
    ],
  },
  {
    label: 'Semantic',
    tokens: [
      { name: '--color-public', value: '#3748FF', desc: 'Public balance, visible state' },
      { name: '--color-shielded', value: '#6D28D9', desc: 'Shielded balance, encrypted' },
      { name: '--color-accent', value: '#CEFF1C', desc: 'Highlights, active states' },
    ],
  },
  {
    label: 'Status',
    tokens: [
      { name: '--color-success', value: '#5BB81E', desc: 'Completed states' },
      { name: '--color-warning', value: '#F5CF00', desc: 'Sentiment Warning' },
      { name: '--color-error', value: '#B91C1C', desc: 'Failure states' },
      { name: '--color-destructive', value: '#dc2626', desc: 'Destructive actions' },
      { name: '--color-processing', value: '#3748FF', desc: 'In-progress states' },
    ],
  },
]

const TYPE_SCALE = [
  { token: '--text-display', size: '32px', weight: 700, sample: 'Display', usage: 'Page headings, hero numbers' },
  { token: '--text-heading', size: '20px', weight: 600, sample: 'Heading', usage: 'Card headings, section titles' },
  { token: '--text-body', size: '16px', weight: 400, sample: 'Body text', usage: 'Primary copy' },
  { token: '--text-small', size: '14px', weight: 500, sample: 'Small label', usage: 'Labels, captions' },
  { token: '--text-mono', size: '13px', weight: 400, sample: '0x1a2b…3f9d', usage: 'Addresses, hashes', mono: true },
]

const WEIGHT_SCALE = [
  { token: '--font-weight-regular', value: 400, label: 'Regular' },
  { token: '--font-weight-medium', value: 500, label: 'Medium' },
  { token: '--font-weight-semibold', value: 600, label: 'Semibold' },
  { token: '--font-weight-bold', value: 700, label: 'Bold' },
  { token: '--font-weight-extrabold', value: 800, label: 'ExtraBold' },
]

const RADIUS_SCALE = [
  { token: '--radius-sm', value: '4px', label: 'sm · 4px', usage: 'Chips, tags' },
  { token: '--radius-md', value: '8px', label: 'md · 8px', usage: 'Buttons, inputs' },
  { token: '--radius-lg', value: '12px', label: 'lg · 12px', usage: 'Cards, panels' },
  { token: '--radius-xl', value: '16px', label: 'xl · 16px', usage: 'Modals' },
  { token: '--radius-2xl', value: '24px', label: '2xl · 24px', usage: 'Sheets' },
  { token: '--radius-full', value: '9999px', label: 'full', usage: 'Pills, avatars' },
]

const SHADOW_SCALE = [
  { token: '--shadow-sm', value: '0 1px 3px rgba(20,20,26,.06), 0 1px 2px rgba(20,20,26,.04)', label: 'sm', usage: 'Chips, interactive elements' },
  { token: '--shadow-md', value: '0 4px 8px rgba(20,20,26,.08), 0 2px 4px rgba(20,20,26,.04)', label: 'md', usage: 'Cards, dropdowns' },
  { token: '--shadow-lg', value: '0 8px 24px rgba(20,20,26,.10), 0 4px 8px rgba(20,20,26,.06)', label: 'lg', usage: 'Floating panels' },
  { token: '--shadow-xl', value: '0 16px 48px rgba(20,20,26,.14), 0 8px 16px rgba(20,20,26,.08)', label: 'xl', usage: 'Right panel, modals' },
]

const DURATION_SCALE = [
  { token: '--duration-instant', value: '0ms', usage: 'State switches with no transition' },
  { token: '--duration-fast', value: '100ms', usage: 'Hover states, tooltips' },
  { token: '--duration-normal', value: '200ms', usage: 'Most UI transitions' },
  { token: '--duration-slow', value: '300ms', usage: 'Panel slides, modals entering' },
  { token: '--duration-slower', value: '500ms', usage: 'Overlay fades, LeftColumnOverlay' },
]

const EASING_SCALE = [
  { token: '--ease-out', value: 'cubic-bezier(0, 0, 0.2, 1)', label: 'Ease Out', usage: 'Entering elements' },
  { token: '--ease-in', value: 'cubic-bezier(0.4, 0, 1, 1)', label: 'Ease In', usage: 'Exiting elements' },
  { token: '--ease-in-out', value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Ease In-Out', usage: 'State changes' },
  { token: '--ease-spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'Spring', usage: 'Confirmations, success pops' },
]

const SPACING_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const NOW = Date.now()

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'
const OVERVIEW_PUBLIC_AVATARS = [
  { symbol: 'ETH',  imageUrl: `${ICON_BASE}/eth.png`  },
  { symbol: 'USDC', imageUrl: `${ICON_BASE}/usdc.png` },
  { symbol: 'DAI',  imageUrl: `${ICON_BASE}/dai.png`  },
]
const OVERVIEW_SHIELDED_AVATARS = [
  { symbol: 'ETH',  imageUrl: `${ICON_BASE}/eth.png`  },
  { symbol: 'USDC', imageUrl: `${ICON_BASE}/usdc.png` },
  { symbol: 'DAI',  imageUrl: `${ICON_BASE}/dai.png`  },
]

// ────────────────────────────────────────────────────────
// Sidebar
// ────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────
// Layout primitives
// ────────────────────────────────────────────────────────

function Section({ id, title, description, children }: {
  id: string; title: string; description?: string; children: React.ReactNode
}) {
  return (
    <section id={id} style={{ marginBottom: '88px', scrollMarginTop: 'calc(var(--layout-nav-height) + 24px)' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        {title}
      </h2>
      <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', margin: '0 0 40px', lineHeight: 1.65, maxWidth: '560px' }}>
        {description ?? ' '}
      </p>
      {children}
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 20px' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '0 0 88px' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Content components
// ────────────────────────────────────────────────────────

function ColorSwatch({ name, value, desc }: { name: string; value: string; desc: string }) {
  const light = ['--color-ice-white', '--color-surface', '--color-surface-raised', '--color-surface-subtle', '--color-border', '--color-accent', '--color-lime'].includes(name)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '120px', maxWidth: '156px' }}>
      <div style={{ height: '64px', borderRadius: 'var(--radius-md)', background: `var(${name})`, border: light ? '1px solid var(--color-border)' : 'none', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'monospace', marginBottom: '2px' }}>{name}</div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', marginBottom: '3px' }}>{value}</div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{desc}</div>
      </div>
    </div>
  )
}

function TokenRow({ token, value, extra }: { token: string; value: string; extra?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 120px 1fr', alignItems: 'center', gap: '24px', padding: '13px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-public)' }}>{token}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>
      {extra && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{extra}</span>}
    </div>
  )
}

function Anatomy({ parts }: { parts: { name: string; desc: string }[] }) {
  return (
    <div style={{ borderTop: '1px solid var(--color-border)' }}>
      {parts.map(p => (
        <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'baseline' }}>
          <code style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-public)', fontWeight: 500 }}>{p.name}</code>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{p.desc}</span>
        </div>
      ))}
    </div>
  )
}

function DoAndDont({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div style={{ background: 'rgba(21,128,61,0.05)', border: '1px solid rgba(21,128,61,0.18)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>Do</div>
        {dos.map(d => (
          <div key={d} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px', lineHeight: 1.55, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--color-success)', flexShrink: 0, fontWeight: 700, marginTop: '1px' }}>✓</span>
            {d}
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.18)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>Don't</div>
        {donts.map(d => (
          <div key={d} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px', lineHeight: 1.55, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--color-error)', flexShrink: 0, fontWeight: 700, marginTop: '1px' }}>✗</span>
            {d}
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Main export
// ────────────────────────────────────────────────────────

export function DesignSystem() {
  const [shieldedHidden, setShieldedHidden] = useState(false)
  const [tfValue, setTfValue] = useState('')
  const { items: notifications, dismiss: dismissNotification } = useNotifications()

  // StatusPersistenceBanner demo
  const [bannerPhase, setBannerPhase] = useState<OperationPhase>('processing')

  // NavigationWarning demo — shown inline, no modal overlay needed

  // ConnectWalletCard demo
  const [connectState, setConnectState] = useState<ConnectState>('landing')
  const [connectWallet, setConnectWallet] = useState<'MetaMask' | 'Rabby' | 'WalletConnect' | undefined>()

  // Switch demo
  const [switchOn, setSwitchOn] = useState(false)

  // ProgressBar demo
  const [progressValue, setProgressValue] = useState(65)

  // LeftColumnOverlay demo
  const [overlayDemo, setOverlayDemo] = useState<0 | 30 | 50>(0)

  // TokenTable demo
  const [tokenTableHidden, setTokenTableHidden] = useState(false)

  // Drawer (Right Panel) demo
  const [panelPhase, setPanelPhase] = useState<OperationPhase>('idle')
  const [panelOp, setPanelOp] = useState<OperationType>('shield')
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <div style={{ padding: '56px 72px' }}>
      <NotificationContainer items={notifications} onDismiss={dismissNotification} />

        {/* Page header */}
        <div style={{ marginBottom: '80px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Design System</h1>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.65, maxWidth: '520px' }}>
            Token-first, state-aware component library for ShieldPay. Every component maps to a moment in the operation lifecycle.
          </p>
        </div>

        {/* ═══ FOUNDATION ═════════════════════════════ */}

        {/* Color */}
        <Section id="color" title="Color" description="Four-color brand palette with semantic extensions for surfaces, text, and operation states. All status colors meet WCAG AA on white (≥ 4.5:1).">
          {COLOR_GROUPS.map(group => (
            <Subsection key={group.label} title={group.label}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {group.tokens.map(t => <ColorSwatch key={t.name} name={t.name} value={t.value} desc={t.desc} />)}
              </div>
            </Subsection>
          ))}
        </Section>

        {/* Typography */}
        <Section id="typography" title="Typography" description="Inter — humanist sans-serif, 4 weights. Bold display sizes signal hierarchy. Monospace stays system-level for crypto addresses. font-size ≥ 16px on inputs prevents iOS auto-zoom.">
          <Subsection title="Type scale">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {TYPE_SCALE.map(t => (
                <div key={t.token} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'baseline', gap: '32px', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: t.size, fontWeight: t.weight, color: 'var(--color-text-primary)', fontFamily: t.mono ? 'monospace' : undefined, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.sample}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-public)' }}>{t.token}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.size} · weight {t.weight} — {t.usage}</span>
                  </div>
                </div>
              ))}
            </div>
          </Subsection>
          <Subsection title="Weight scale">
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {WEIGHT_SCALE.map(w => (
                <div key={w.token} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '28px', fontWeight: w.value, color: 'var(--color-text-primary)', lineHeight: 1 }}>Aa</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{w.label} · {w.value}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{w.token}</span>
                </div>
              ))}
            </div>
          </Subsection>
          <Subsection title="Tabular numerals">
            <div style={{ display: 'flex', gap: '48px' }}>
              {[{ label: 'Without', numeric: undefined }, { label: 'With font-variant-numeric: tabular-nums', numeric: 'tabular-nums' as const }].map(({ label, numeric }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: numeric, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>1,174.00</span><span>  874.50</span><span>2,913.40</span>
                  </div>
                </div>
              ))}
            </div>
          </Subsection>
        </Section>

        {/* Spacing */}
        <Section id="spacing" title="Spacing" description="4px base grid. All padding, margin, and gap values must use a spacing token. Never hardcode a spacing value in a component.">
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {SPACING_SCALE.map(n => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ height: '48px', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '28px', height: `${Math.max(n * 4, 4)}px`, background: 'var(--color-blue)', borderRadius: '3px', opacity: 0.2 + (n / 12) * 0.8 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{n}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{n * 4}px</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '32px', padding: '16px 20px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Usage:</strong> Use <code style={{ fontFamily: 'monospace', color: 'var(--color-public)' }}>var(--space-N)</code> in inline styles. Composite spacing may combine two tokens on separate axes (e.g. padding: 12px 20px = space-3 / space-5).
          </div>
        </Section>

        {/* Border Radius */}
        <Section id="radius" title="Border Radius" description="Six-step scale from tight UI elements to fully rounded pills. Mixing unlisted radii breaks visual rhythm — always use a token.">
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {RADIUS_SCALE.map(r => (
              <div key={r.token} style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', minWidth: '88px' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(55,72,255,0.08)', border: '1.5px solid rgba(55,72,255,0.2)', borderRadius: r.value }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace', marginBottom: '3px' }}>{r.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{r.usage}</div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-public)', marginTop: '3px' }}>{r.token}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Elevation */}
        <Section id="elevation" title="Elevation" description="Four-level shadow scale using Midnight at low opacity. Higher layers carry more visual weight. Drawer always sits at the top of the elevation hierarchy.">
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {SHADOW_SCALE.map(s => (
              <div key={s.token} style={{ flex: 1, minWidth: '160px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)', padding: '24px 20px', boxShadow: s.value, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>shadow-{s.label}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{s.usage}</span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-public)', marginTop: '6px' }}>{s.token}</span>
              </div>
            ))}
          </div>
          <Subsection title="Elevation map">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {[
                { layer: 'Page surface', token: 'none', desc: 'Background, page fills' },
                { layer: 'Cards', token: '--shadow-md', desc: 'BalanceCard, ActivityRow container' },
                { layer: 'Floating panels', token: '--shadow-lg', desc: 'Dropdowns, StatusPersistenceBanner' },
                { layer: 'Right panel', token: '--shadow-xl', desc: 'Drawer — always top of hierarchy' },
              ].map(row => (
                <div key={row.layer} style={{ display: 'grid', gridTemplateColumns: '160px 200px 1fr', gap: '24px', padding: '13px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.layer}</span>
                  <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-public)' }}>{row.token}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{row.desc}</span>
                </div>
              ))}
            </div>
          </Subsection>
        </Section>

        {/* Motion */}
        <Section id="motion" title="Motion" description="Motion expresses system state — never decoration. UIPlaybook's three principles: Predictable, Purposeful, Playful. Respect prefers-reduced-motion.">
          <Subsection title="Principles">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '8px' }}>
              {[
                { p: 'Predictable', desc: 'Consistent spatial understanding. Objects enter and leave symmetrically. Users build intuition for future interactions.', color: 'var(--color-public)' },
                { p: 'Purposeful', desc: 'Motion has informative intent — highlights connections, gives focal points, responds to user actions. Makes the interface feel alive.', color: 'var(--color-shielded)' },
                { p: 'Playful', desc: 'Delightful, unexpected moments on success states and empty screens. Celebrates the user journey. Used sparingly.', color: 'var(--color-success)' },
              ].map(({ p, desc, color }) => (
                <div key={p} style={{ padding: '20px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', borderTop: `3px solid ${color}` }}>
                  <div style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>{p}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection title="Tiers">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {[
                { tier: 'A — Primitive CSS', desc: 'Hover transitions, pulse indicators, spin. No external libraries.', examples: 'StatusBadge pulse, ActivityRow spinner, Button hover' },
                { tier: 'B — Entrance / Exit', desc: 'Entrance and exit animations for elements appearing or disappearing. Prevents jarring visual jumps.', examples: 'LeftColumnOverlay fade, Notification entrance, Drawer slide' },
                { tier: 'C — Advanced', desc: 'SVG animations, animated logos, skeleton loaders. Brand character.', examples: 'Reserved — future loading states' },
              ].map(row => (
                <div key={row.tier} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gap: '24px', padding: '14px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{row.tier}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{row.desc}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-public)', fontFamily: 'monospace' }}>{row.examples}</span>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection title="Duration">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {DURATION_SCALE.map(d => <TokenRow key={d.token} token={d.token} value={d.value} extra={d.usage} />)}
            </div>
          </Subsection>

          <Subsection title="Easing">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {EASING_SCALE.map(e => (
                <div key={e.token} style={{ display: 'grid', gridTemplateColumns: '120px 260px 1fr', alignItems: 'center', gap: '24px', padding: '13px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{e.label}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-public)' }}>{e.value}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{e.usage}</span>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection title="Named animations">
            <div style={{ display: 'flex', gap: '48px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { name: 'spin', sub: '0.8s · linear · ∞', desc: 'In-progress states', el: <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-processing)', animation: 'spin 0.8s linear infinite' }} /> },
                { name: 'pulse-badge', sub: '1.5s · ease-in-out · ∞', desc: 'Action required, urgency', el: <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--color-warning)', animation: 'pulse-badge 1.5s ease-in-out infinite' }} /> },
                { name: 'fade-in', sub: 'var(--duration-slow) · ease-out', desc: 'Overlays, panel entrances', el: <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(55,72,255,0.12)', animation: 'fade-in 0.8s var(--ease-out) infinite alternate' }} /> },
              ].map(a => (
                <div key={a.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  {a.el}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace', marginBottom: '2px' }}>{a.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{a.sub}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Subsection>

          <div style={{ padding: '16px 20px', background: 'rgba(55,72,255,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(55,72,255,0.12)' }}>
            <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-public)', marginBottom: '4px' }}>prefers-reduced-motion rule</div>
            <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Default to <em>no animations</em> and add them for users who haven't opted out — not the other way around. Wrap all animations in <code style={{ fontFamily: 'monospace' }}>@media (prefers-reduced-motion: no-preference)</code>. Priority targets: <code style={{ fontFamily: 'monospace' }}>pulse-badge</code>, <code style={{ fontFamily: 'monospace' }}>spin</code>, LeftColumnOverlay transition.
            </div>
          </div>
        </Section>

        {/* Layout */}
        <Section id="layout" title="Layout" description="Three-zone desktop layout. All financial operations happen inside the right panel — the left column is the information layer.">
          <div style={{ background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', height: '180px', marginBottom: '20px' }}>
              <div style={{ width: '64px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px' }}>
                {[0, 1, 2, 3].map(i => <div key={i} style={{ width: '40px', height: '8px', borderRadius: '4px', background: i === 0 ? 'var(--color-blue)' : 'var(--color-border)' }} />)}
              </div>
              <div style={{ flex: 1, background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                <div style={{ height: '28px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ height: '40px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ flex: 1, background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ width: '120px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-blue)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                <div style={{ height: '20px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ flex: 1, background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ height: '28px', background: 'var(--color-blue)', borderRadius: 'var(--radius-md)', opacity: 0.85 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '64px', textAlign: 'center' }}><div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '3px' }}>Sidebar</div><div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-public)' }}>220px</div></div>
              <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '3px' }}>Left column</div><div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Flexible — content layer</div></div>
              <div style={{ width: '120px', textAlign: 'center' }}><div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-public)', marginBottom: '3px' }}>Right panel</div><div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-public)' }}>380px fixed</div></div>
            </div>
          </div>
          <Subsection title="Layout tokens">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              <TokenRow token="--layout-nav-height" value="61px" extra="Sticky top navigation bar" />
              <TokenRow token="--layout-sidebar-width" value="220px" extra="Collapsible app sidebar" />
              <TokenRow token="--layout-right-panel-width" value="380px" extra="Fixed transaction widget — never changes" />
            </div>
          </Subsection>
        </Section>

        {/* Accessibility */}
        <Section id="accessibility" title="Accessibility" description="WCAG AA minimum across all components. Keyboard-navigable, screen-reader-announced, motion-respectful. Accessibility is not a layer added at the end — it is built into every token and component.">
          <Subsection title="ARIA roles in ShieldPay">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {[
                { role: 'role="alert"', usage: 'Urgent messages (errors, network failures)', component: 'Notification — error variant' },
                { role: 'role="status"', usage: 'Non-urgent updates (saved, processing)', component: 'Notification — info / success / warning' },
                { role: 'aria-live="polite"', usage: 'Announce dynamic content changes', component: 'StatusPersistenceBanner, ActivityRow' },
                { role: 'aria-invalid="true"', usage: 'Signal invalid field to screen readers', component: 'TextField — error state' },
                { role: 'aria-describedby', usage: 'Link inputs to their hint or error text', component: 'TextField — hint and error labels' },
                { role: 'aria-label', usage: 'Label icon-only controls without visible text', component: 'Button icon-only, BalanceCard eye toggle' },
                { role: 'aria-disabled="true"', usage: 'Communicate disabled state semantically', component: 'Button — disabled and loading states' },
                { role: 'aria-busy="true"', usage: 'Signal async operation in progress', component: 'Button — loading state' },
                { role: 'aria-hidden="true"', usage: 'Hide decorative elements from assistive tech', component: 'Icons inside buttons and badges' },
              ].map(row => (
                <div key={row.role} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 200px', gap: '24px', padding: '12px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'baseline' }}>
                  <code style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-public)', fontWeight: 500 }}>{row.role}</code>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{row.usage}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{row.component}</span>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection title="Keyboard navigation requirements">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'Tab / Shift+Tab', rule: 'Navigate between all interactive elements in visual order.' },
                { key: 'Enter / Space', rule: 'Activate buttons and interactive controls.' },
                { key: 'Escape', rule: 'Dismiss modals, sheets, and NavigationWarning dialogs.' },
                { key: 'Focus ring', rule: 'Always visible on keyboard focus — never outline: 0 without a custom alternative. Uses 2px blue outline at 2px offset.' },
              ].map(({ key, rule }) => (
                <div key={key} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px', fontSize: '13px', alignItems: 'baseline' }}>
                  <code style={{ fontFamily: 'monospace', color: 'var(--color-public)', fontWeight: 600 }}>{key}</code>
                  <span style={{ color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{rule}</span>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection title="Touch targets">
            <div style={{ padding: '20px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '32px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(55,72,255,0.15)', border: '2px dashed var(--color-blue)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <div style={{ width: '20px', height: '20px', background: 'var(--color-blue)', borderRadius: '4px', opacity: 0.8 }} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>44 × 44px</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>W3C minimum</div>
              </div>
              <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, flex: 1 }}>
                All interactive elements must have a minimum tap target of <strong style={{ color: 'var(--color-text-primary)' }}>44 × 44px</strong>. Use <code style={{ fontFamily: 'monospace', color: 'var(--color-public)' }}>min-width</code> / <code style={{ fontFamily: 'monospace', color: 'var(--color-public)' }}>min-height</code> or extend the hit area with padding when the visual size is smaller (e.g. icon buttons, eye toggles).
              </div>
            </div>
          </Subsection>

          <Subsection title="Color contrast">
            <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '12px' }}>
              All text/background pairings must meet <strong style={{ color: 'var(--color-text-primary)' }}>WCAG AA</strong>: normal text ≥ 4.5:1, large text ≥ 3:1. All status colors in this system are verified on white. Never convey information through color alone — always pair with an icon or label.
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { bg: 'var(--color-text-primary)', fg: '#fff', label: 'Text / White', ratio: '17.7:1' },
                { bg: 'var(--color-blue)', fg: '#fff', label: 'Blue / White', ratio: '5.0:1' },
                { bg: 'var(--color-success)', fg: '#fff', label: 'Success / White', ratio: '4.8:1' },
                { bg: 'var(--color-error)', fg: '#fff', label: 'Error / White', ratio: '5.2:1' },
              ].map(({ bg, fg, label, ratio }) => (
                <div key={label} style={{ background: bg, color: fg, padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '120px' }}>
                  <span>{label}</span>
                  <span style={{ opacity: 0.8, fontFamily: 'monospace' }}>{ratio}</span>
                </div>
              ))}
            </div>
          </Subsection>
        </Section>

        {/* ═══ COMPONENTS ═════════════════════════════ */}
        <SectionDivider label="Components" />

        {/* Button */}
        <Section id="button" title="Button" description="Interactive element for triggering actions. Always uses native <button>. Never a <div>. Six variants — one primary CTA per view.">
          <Subsection title="Variants">
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </Subsection>

          <Subsection title="States">
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
              <Button variant="primary">Default</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="primary" loading>Loading</Button>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="secondary">Default</Button>
              <Button variant="secondary" disabled>Disabled</Button>
              <Button variant="secondary" loading>Loading</Button>
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Hover and active states are visible on interaction. Loading state locks dimensions — no layout shift.
            </div>
          </Subsection>

          <Subsection title="Sizes">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button size="sm" variant="secondary">Small · 32px</Button>
              <Button size="md" variant="secondary">Medium · 40px</Button>
              <Button size="lg" variant="secondary">Large · 48px</Button>
            </div>
          </Subsection>

          <Subsection title="With icons">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button leftIcon={<ShieldCheck size={16} />}>Shield funds</Button>
              <Button variant="secondary" rightIcon={<ArrowRight size={16} />}>Continue</Button>
              <Button variant="ghost" iconOnly aria-label="View shielded balance">
                <Eye size={16} />
              </Button>
              <Button variant="secondary" iconOnly aria-label="Search">
                <Search size={16} />
              </Button>
            </div>
          </Subsection>

          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'container', desc: 'Native <button> element. Never use <div> or <a> without proper ARIA.' },
              { name: 'spinner', desc: 'Replaces left-icon in loading state. Button dimensions stay fixed — no reflow.' },
              { name: 'left-icon', desc: 'Optional. 16px icon, aria-hidden. Gap reduces to 6px when paired with label.' },
              { name: 'label', desc: 'Required unless icon-only. Succinct, action-oriented. No truncation.' },
              { name: 'right-icon', desc: 'Optional. Use for directional cues (→, ↗). aria-hidden.' },
            ]} />
          </Subsection>

          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Use `primary` for the single forward action per view: "Shield funds →", "Confirm", "Connect wallet".',
                'Use `secondary` alongside a primary for reversible alternatives: "Cancel", "Go back".',
                'Use `destructive` only for irreversible fund-affecting actions, always with a confirmation step.',
                'Switch to `loading` state immediately on submission — before the wallet popup opens.',
                'Add `aria-label` on icon-only buttons (eye toggle, close, external link).',
              ]}
              donts={[
                "Don't use more than one `primary` button in the same view section.",
                "Don't disable while async work is pending — show `loading` instead; disabling traps users.",
                "Don't keep `loading` state after the operation moves to `awaiting_wallet_confirmation` — WalletConfirmationPrompt takes over focus.",
                "Don't use a button for state toggles (use Switch) or navigation labels (use links).",
              ]}
            />
          </Subsection>
        </Section>

        {/* TextField */}
        <Section id="text-field" title="TextField" description="Input field for user-entered data. Label always visible above. Hint and error occupy the same slot below — error wins. Font-size ≥ 16px to prevent iOS auto-zoom.">
          <Subsection title="Default — label + hint">
            <div style={{ maxWidth: '360px' }}>
              <TextField
                label="Amount"
                hint="Enter amount in ETH. Minimum 0.001 ETH."
                placeholder="0.00"
                inputMode="decimal"
                value={tfValue}
                onChange={e => setTfValue(e.target.value)}
              />
            </div>
          </Subsection>

          <Subsection title="States">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '720px' }}>
              <TextField label="Default" placeholder="0x…" />
              <TextField
                label="Error"
                error="Amount exceeds your public balance."
                value="9.99"
                onChange={() => {}}
              />
              <TextField label="Disabled" disabled placeholder="0.00" defaultValue="0.50" />
              <TextField label="Read-only" readOnly defaultValue="0x1a2b3c4d…9f" />
            </div>
          </Subsection>

          <Subsection title="With icons">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '360px' }}>
              <TextField label="Recipient address" leftIcon={<Wallet size={16} />} placeholder="0x…" hint="Enter the recipient's public wallet address." />
              <TextField label="Search" leftIcon={<Search size={16} />} placeholder="Search transactions…" />
            </div>
          </Subsection>

          <Subsection title="Required field">
            <div style={{ maxWidth: '360px' }}>
              <TextField label="Recipient address" required placeholder="0x…" hint="Required to send shielded funds." />
            </div>
          </Subsection>

          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'label', desc: 'Always above the input. Never use placeholder as a label substitute — it disappears on focus.' },
              { name: 'required-indicator', desc: 'Red asterisk (*) when required. aria-hidden — conveyed semantically via aria-required.' },
              { name: 'left-icon', desc: 'Clarifies input type (Wallet, Search). aria-hidden. Adds 38px left padding to input.' },
              { name: 'input', desc: 'font-size: 16px minimum (prevents iOS auto-zoom). Use inputmode="decimal" for numbers, not type="number".' },
              { name: 'right-icon', desc: 'Provides in-field action (clear, show/hide password). Needs explicit aria-label if interactive.' },
              { name: 'hint', desc: 'Persistent helper text below input. Linked via aria-describedby.' },
              { name: 'error', desc: 'Replaces hint when validation fails. aria-invalid="true" on input. Validated on blur, not on keystroke.' },
            ]} />
          </Subsection>

          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Use `inputmode="decimal"` for all crypto amount fields — never `type="number"`.',
                'Use the `hint` prop to show available balance beneath the amount input: "Available: 4.28 ETH".',
                'Validate on blur only — not on keystroke; premature errors interrupt typing.',
                'Label amount inputs "Amount" — never "ETH amount"; currency denomination is shown separately.',
                'Set font-size ≥ 16px to prevent iOS auto-zoom on focus.',
              ]}
              donts={[
                "Don't use `type=\"number\"` — scroll-wheel changes silently corrupt crypto amounts.",
                "Don't use placeholder as the only label — it disappears when the user types.",
                "Don't show validation errors before the user has blurred the field.",
                "Don't use TextField for wallet address display — use the mono type token instead.",
              ]}
            />
          </Subsection>
        </Section>

        {/* Notification */}
        <Section id="notification" title="Notification" description="Informational messages giving feedback on action outcomes. Non-intrusive — never interrupts workflow. 4s standard, 10s actionable. Timer pauses on hover. Max 3 stacked.">
          <Subsection title="All variants">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              {([
                { variant: 'info' as const,    dot: 'var(--color-processing)', bg: 'rgba(55,72,255,0.06)',  title: 'Processing',         desc: 'Your shield operation is running',   label: 'Info' },
                { variant: 'success' as const, dot: 'var(--color-success)',    bg: 'rgba(91,184,30,0.07)',  title: 'Shielded',           desc: '1.5 ETH added to private balance',   label: 'Success' },
                { variant: 'warning' as const, dot: 'var(--color-warning)',    bg: 'rgba(245,207,0,0.10)',  title: 'Slow network',       desc: 'Estimated 4+ minutes',               label: 'Warning' },
                { variant: 'error' as const,   dot: 'var(--color-error)',      bg: 'rgba(185,28,28,0.07)',  title: 'Transaction failed', desc: 'Your funds are safe',                label: 'Error' },
              ]).map(({ dot, bg, title, desc, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '16px 20px',
                  background: bg,
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, flexShrink: 0, marginTop: '4px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>{title}</div>
                    <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>{desc}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', flexShrink: 0 }}>{label}</span>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection title="Timing rules">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              <TokenRow token="standard" value="4 000ms" extra="Informational messages — auto-dismiss" />
              <TokenRow token="actionable" value="10 000ms" extra="Notifications with action buttons — extra time to read and act" />
              <TokenRow token="pause-on-hover" value="—" extra="Timer freezes when pointer enters; resumes on mouse leave" />
              <TokenRow token="max-stack" value="3" extra="Oldest notification silently dismissed when limit is exceeded" />
            </div>
          </Subsection>

          <Subsection title="ARIA roles">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'baseline' }}>
                <code style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-public)' }}>role="alert"</code>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Urgent messages requiring immediate attention (error variant). Announced assertively by screen readers.</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'baseline' }}>
                <code style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-public)' }}>role="status"</code>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Non-urgent updates (info, success, warning). Announced politely — respects the user's current focus.</span>
              </div>
            </div>
          </Subsection>

          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Use for lightweight transient feedback: "Copied to clipboard", "Transaction submitted".',
                'Position bottom-left — Drawer owns the right side during active operations.',
                'Use `role="alert"` only for unexpected errors; `role="status"` for operation progress events.',
                'Auto-dismiss informational and success notifications after 5s; never auto-dismiss actionable ones.',
              ]}
              donts={[
                "Don't use Notification for operation phase changes — use StatusPersistenceBanner (persists across navigation) or the Drawer state (in-flow).",
                "Don't use for inline form errors — those belong in the TextField `error` prop.",
                "Don't show while WalletConfirmationPrompt is active — competing messages break focus.",
                "Don't stack more than 3 — dismiss the oldest silently when exceeded.",
              ]}
            />
          </Subsection>
        </Section>

        {/* StatusBadge */}
        <Section id="status-badge" title="StatusBadge" description="Inline badge for operation status. Eight variants covering the full lifecycle. action-required pulses to signal urgency — it is the only animated badge variant.">
          <Subsection title="All variants">
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <StatusBadge variant="processing" />
              <StatusBadge variant="success" />
              <StatusBadge variant="failed" />
              <StatusBadge variant="cancelled" />
              <StatusBadge variant="pending" />
              <StatusBadge variant="action-required" />
              <StatusBadge variant="destructive" />
              <StatusBadge variant="outline" />
            </div>
          </Subsection>
          <Subsection title="Custom labels">
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <StatusBadge variant="processing" label="Encrypting…" />
              <StatusBadge variant="processing" label="Waiting for proof…" />
              <StatusBadge variant="action-required" label="Complete required" />
            </div>
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'dot', desc: '6px circle. Color matches text token. Pulses only on action-required.' },
              { name: 'label', desc: 'Default label derived from variant. Overridable. Never truncated.' },
              { name: 'container', desc: 'Pill shape (border-radius: full). Background is 15% opacity of the dot color.' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Map badge variants directly to operation phases: `processing` → processing/finalizing; `action-required` → proof_ready; `completed` → completed; `failed` → any failure type.',
                'Override the label with specific phase copy: "Encrypting…" not "Processing", "Waiting for proof…" not "Action required".',
                'Use `action-required` (pulsing) only when the user must tap to continue — proof_ready unshield is the only such phase in the current flow.',
                'Pair with PhaseIndicator inside the Drawer; use standalone in ActivityRow.',
              ]}
              donts={[
                "Don't use `action-required` during `processing` or `finalizing` — the user has nothing to do and the pulse creates false urgency.",
                "Don't use `completed` during the `finalizing` phase — Etherscan shows 'Success' but the private balance is still computing.",
                "Don't show more than one badge per ActivityRow.",
              ]}
            />
          </Subsection>
        </Section>

        {/* PhaseIndicator */}
        <Section id="phase-indicator" title="PhaseIndicator" description="Horizontal progress track for operation phases. Not a numbered stepper — users aren't doing steps; the system is. Labels are always visible, never hover-only.">
          <Subsection title="Variants">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {(['State', 'Horizontal', 'Vertical'] as const).map(col => (
                    <th key={col} style={{
                      padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: 'var(--color-text-secondary)', borderBottom: '2px solid var(--color-border)',
                      whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  { op: 'shield' as const, phase: 0, label: 'Shield · phase 0 (Auth)',      vert: { op: 'shield' as const, phase: 0 } },
                  { op: 'shield' as const, phase: 2, label: 'Shield · phase 2 (Encrypt)',   vert: { op: 'shield' as const, phase: 2 } },
                  { op: 'shield' as const, phase: 3, label: 'Shield · phase 3 (Done)',      vert: { op: 'shield' as const, phase: 3 } },
                  { op: 'send' as const,   phase: 2, label: 'Send · phase 2 (Encrypt)',     vert: { op: 'send'   as const, phase: 2 } },
                  { op: 'unshield' as const, phase: 1, label: 'Unshield · phase 1 (Wait)',  vert: { op: 'unshield' as const, phase: 1 } },
                ]).map(({ op, phase, label, vert }, i) => (
                  <tr key={label} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--color-surface-subtle)' }}>
                    <td style={{ padding: '20px 16px', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontWeight: 500, whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
                      {label}
                    </td>
                    <td style={{ padding: '20px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle', minWidth: '280px' }}>
                      <PhaseIndicator phases={[]} currentPhase={phase} operation={op} />
                    </td>
                    <td style={{ padding: '20px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
                      <PhaseIndicatorVertical phases={[]} currentPhase={vert.phase} operation={vert.op} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'track', desc: '2px horizontal line between nodes. Filled (--color-shielded) for completed segments, --color-border for upcoming.' },
              { name: 'node', desc: 'Circular dot. done: 8px filled. current: 12px with 2px border + glow. upcoming: 8px border only.' },
              { name: 'label', desc: 'Always visible below each node. Current phase is bold. Never hidden behind hover.' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Use inside the Drawer during active shield/unshield operations — this is its only placement in the app.',
                'Show all 4 phases even when one is near-instant — skipping phases makes users doubt whether the system is progressing.',
                'Treat `processing` and `finalizing` as separate phases — the on-chain confirmation and FHE computation are distinct steps that must not be merged.',
                'Use the vertical variant inside the Drawer; horizontal only in wider standalone contexts.',
              ]}
              donts={[
                "Don't use as a multi-step form wizard — it shows what the system is doing, not what the user must do.",
                "Don't mark `finalizing` complete until the private balance has updated — the transaction confirming on-chain is not the end of the operation.",
                "Don't hide or abbreviate phase labels — they are the primary communication mechanism during a wait.",
                "Don't render outside the Drawer — it belongs to the in-flight operation context only.",
              ]}
            />
          </Subsection>
        </Section>

        {/* Card */}
        <Section id="card" title="Card" description="General-purpose surface container with sub-components for structured content. Uses --radius-lg and --shadow-sm. Cards group related content and actions into a single coherent unit.">
          <Subsection title="Anatomy">
            {/* Callout diagram */}
            <div style={{ position: 'relative', width: '580px', height: '310px', margin: '0 auto 32px' }}>
              {/* Card */}
              <div style={{ position: 'absolute', left: '120px', top: '20px', width: '290px' }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Shield your funds</CardTitle>
                    <CardDescription>Move ETH from your public balance to an encrypted private balance.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                        <span>Available</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>1.24 ETH</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                        <span>Network fee</span>
                        <span>~$0.42</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter style={{ gap: '8px' }}>
                    <Button variant="primary" style={{ flex: 1 }}>Shield</Button>
                    <Button variant="secondary" style={{ flex: 1 }}>Cancel</Button>
                  </CardFooter>
                </Card>
              </div>

              {/* SVG connecting lines */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '580px', height: '310px', pointerEvents: 'none', overflow: 'visible' }}>
                {/* 1 — Container: left side, top */}
                <line x1="46" y1="32" x2="120" y2="32" stroke="#14141A" strokeWidth="1" />
                <rect x="118" y="30" width="3" height="3" fill="#14141A" />
                {/* 2 — CardHeader: right side */}
                <line x1="410" y1="72" x2="456" y2="72" stroke="#14141A" strokeWidth="1" />
                <rect x="409" y="70" width="3" height="3" fill="#14141A" />
                {/* 3 — CardContent: right side */}
                <line x1="410" y1="175" x2="456" y2="175" stroke="#14141A" strokeWidth="1" />
                <rect x="409" y="173" width="3" height="3" fill="#14141A" />
                {/* 4 — CardFooter: left side, bottom */}
                <line x1="46" y1="262" x2="120" y2="262" stroke="#14141A" strokeWidth="1" />
                <rect x="118" y="260" width="3" height="3" fill="#14141A" />
              </svg>

              {/* Callout circles — numbers only, descriptions in legend below */}
              {([
                { n: 1, x: 20, y: 19 },
                { n: 2, x: 456, y: 59 },
                { n: 3, x: 456, y: 162 },
                { n: 4, x: 20, y: 249 },
              ]).map(({ n, x, y }) => (
                <div key={n} style={{ position: 'absolute', left: `${x}px`, top: `${y}px` }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: '#14141A', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700,
                  }}>{n}</div>
                </div>
              ))}
            </div>

            {/* Parts legend */}
            <Anatomy parts={[
              { name: '① Container', desc: 'Root surface. background: --color-surface-raised. border: 1px solid --color-border. border-radius: --radius-lg. box-shadow: --shadow-sm. overflow: hidden.' },
              { name: '② CardHeader', desc: 'Padding 24px 24px 0. Stacks CardTitle + optional CardDescription. Never include actions here.' },
              { name: '③ CardContent', desc: 'Main body. Padding 24px. Holds data rows, input fields, or status displays. Scrollable if content overflows.' },
              { name: '④ CardFooter', desc: 'Action area. Padding 0 24px 24px. Flex row, left-aligned. Max 2 actions per card.' },
              { name: 'CardTitle', desc: 'h3 element. --text-heading, semibold. States the primary subject of the card.' },
              { name: 'CardDescription', desc: 'Optional paragraph below title. --text-small, --color-text-secondary. Two lines max.' },
              { name: 'divider', desc: 'Optional 1px --color-border between sections. Applied at the Header/Content boundary when visual separation is needed.' },
            ]} />
          </Subsection>

          <Subsection title="Types">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {/* Basic */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Basic — informational</div>
                <Card>
                  <CardHeader>
                    <CardTitle>Operation summary</CardTitle>
                    <CardDescription>Your shielded balance was updated 2 minutes ago.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>No actions required.</div>
                  </CardContent>
                </Card>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Header + content only. No footer.</div>
              </div>
              {/* Action */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Action — primary interaction</div>
                <Card>
                  <CardHeader>
                    <CardTitle>Confirm shielding</CardTitle>
                    <CardDescription>0.50 ETH will be moved to your private balance.</CardDescription>
                  </CardHeader>
                  <CardFooter style={{ gap: '8px', paddingTop: '20px' }}>
                    <Button variant="primary" style={{ flex: 1 }}>Confirm</Button>
                    <Button variant="secondary" style={{ flex: 1 }}>Cancel</Button>
                  </CardFooter>
                </Card>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Header + footer. Up to 2 actions.</div>
              </div>
              {/* Status */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Status — outcome display</div>
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction complete</CardTitle>
                    <CardDescription>Your private balance has been updated.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <StatusBadge variant="success" label="Encrypted" />
                      <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>0.50 ETH shielded</span>
                    </div>
                  </CardContent>
                </Card>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Header + StatusBadge in content.</div>
              </div>
              {/* Summary */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Summary — compact single value</div>
                <Card>
                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Total shielded</div>
                      <div style={{ fontSize: 'var(--text-display)', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>0.50 <span style={{ fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>ETH</span></div>
                      <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>~$1,175.00</div>
                    </div>
                  </CardContent>
                </Card>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Content only. No header, no footer.</div>
              </div>
            </div>
          </Subsection>

          <Subsection title="Actions">
            <Anatomy parts={[
              { name: 'Primary action', desc: 'Full-width or flex:1 button in CardFooter. variant="primary". One per card maximum. Represents the single most important next step.' },
              { name: 'Secondary action', desc: 'Alongside primary. variant="secondary" or "ghost". Always positioned after (right of) the primary action. Never replaces primary.' },
              { name: 'Destructive action', desc: 'variant="destructive". Always paired with a Cancel secondary. Use only when the action cannot be undone (e.g., deleting an operation).' },
              { name: 'No implicit tap target', desc: 'Cards are never tappable containers. All actions are explicit, labeled buttons in CardFooter. Never attach onClick to the Card root.' },
            ]} />
          </Subsection>

          <Subsection title="Indicators">
            <Anatomy parts={[
              { name: 'StatusBadge', desc: 'Inline in CardContent. Shows operation phase or outcome. One badge per card.' },
              { name: 'ProgressBar', desc: 'In CardContent for operations with a known completion state (e.g., proof generation at 60%).' },
              { name: 'Delta', desc: 'Signed change value (+0.30 ETH, −0.50 ETH) in CardContent or below the amount. Color-coded: --color-success (positive), --color-error (negative).' },
              { name: 'Operation icon', desc: 'Optional 16px icon in CardHeader alongside the title. Identifies operation type (Shield, Send, Unshield). Never decorative-only.' },
            ]} />
          </Subsection>

          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Use Card for self-contained content units with a single action: a fee summary, a confirmation step, a token detail.',
                'Use Card for the ConnectWallet flow — it lives on the full `/connect` page and expands inline; never in a drawer or modal.',
                'Use `CardDescription` to say what will happen next, not instructions for what the user must do.',
                'Limit `CardFooter` to one primary and one secondary action at most.',
              ]}
              donts={[
                "Don't use Card for multi-phase operation UI — that belongs in the Drawer.",
                "Don't use Card as a drawer or modal substitute — it is always in the document flow.",
                "Don't nest Card inside Card — use sections or layout primitives for hierarchy.",
                "Don't put an amount input and a CTA in the same Card — the shield form is its own full view, not a card.",
              ]}
            />
          </Subsection>
        </Section>

        {/* Switch */}
        <Section id="switch" title="Switch" description="Binary toggle for on/off settings. Uses role=switch and aria-checked for accessibility. Never use for actions — only persistent settings.">
          <Subsection title="States">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Switch checked={switchOn} onChange={setSwitchOn} label={switchOn ? 'Shielded mode on' : 'Shielded mode off'} />
              <Switch checked={true} onChange={() => {}} label="Always on (disabled)" disabled />
              <Switch checked={false} onChange={() => {}} label="Always off (disabled)" disabled />
            </div>
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'track', desc: '44×24px pill. Background: --color-blue (on) or --color-border (off). Transitions on background change.' },
              { name: 'thumb', desc: '20×20px white circle with --shadow-sm. Translates 20px on checked state.' },
              { name: 'label', desc: 'Optional. Renders as <label> with htmlFor wiring. Click toggles the switch.' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Use for persistent binary settings that apply immediately: balance visibility, notification preferences.',
                'Always pair with a visible label — the track alone is ambiguous without context.',
                'Apply the change on toggle — no Save step.',
              ]}
              donts={[
                "Don't use for initiating operations — use Button for shield, unshield, send actions.",
                "Don't place inside forms that require explicit submission — Switch state is live, not staged.",
                "Don't rely on color alone to convey state — thumb position is the primary indicator.",
              ]}
            />
          </Subsection>
        </Section>

        {/* ProgressBar */}
        <Section id="progress-bar" title="ProgressBar" description="Determinate progress indicator for operations with a known completion state. Always use ARIA attributes for accessibility.">
          <Subsection title="Variants">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
              <ProgressBar value={progressValue} label="Encrypting balance" showValue />
              <ProgressBar value={progressValue} variant="success" label="Shielded" showValue />
              <ProgressBar value={progressValue} variant="warning" label="Network congestion" showValue />
              <ProgressBar value={progressValue} variant="destructive" label="Failed" showValue />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
              <Button size="sm" variant="secondary" onClick={() => setProgressValue(v => Math.max(0, v - 10))}>−10</Button>
              <Button size="sm" variant="secondary" onClick={() => setProgressValue(v => Math.min(100, v + 10))}>+10</Button>
              <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>{progressValue}%</span>
            </div>
          </Subsection>
          <Subsection title="Sizes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
              <ProgressBar value={65} size="sm" label="sm · 4px" />
              <ProgressBar value={65} size="md" label="md · 8px" />
              <ProgressBar value={65} size="lg" label="lg · 12px" />
            </div>
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'track', desc: 'Full-width background bar. --color-surface-subtle. border-radius: full.' },
              { name: 'fill', desc: 'Colored inner bar. Width = (value / max) × 100%. Transitions on --duration-slow.' },
              { name: 'label', desc: 'Optional text above the bar. Left-aligned.' },
              { name: 'value', desc: 'Optional percentage display. Right-aligned next to label.' },
            ]} />
          </Subsection>
        </Section>

        {/* BalanceCard */}
        <Section id="balance-card" title="BalanceCard" description="Paired balance display used in the Overview. Both cards render side by side with dollar totals and stacked token avatars. A single page-level eye toggle controls the hidden state on both simultaneously.">
          <Subsection title="Overview layout — side by side">
            {/* Demo toggle — mirrors the page-level eye button in Overview, not part of BalanceCard itself */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setShieldedHidden(h => !h)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', display: 'flex', alignItems: 'center' }}
                aria-label={shieldedHidden ? 'Show all balances' : 'Hide all balances'}
              >
                {shieldedHidden ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Page-level toggle (lives outside BalanceCard in Overview)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <BalanceCard type="public" amount="$17,203" currency="" hidden={shieldedHidden} usdValue="5.19 ETH" tokenAvatars={OVERVIEW_PUBLIC_AVATARS} />
              <BalanceCard type="shielded" amount="$6,225" currency="" hidden={shieldedHidden} usdValue="1.88 ETH" tokenAvatars={OVERVIEW_SHIELDED_AVATARS} />
            </div>
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'header', desc: 'Icon + "Public / Shielded balance" label. The eye toggle is a page-level button that lives outside both cards — not part of the card itself.' },
              { name: 'amount', desc: 'display size, weight 700, tabular-nums. Replaced with "● ● ●" when hidden=true. Format depends on context: raw token amount on section pages (e.g. "4.28 ETH"), dollar total on Overview (e.g. "$17,203").' },
              { name: 'usd-value', desc: 'Secondary denomination. Hidden when amount is hidden.' },
              { name: 'bottom-right slot', desc: 'Stacked token avatars when tokenAvatars is provided (Overview). Falls back to a 3-letter symbol badge at 12% accent opacity when omitted (section pages).' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Always render both cards together — public and shielded are meaningless without each other.',
                'Pass tokenAvatars — stacked coin icons communicate that the balance spans multiple assets.',
                'Control hidden from a single page-level toggle that affects both cards simultaneously.',
              ]}
              donts={[
                "Don't add a per-card onToggleHidden — one toggle controls both cards, not each independently.",
                "Don't reveal balances by default — hidden=true is the safe starting state.",
                "Don't hardcode the accent color — always derive it from the type prop via semantic tokens.",
              ]}
            />
          </Subsection>
        </Section>

        {/* ActivityRow */}
        <Section id="activity-row" title="ActivityRow" description="Transaction history list item. Each row represents a single operation. In-progress rows always render first. Section headers divide in-progress from completed. Shielded transfer amounts are hidden by default.">

          {/* Two-column: demo | anatomy */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', alignItems: 'start', marginBottom: '40px' }}>

            {/* Left — all states demo */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>All states</div>
              <div style={{ background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', background: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>In-progress — always first</span>
                </div>
                <div style={{ padding: '0 20px' }}>
                  <ActivityRow
                    type="shield" amount="500.00" status="finalizing" date={NOW - 120000} hidden={false}
                    token={{ symbol: 'USDC', imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png' }}
                    pairedToken={{ symbol: 'cUSDC', imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png' }}
                  />
                  <ActivityRow
                    type="unshield" amount="200.00" status="proof_ready" date={NOW - 300000} hidden={false} onComplete={() => alert('Complete unshield →')}
                    token={{ symbol: 'cUSDC', imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png' }}
                    pairedToken={{ symbol: 'USDC', imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png' }}
                  />
                </div>
                <div style={{ padding: '10px 20px', background: 'var(--color-surface-subtle)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Completed</span>
                </div>
                <div style={{ padding: '0 20px' }}>
                  <ActivityRow
                    type="shield" amount="500.00" status="completed" date={NOW - 7200000} txHash="0xabc123" hidden={false}
                    token={{ symbol: 'USDC', imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png' }}
                    pairedToken={{ symbol: 'cUSDC', imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png' }}
                  />
                  <ActivityRow
                    type="send" amount="0.10" status="completed" date={NOW - 86400000} hidden={true}
                    token={{ symbol: 'cETH', imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/eth.png' }}
                    counterparty="0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b"
                  />
                  <ActivityRow
                    type="unshield" amount="200.00" status="completed" date={NOW - 172800000} txHash="0xdef456" hidden={false}
                    token={{ symbol: 'cUSDC', imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png' }}
                    pairedToken={{ symbol: 'USDC', imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/usdc.png' }}
                  />
                </div>
                <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>No more transactions</span>
                </div>
              </div>
            </div>

            {/* Right — anatomy */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Anatomy</div>
              <Anatomy parts={[
                { name: 'section-header', desc: 'Muted label dividing groups ("In-progress", "Completed"). bg: --color-surface-subtle, padding 12px 20px, weight 600.' },
                { name: 'leading element', desc: '64×64px circle, no background. Spinner (in-progress), pulsing Zap (action-required), static operation icon (completed). Icon size 28px.' },
                { name: 'primary text', desc: 'Operation label. --text-heading, weight 600, --color-text-primary. Always visible.' },
                { name: 'phase label', desc: 'Inline next to primary text on in-progress rows only. --text-small, --color-processing. ("Encrypting…", "Waiting for proof…").' },
                { name: 'secondary text', desc: 'Relative timestamp on line 2. --color-text-secondary, 12px.' },
                { name: 'trailing — amount', desc: 'Right-aligned, weight 600, tabular-nums. Hidden shielded amounts display as ● ● ●. #78350F for action-required.' },
                { name: 'trailing — action', desc: '"Complete →" button. Only on proof_ready unshield. Bordered amber pill.' },
                { name: 'trailing — tx-link', desc: 'ExternalLink 13px icon. Only on completed rows with txHash. aria-label required.' },
                { name: 'row divider', desc: '1px --color-border bottom on each row.' },
                { name: 'empty state', desc: '"No more transactions" centered at list bottom. Always present as list terminator.' },
              ]} />
            </div>
          </div>

          <Subsection title="Leading elements">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              <TokenRow token="in-progress" value="Spinner (24px)" extra="Animated CSS border-top spin. --color-processing. Communicates active system work." />
              <TokenRow token="action-required" value="Zap (28px, pulsing)" extra="pulse-badge animation. #78350F. Signals the user must act to continue." />
              <TokenRow token="completed" value="Operation icon (28px)" extra="Static ShieldCheck / ArrowUpRight / ArrowDownLeft. --color-text-secondary. Operation type identifier." />
            </div>
          </Subsection>

          <Subsection title="Trailing elements">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              <TokenRow token="amount" value="Always visible" extra="Stacked above action/link. tabular-nums. Hidden shielded amounts display as ● ● ●." />
              <TokenRow token="Complete →" value="action-required only" extra="Only on proof_ready + unshield. Triggers onComplete callback." />
              <TokenRow token="Etherscan link" value="completed + txHash" extra="ExternalLink 13px icon. Opens tx in new tab. Never shown on in-progress rows." />
            </div>
          </Subsection>

          <Subsection title="Layout specs">
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              <TokenRow token="row padding" value="16px 0" extra="16px vertical, 0 horizontal (container provides 20px horizontal)." />
              <TokenRow token="icon-cell" value="64×64px, circle" extra="No background, no border. Icon centered inside." />
              <TokenRow token="primary text" value="--text-heading (20px)" extra="Weight 600. Spacious, readable at a glance." />
              <TokenRow token="gap (leading → content)" value="16px" extra="Between icon and content area." />
              <TokenRow token="section header" value="40px" extra="padding 12px 20px. Separates groups." />
            </div>
          </Subsection>

          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Always render in-progress rows above completed rows — this ordering is non-negotiable regardless of timestamp.',
                'Use section headers ("In progress", "Completed") to divide groups — group context is load-bearing information.',
                'Show the "Complete →" CTA only on `proof_ready` unshield rows — this is the only user-required action in the entire operation lifecycle.',
                'Use "Sent" / "Received" as the send row label — not "Sent shielded". The token symbol (cETH, cUSDC) already communicates shielded vs public.',
                'Default `hidden=true` for shielded send amounts — privacy is the safe default.',
                'Always include the list terminator ("No more transactions") so users know the list is complete, not truncated.',
              ]}
              donts={[
                "Don't render completed rows before in-progress ones, even if more recently dated.",
                "Don't show the Complete CTA on any status other than `proof_ready` unshield — no other phase requires user action.",
                "Don't make rows tappable to expand — no token or transaction detail pages exist yet.",
                "Don't add more than one trailing action per row.",
              ]}
            />
          </Subsection>
        </Section>

        {/* ── Planned components ── */}

        <Section id="status-persistence-banner" title="StatusPersistenceBanner" description="Persistent strip at the top of the left column for all non-idle operation states. Never auto-dismisses. Completed, failed, and cancelled states are manually dismissable — the user always sees the outcome when they return.">
          <Subsection title="Phase variants">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {([
                { phase: 'processing' as const, label: 'Processing' },
                { phase: 'proof_ready' as const, label: 'Action required' },
                { phase: 'completed' as const, label: 'Completed' },
                { phase: 'failed_submission' as const, label: 'Failed' },
                { phase: 'cancelled' as const, label: 'Cancelled' },
              ]).map(({ phase, label }) => (
                <Button key={phase} size="sm" variant={bannerPhase === phase ? 'primary' : 'secondary'}
                  onClick={() => setBannerPhase(phase)}>
                  {label}
                </Button>
              ))}
            </div>
            <StatusPersistenceBanner
              phase={bannerPhase}
              operation="shield"
              amount="0.50"
              startedAt={Date.now() - 240000}
              onView={() => {}}
              onDismiss={(['completed', 'failed_submission', 'cancelled'] as OperationPhase[]).includes(bannerPhase) ? () => setBannerPhase('idle' as OperationPhase) : undefined}
            />
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'icon', desc: 'Variant-colored icon. Pulses (pulse-badge) on action-required. Clock for processing, Zap for action-required, CheckCircle for completed, AlertCircle for failed.' },
              { name: 'title', desc: 'Operation + outcome. Copy follows fund-safety rules: "safe" before Step 1 confirms, "secured" in unshield intermediate state.' },
              { name: 'subtitle', desc: 'Relative timestamp ("Started 4 minutes ago"). Updates every 30s.' },
              { name: 'cta', desc: '"View →" for most states. "Complete →" for action-required. Both open the right panel at the active operation.' },
              { name: 'dismiss', desc: 'X button on completed, failed, and cancelled states. Hidden for processing and action-required (user must act, not dismiss).' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Mount in the AppShell layout — always rendered globally, never inside a page component.',
                'Show for all active phases including `completed` — the banner is the user\'s persistent view into operation state while they browse the app.',
                'Treat the banner as the re-entry point to the Drawer: every variant shows a "View →" CTA that reopens the Drawer at the current phase. It is a shortcut, not a notification.',
                'Show a green `completed` banner when the operation finishes — it persists until the user explicitly dismisses it so they see the result even after navigating away.',
                'Make completed, failed, and cancelled states manually dismissable with the X button.',
                'Keep visible and non-dismissable for processing and `action-required` states — the user must either wait or act.',
              ]}
              donts={[
                "Don't use `role=\"alert\"` — the banner is a persistent status indicator, not an urgent interruption.",
                "Don't use processing colors for `completed` — green only after the private balance has updated.",
                "Don't use for lightweight feedback unrelated to an active operation — use Notification instead.",
                "Don't auto-dismiss for `action-required` or `failed` — the user must acknowledge or act.",
              ]}
            />
          </Subsection>
        </Section>

        <Section id="navigation-warning" title="NavigationWarning" description="Inline dialog shown when the user attempts to navigate away during an active Unshield. Two urgency levels — soft (processing) and urgent (proof_ready). Never a browser confirm() dialog.">
          <Subsection title="Urgency variants">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', fontWeight: 500 }}>Soft — still processing</div>
                <NavigationWarning urgency="soft" onStay={() => {}} onLeave={() => {}} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', fontWeight: 500 }}>Urgent — proof ready</div>
                <NavigationWarning urgency="urgent" onStay={() => {}} onLeave={() => {}} />
              </div>
            </div>
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'icon', desc: 'Zap icon only on urgent variant. aria-hidden — urgency conveyed via title color and copy.' },
              { name: 'title', desc: 'Urgent: colored amber (--color-warning). Soft: text-primary. Max one line.' },
              { name: 'body', desc: 'Explains consequence of leaving. Must answer: what happens to my funds if I leave? Always use "secured" for unshield intermediate state.' },
              { name: 'primary-cta', desc: '"Complete now" (urgent, primary) or "Stay" (soft, secondary). Closes the dialog, keeps user on page.' },
              { name: 'secondary-cta', desc: '"Leave anyway" (ghost). Allows navigation even with risk acknowledged. Always present.' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Show only during `proof_ready` unshield — this is the only phase where funds are in an intermediate contract and leaving has a meaningful consequence.',
                'Intercept navigation with this dialog instead of browser `confirm()` — it allows custom copy and accessible focus management.',
                'Always make "Leave anyway" available — never trap the user; inform, do not block.',
                'Auto-focus the "Stay" CTA on open so keyboard users land on the safer default.',
              ]}
              donts={[
                "Don't show during `processing` or `finalizing` shield phases — users can safely navigate away; the operation continues server-side.",
                "Don't show for Send operations.",
                "Don't delay rendering — show the dialog immediately on navigation intercept, not after a timeout.",
                "Don't use `role=\"alertdialog\"` with `aria-required` — users have the right to leave.",
              ]}
            />
          </Subsection>
        </Section>

        <Section id="connect-wallet-card" title="ConnectWalletCard" description="Entry screen for /connect. 6-state machine: landing → wallet-selector → connecting → eip712-setup → eip712-active → dashboard. EIP-712 setup explains the free signature before the wallet popup opens — preventing confusion with a paid transaction.">
          <Subsection title="State machine — live demo">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {([
                { state: 'landing' as const, label: 'Landing' },
                { state: 'wallet-selector' as const, label: 'Wallet selector' },
                { state: 'connecting' as const, label: 'Connecting' },
                { state: 'eip712-setup' as const, label: 'EIP-712 setup' },
                { state: 'eip712-active' as const, label: 'EIP-712 active' },
                { state: 'error' as const, label: 'Error' },
              ]).map(({ state, label }) => (
                <Button key={state} size="sm" variant={connectState === state ? 'primary' : 'secondary'}
                  onClick={() => setConnectState(state)}>
                  {label}
                </Button>
              ))}
            </div>
            <ConnectWalletCard
              state={connectState}
              selectedWallet={connectWallet}
              error={connectState === 'error' ? 'rejected' : undefined}
              onConnect={(w) => { setConnectWallet(w); setConnectState('connecting') }}
              onBack={() => setConnectState('landing')}
              onCancel={() => setConnectState('landing')}
              onEnableShielded={() => setConnectState('eip712-active')}
              onSkipShielded={() => {}}
              onDashboard={() => {}}
              onRetry={() => setConnectState('wallet-selector')}
            />
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'landing', desc: 'Shield icon + headline + single CTA. No wallet options shown upfront — reduces decision paralysis.' },
              { name: 'wallet-selector', desc: 'Inline expansion, no modal. Three wallet options with icon + name. Back link.' },
              { name: 'connecting', desc: 'Spinner + "Check your browser extension" copy. "Open manually" escape hatch. Cancel button.' },
              { name: 'eip712-setup', desc: '"✓ Wallet connected" confirmation first, then the EIP-712 ask. Explains free + once. Skip option defers to Shielded section.' },
              { name: 'eip712-active', desc: 'Purple spinner (shielded color) + "Check your wallet for a signature request." Same escape hatch pattern as connecting.' },
              { name: 'error', desc: 'Error icon + specific title + recovery copy per error type. Back available. CTA varies: retry, switch network, dashboard.' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Render as the entire `/connect` page — full screen, no AppShell, no Drawer. This is the only full-page takeover in the app.',
                'Show EIP-712 setup as a subsequent state within the card after wallet connects — never as a surprise second popup.',
                'Confirm the wallet connection visually before asking for the EIP-712 signature.',
                'Explain that EIP-712 is one-time and free before the wallet popup opens.',
              ]}
              donts={[
                "Don't open wallet selection in a modal — expand inline within the card.",
                "Don't auto-trigger the EIP-712 popup — show the setup state inside the card first.",
                "Don't remove 'Skip for now' — forcing EIP-712 on first connect creates friction that breaks the onboarding funnel.",
                "Don't use generic error copy — each error type (rejected, timeout, already-connected) needs its own recovery instruction.",
              ]}
            />
          </Subsection>
        </Section>

        <Section id="right-panel" title="Right Panel (Drawer)" description="Persistent 380px transaction drawer, always mounted. Never unmounts on route change. Tab bar hidden during any active operation phase. Every phase answers three questions: what is happening, what the user should do, and what happens if they leave.">
          <Subsection title="State machine — live demo">
            {/* Controls: Operation (parent) → Phase (child), aligned labels, no extra toggle button */}
            <div style={{ marginBottom: '16px', padding: '16px 20px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Operation row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', minWidth: '76px' }}>Operation</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['shield', 'send', 'unshield'] as const).map(op => (
                    <Button key={op} size="sm" variant={panelOp === op ? 'primary' : 'secondary'}
                      onClick={() => { setPanelOp(op); setPanelPhase('idle') }}>
                      {op.charAt(0).toUpperCase() + op.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--color-border)' }} />

              {/* Phase row: happy path with arrows + exit states branching below */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', minWidth: '76px', paddingTop: '5px' }}>Phase</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  {/* Happy path flow */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '3px' }}>
                    {([
                      { phase: 'idle', label: 'Idle' },
                      { phase: 'awaiting_wallet_step1', label: 'Sign · 1' },
                      { phase: 'awaiting_wallet_step2', label: 'Sign · 2' },
                      { phase: 'processing', label: 'Processing' },
                      { phase: 'finalizing', label: 'Finalizing' },
                      ...(panelOp === 'unshield' ? [{ phase: 'proof_ready', label: 'Proof ready' }] : []),
                      { phase: 'completed', label: 'Completed' },
                    ] as { phase: OperationPhase; label: string }[]).map(({ phase, label }, i, arr) => (
                      <span key={phase} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <button
                          onClick={() => { setPanelPhase(phase); setPanelOpen(true) }}
                          style={{
                            padding: '4px 10px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                            border: panelOpen && panelPhase === phase ? '1.5px solid var(--color-blue)' : '1px solid var(--color-border)',
                            background: panelOpen && panelPhase === phase ? 'rgba(55,72,255,0.08)' : 'transparent',
                            color: panelOpen && panelPhase === phase ? 'var(--color-blue)' : 'var(--color-text-secondary)',
                            fontSize: '12px', fontWeight: panelOpen && panelPhase === phase ? 600 : 400, whiteSpace: 'nowrap',
                            fontFamily: 'inherit',
                          }}
                        >{label}</button>
                        {i < arr.length - 1 && <ArrowRight size={10} color="var(--color-border)" aria-hidden />}
                      </span>
                    ))}
                  </div>

                  {/* Exit states */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-border)', userSelect: 'none', paddingLeft: '2px' }}>↳ exit</span>
                    {([
                      { phase: 'failed_submission', label: 'Failed' },
                      { phase: 'cancelled', label: 'Cancelled' },
                    ] as { phase: OperationPhase; label: string }[]).map(({ phase, label }) => (
                      <button key={phase}
                        onClick={() => { setPanelPhase(phase); setPanelOpen(true) }}
                        style={{
                          padding: '4px 10px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                          border: panelOpen && panelPhase === phase ? '1.5px solid var(--color-error)' : '1px solid var(--color-border)',
                          background: panelOpen && panelPhase === phase ? 'rgba(185,28,28,0.06)' : 'transparent',
                          color: panelOpen && panelPhase === phase ? 'var(--color-error)' : 'var(--color-text-secondary)',
                          fontSize: '12px', fontWeight: panelOpen && panelPhase === phase ? 600 : 400, whiteSpace: 'nowrap',
                          fontFamily: 'inherit',
                        }}
                      >{label}</button>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            {/* Demo frame — drawer always open; phase selection reflects immediately */}
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '520px' }}>
              <div style={{ flex: 1, background: 'var(--color-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Left column</span>
              </div>
              <div style={{ width: '380px', height: '100%', overflowY: 'auto', flexShrink: 0 }}>
                <RightPanel
                  isOpen={panelOpen}
                  onClose={() => setPanelOpen(false)}
                  activeAction="shield"
                  phase={panelPhase}
                  operationType={panelOp}
                  amount="0.50"
                  recipient="0x3c4d8e9f1a2b"
                  publicBalance="1.24"
                  shieldedBalance="0.50"
                  startedAt={Date.now() - 120000}
                  txHash="0xabc123def456"
                  onStartShield={() => setPanelPhase('awaiting_wallet_step1')}
                  onStartSend={() => setPanelPhase('awaiting_wallet_step1')}
                  onStartUnshield={() => setPanelPhase('awaiting_wallet_step1')}
                  onCancel={() => setPanelPhase('cancelled')}
                  onComplete={() => setPanelPhase('awaiting_wallet_step2')}
                  onDone={() => setPanelPhase('idle')}
                  onOverlayIntensity={() => {}}
                />
              </div>
            </div>
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'tab-bar', desc: '3 tabs: Shield · Send · Unshield. Hidden entirely during active operation phases.' },
              { name: 'form', desc: 'Idle state: amount input, quick-select (25%/50%/75%/Max), fee table, "After" preview. Form state cleared on Done.' },
              { name: 'phase-header', desc: 'Operation title + amount + PhaseIndicator. Present in all active states.' },
              { name: 'info-box', desc: 'Gray card showing wallet action details (what is being signed, network fee). Only in wallet-confirm states.' },
              { name: 'fund-safety-copy', desc: '"Your funds are safe" (before Step 1) or "secured" (after Step 1 in unshield). Never omit.' },
              { name: 'ctabank', desc: 'Primary CTA + secondary. Never more than 2 actions. In completed state: operation-specific action + "Done".' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Use the Drawer when the user needs to focus on an operation but should still be able to see the app underneath — the semi-transparent LeftColumnOverlay dims the left column enough to signal focus without hiding it.',
                'Always keep mounted — never unmount on route change. The Drawer is the persistent operation surface, not a page-level component.',
                'Replace the form with phase content during an active operation — the two states are mutually exclusive.',
                'Answer all three questions in every phase copy: what is happening, what the user should do (or "nothing — you can leave"), and what happens if they leave.',
                'Hide the tab bar during active operations — prevent starting a second operation mid-flow.',
                'Treat the StatusPersistenceBanner as the re-entry point: it reminds the user an operation is active or needs attention, and tapping it reopens the Drawer at the current phase. It is not a notification — it is a persistent shortcut back to the operation.',
                'Clicking an in-progress or completed ActivityRow entry for shield, unshield, or send should reopen the Drawer showing the final state of that operation (the last phase screen reached).',
                'Pair with LeftColumnOverlay: intensity 50 for `awaiting_wallet_confirmation`, intensity 30 for `processing` and `finalizing`.',
              ]}
              donts={[
                "Don't use the Drawer for content that doesn't require the user's attention on an active operation — use full pages or cards instead.",
                "Don't use the same copy across failure types — `failed_submission`, `failed_dropped`, and `failed_finalization` each have distinct causes and recovery paths.",
                "Don't skip the `preparing` state — even at 1–2s, the indicator confirms the system received the action.",
                "Don't show the shield/send form while a phase is active — the operation owns the Drawer.",
              ]}
            />
          </Subsection>
        </Section>

        <Section id="left-column-overlay" title="LeftColumnOverlay" description="A div covering the left column with variable opacity during active operations. At intensity > 0, pointer-events are blocked — the left column becomes non-interactive. Transition uses --duration-slower to feel intentional.">
          <Subsection title="Intensity levels">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {([
                { v: 0 as const, label: 'Idle (0%)' },
                { v: 30 as const, label: 'Processing (30%)' },
                { v: 50 as const, label: 'Awaiting wallet (50%)' },
              ]).map(({ v, label }) => (
                <Button key={v} size="sm" variant={overlayDemo === v ? 'primary' : 'secondary'}
                  onClick={() => setOverlayDemo(v)}>
                  {label}
                </Button>
              ))}
            </div>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', height: '200px', background: 'var(--color-surface-raised)' }}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ height: '44px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px' }}>
                  <div style={{ width: '60px', height: '10px', borderRadius: '4px', background: 'var(--color-border)' }} />
                  <div style={{ width: '90px', height: '10px', borderRadius: '4px', background: 'var(--color-border)' }} />
                </div>
                <div style={{ height: '80px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }} />
                <div style={{ height: '24px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', width: '60%' }} />
              </div>
              <LeftColumnOverlay intensity={overlayDemo} />
              <div style={{ position: 'absolute', bottom: '10px', right: '14px', fontSize: '11px', fontWeight: 700, color: overlayDemo >= 40 ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                intensity: {overlayDemo}
              </div>
            </div>
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'div', desc: 'Single element. position: absolute; inset: 0. Requires position: relative on the left column container.' },
              { name: 'background', desc: 'rgba(20, 20, 26, intensity/100) — Midnight color at variable alpha.' },
              { name: 'pointer-events', desc: '"all" when intensity > 0 — blocks all left column interaction. "none" at intensity 0 — fully transparent and click-through.' },
              { name: 'transition', desc: '--duration-slower (500ms) ease-in-out. The overlay must feel deliberate, not instant.' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Set intensity 50 for `awaiting_wallet_confirmation` — the user must focus entirely on the wallet popup and Drawer.',
                'Set intensity 30 for `processing` and `finalizing` — the left column stays visible but de-emphasized; the user can see it but not interact.',
                'Set intensity 0 at idle — fully transparent and click-through.',
                'Transition using `--duration-slower` (500ms) — the overlay communicates a deliberate mode shift, not an instant state change.',
              ]}
              donts={[
                "Don't use for non-operation states (page loading, empty states, errors) — it signals an active operation is blocking interaction.",
                "Don't set opacity: 0 — dimmed content remaining visible is intentional; the user should see the left column is there but locked.",
                "Don't hardcode rgba values — derive intensity from `--color-midnight` to stay consistent with the token system.",
              ]}
            />
          </Subsection>
        </Section>

        <SectionDivider label="Data" />

        <Section
          id="table"
          title="Table"
          description="Generic table primitives for structured data layouts. Compose Table, TableHeader, TableBody, TableFooter, TableRow, and TableCell to build any tabular view."
        >
          <Subsection title="Example — generic ruled table">
            <Table bordered accessibilityLabel="Example table">
              <TableHeader>
                <TableRow>
                  <TableCell asHeader title="Name" width="40%" />
                  <TableCell asHeader title="Value" width="35%" />
                  <TableCell asHeader title="Status" width="25%" direction="row" justifyContent="flex-end" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: '--color-blue', value: '#3748FF', status: 'Active' },
                  { name: '--color-shielded', value: '#6D28D9', status: 'Active' },
                  { name: '--color-lime', value: '#CEFF1C', status: 'Active' },
                ].map(row => (
                  <TableRow key={row.name}>
                    <TableCell title={row.name} />
                    <TableCell title={row.value} />
                    <TableCell direction="row" justifyContent="flex-end">
                      <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 500 }}>
                        {row.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'Table', desc: 'Root wrapper. Handles overflow scroll on narrow viewports. bordered prop adds a 1px border and border-radius.' },
              { name: 'TableHeader', desc: 'Maps to <thead>. Contains exactly one TableRow with TableCell asHeader cells.' },
              { name: 'TableBody', desc: 'Maps to <tbody>. Contains one TableRow per data record.' },
              { name: 'TableFooter', desc: 'Maps to <tfoot>. Optional — use for pagination or summary rows.' },
              { name: 'TableRow', desc: 'Maps to <tr>. hoverable prop enables mouse-over highlight.' },
              { name: 'TableCell', desc: 'Maps to <td> or <th> (asHeader). Accepts title/subtitle/start shorthand for common layouts, or children with direction/justifyContent for custom content.' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Use as the primitive for any structured data list — TokenTable is built on top of it.',
                'Use `title + subtitle + start` shorthand for asset rows (symbol + name + icon) — it handles layout automatically.',
                'Use `direction="row" justifyContent="flex-end"` for right-aligned balance or value cells.',
                'Always set `accessibilityLabel` on the Table root for screen reader region labelling.',
              ]}
              donts={[
                "Don't mix `asHeader` cells into TableBody rows — header styling belongs only inside TableHeader.",
                "Don't hardcode padding or border-bottom inside TableCell children — the cell provides them.",
                "Don't skip TableHeader — always include column labels even when they seem obvious.",
                "Don't use Table for single-item displays — use Card or a plain layout instead.",
              ]}
            />
          </Subsection>
        </Section>

        <Section
          id="token-table"
          title="TokenTable"
          description="Assembled token balance table for wallet views. Shows asset avatar, symbol and full name, privacy state badge, and balance with USD equivalent. A single hidden prop masks all balances simultaneously."
        >
          <Subsection title="Interactive demo">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '12px', gap: '10px' }}>
              <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Hide balances
              </span>
              <Switch
                checked={tokenTableHidden}
                onChange={setTokenTableHidden}
                id="token-table-hidden"
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                (demo only — in the app, hidden is driven by the page-level eye toggle)
              </span>
            </div>
            <TokenTable hidden={tokenTableHidden} />
          </Subsection>
          <Subsection title="Anatomy">
            <Anatomy parts={[
              { name: 'TokenAvatar', desc: 'Circular colored badge showing the token abbreviation. Shielded variant: scaled inner circle + --color-shielded border ring + ShieldCheck badge at bottom-right.' },
              { name: 'PrivacyBadge', desc: 'Pill showing Shielded (purple tint, ShieldCheck icon) or Unshielded (outlined, ShieldOff icon).' },
              { name: 'balance cell', desc: 'Right-aligned column. Primary line: token amount + unit. Secondary line: USD equivalent. Both lines are replaced with ●●● when hidden=true.' },
              { name: 'hidden prop', desc: 'Boolean controlled by the parent. Masks all balance rows simultaneously — partial masking is not supported by design.' },
            ]} />
          </Subsection>
          <Subsection title="Do and Don't">
            <DoAndDont
              dos={[
                'Drive `hidden` from the same page-level toggle that controls BalanceCard — the visibility state is shared across the entire Overview.',
                'Treat cETH, cUSDC, cDAI as separate token entries from their unshielded counterparts — they have distinct balances and identities.',
                'Use `--color-shielded` for all shielded treatments: avatar ring, badge background, PrivacyBadge tint — never substitute another color.',
                'Mask both token amount and USD value when hidden — revealing either one exposes balance information.',
              ]}
              donts={[
                "Don't add per-row privacy toggles — the table masks and reveals as a whole.",
                "Don't make rows tappable — no token detail pages are defined; clickable rows with no destination break user trust.",
                "Don't use any color other than `--color-shielded` for the shielded avatar ring.",
              ]}
            />
          </Subsection>
        </Section>

    </div>
  )
}
