import { useState } from 'react'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { StatusBadge } from '../components/StatusBadge'
import { PhaseIndicatorVertical } from '../components/PhaseIndicatorVertical'
import { BalanceCard } from '../components/BalanceCard'
import { ActivityRow } from '../components/ActivityRow'
import { InfoBar } from '../components/InfoBar'
import { NavigationWarning } from '../components/NavigationWarning'
import { ConnectWalletCard } from '../components/ConnectWalletCard'
import type { ConnectState } from '../components/ConnectWalletCard'
import { RightPanel } from '../components/RightPanel'
import { LeftColumnOverlay } from '../components/LeftColumnOverlay'
import '../styles/tokens-v2.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionChoice {
  pick: 'v1' | 'v2' | null
  comment: string
}
type CompareState = Record<string, SectionChoice>

// ─── V2 Token Constants ───────────────────────────────────────────────────────

const V2T = {
  bg: '#F5F6FC',
  fg: '#14141A',
  card: '#FFFFFF',
  cardFg: '#14141A',
  primary: '#3748FF',
  primaryFg: '#FFFFFF',
  secondary: '#ECEDF5',
  secondaryFg: '#14141A',
  muted: '#F5F6FC',
  mutedFg: '#6B6C80',
  accent: '#CEFF1C',
  accentFg: '#14141A',
  destructive: '#dc2626',
  destructiveFg: '#fafafa',
  border: '#E2E3EE',
  input: '#E2E3EE',
  ring: '#3748FF',
  radius: '0.75rem',
  font: "'Inter', sans-serif",
} as const

const V2DARK = {
  bg: '#14141A', fg: '#F5F6FC', card: '#1A1A22', cardFg: '#F5F6FC',
  primary: '#3748FF', primaryFg: '#FFFFFF',
  secondary: '#2A2A35', secondaryFg: '#F5F6FC',
  muted: '#2A2A35', mutedFg: '#6B6C80',
  accent: '#CEFF1C', accentFg: '#14141A',
  destructive: '#b91c1c', destructiveFg: '#fafafa',
  border: '#404040', input: '#404040',
} as const

// ─── Section List ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'color',          label: 'Color',                    group: 'Foundation' },
  { id: 'typography',     label: 'Typography',               group: 'Foundation' },
  { id: 'spacing',        label: 'Spacing',                  group: 'Foundation' },
  { id: 'radius',         label: 'Border Radius',            group: 'Foundation' },
  { id: 'elevation',      label: 'Elevation',                group: 'Foundation' },
  { id: 'motion',         label: 'Motion',                   group: 'Foundation' },
  { id: 'layout',         label: 'Layout',                   group: 'Foundation' },
  { id: 'dark-mode',      label: 'Dark Mode',                group: 'Foundation' },
  { id: 'gradients',      label: 'Gradients',                group: 'Foundation' },
  { id: 'icons',          label: 'Icons',                    group: 'Foundation' },
  { id: 'accessibility',  label: 'Accessibility',            group: 'Foundation' },
  { id: 'button',         label: 'Button',                   group: 'Components' },
  { id: 'input',          label: 'TextField / Input',        group: 'Components' },
  { id: 'notification',   label: 'Notification',             group: 'Components' },
  { id: 'badge',          label: 'Badge / StatusBadge',      group: 'Components' },
  { id: 'phase-indicator',label: 'PhaseIndicatorVertical',   group: 'Components' },
  { id: 'balance-card',   label: 'BalanceCard',              group: 'Components' },
  { id: 'activity-row',   label: 'ActivityRow',              group: 'Components' },
  { id: 'status-banner',  label: 'InfoBar',  group: 'Components' },
  { id: 'nav-warning',    label: 'NavigationWarning',        group: 'Components' },
  { id: 'connect-wallet', label: 'ConnectWalletCard',        group: 'Components' },
  { id: 'right-panel',    label: 'RightPanel',               group: 'Components' },
  { id: 'left-overlay',   label: 'LeftColumnOverlay',        group: 'Components' },
  { id: 'card',           label: 'Card',                     group: 'Components' },
  { id: 'switch',         label: 'Switch / Toggle',          group: 'Components' },
  { id: 'progress',       label: 'Progress Bar',             group: 'Components' },
]

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function GapPlaceholder({ note }: { note?: string }) {
  return (
    <div style={{
      minHeight: '160px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '10px',
      border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)',
      padding: '24px', background: 'transparent',
    }}>
      <span style={{ fontSize: '28px', opacity: 0.2, lineHeight: 1 }}>-</span>
      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
        {note ?? 'Not defined in this version'}
      </span>
    </div>
  )
}

function ColLabel({ v, sub }: { v: 'V1' | 'V2'; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
      <span style={{
        fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em',
        background: v === 'V1' ? '#14141A' : '#3748FF', color: '#fff',
        padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase',
      }}>{v}</span>
      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{sub}</span>
    </div>
  )
}

// ─── V2 Base Renderers ────────────────────────────────────────────────────────

function V2Btn({ variant, label, fullWidth }: { variant: string; label: string; fullWidth?: boolean }) {
  const variantStyles: Record<string, React.CSSProperties> = {
    default:     { background: V2T.primary, color: V2T.primaryFg, border: 'none' },
    secondary:   { background: V2T.secondary, color: V2T.secondaryFg, border: 'none' },
    outline:     { background: 'transparent', color: V2T.fg, border: `1px solid ${V2T.border}` },
    ghost:       { background: 'transparent', color: V2T.fg, border: 'none' },
    destructive: { background: V2T.destructive, color: V2T.destructiveFg, border: 'none' },
    link:        { background: 'transparent', color: V2T.primary, border: 'none', textDecoration: 'underline' },
  }
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: '32px', padding: '0 12px', borderRadius: '0.5rem',
      fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
      fontFamily: V2T.font, width: fullWidth ? '100%' : 'auto',
      ...variantStyles[variant],
    }}>
      {label}
    </button>
  )
}

function V2InputEl({ placeholder, type = 'text' }: { placeholder: string; type?: string }) {
  return (
    <input type={type} placeholder={placeholder} style={{
      width: '100%', height: '36px', padding: '0 12px',
      border: `1px solid ${V2T.border}`, borderRadius: '0.375rem',
      background: 'transparent', fontSize: '0.875rem',
      fontFamily: V2T.font, color: V2T.fg, outline: 'none',
    }} />
  )
}

function V2Badge({ variant, label }: { variant: string; label: string }) {
  const vs: Record<string, React.CSSProperties> = {
    default:     { background: V2T.primary, color: V2T.primaryFg, border: 'none' },
    secondary:   { background: V2T.secondary, color: V2T.secondaryFg, border: 'none' },
    destructive: { background: V2T.destructive, color: V2T.destructiveFg, border: 'none' },
    outline:     { background: 'transparent', color: V2T.fg, border: `1px solid ${V2T.border}` },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, fontFamily: V2T.font,
      ...vs[variant],
    }}>{label}</span>
  )
}

function V2Switch({ checked = true, label }: { checked?: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '32px', height: '18px', flexShrink: 0,
        background: checked ? V2T.primary : V2T.input, borderRadius: '9999px', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '1px',
          left: checked ? 'calc(100% - 17px)' : '1px',
          width: '16px', height: '16px',
          background: '#fff', borderRadius: '9999px',
        }} />
      </div>
      <span style={{ fontSize: '0.875rem', color: V2T.fg, fontFamily: V2T.font }}>{label}</span>
    </div>
  )
}

function V2ProgressBar({ label, value, meta }: { label: string; value: number; meta: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontFamily: V2T.font }}>
        <span style={{ color: V2T.mutedFg }}>{label}</span>
        <span style={{ fontWeight: 600, color: V2T.fg }}>{meta}</span>
      </div>
      <div style={{ height: '8px', borderRadius: '9999px', background: V2T.secondary }}>
        <div style={{ height: '100%', width: `${value}%`, borderRadius: '9999px', background: V2T.primary }} />
      </div>
    </div>
  )
}

// ─── V1 Section Content ───────────────────────────────────────────────────────

const V1_COLOR_GROUPS = [
  {
    label: 'Brand palette',
    tokens: [
      { name: '--color-blue', value: '#3748FF', desc: 'Primary brand', light: false },
      { name: '--color-midnight', value: '#14141A', desc: 'Dark anchor', light: false },
      { name: '--color-lime', value: '#CEFF1C', desc: 'Accent highlight', light: true },
      { name: '--color-ice-white', value: '#F5F6FC', desc: 'Base surface', light: true },
    ],
  },
  {
    label: 'Surfaces',
    tokens: [
      { name: '--color-surface', value: '#F5F6FC', desc: 'Page bg', light: true },
      { name: '--color-surface-raised', value: '#FFFFFF', desc: 'Cards', light: true },
      { name: '--color-surface-subtle', value: '#ECEDF5', desc: 'Hover', light: true },
      { name: '--color-border', value: '#E2E3EE', desc: 'Dividers', light: true },
    ],
  },
  {
    label: 'Text',
    tokens: [
      { name: '--color-text-primary', value: '#14141A', desc: 'Primary', light: false },
      { name: '--color-text-secondary', value: '#6B6C80', desc: 'Supporting', light: false },
    ],
  },
  {
    label: 'Semantic',
    tokens: [
      { name: '--color-public', value: '#3748FF', desc: 'Public balance', light: false },
      { name: '--color-shielded', value: '#6D28D9', desc: 'Shielded balance', light: false },
      { name: '--color-accent', value: '#CEFF1C', desc: 'Highlights', light: true },
    ],
  },
  {
    label: 'Status',
    tokens: [
      { name: '--color-success', value: '#5BB81E', desc: 'Completed', light: false },
      { name: '--color-warning', value: '#F5CF00', desc: 'Warning', light: true },
      { name: '--color-error', value: '#B91C1C', desc: 'Failure', light: false },
      { name: '--color-processing', value: '#3748FF', desc: 'In-progress', light: false },
    ],
  },
]

function V1ColorContent() {
  return (
    <div>
      <ColLabel v="V1" sub="Named brand tokens · explicit role per token" />
      {V1_COLOR_GROUPS.map(g => (
        <div key={g.label} style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{g.label}</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {g.tokens.map(t => (
              <div key={t.name} style={{ minWidth: '96px' }}>
                <div style={{ height: '44px', borderRadius: '8px', background: t.value, border: t.light ? '1px solid var(--color-border)' : 'none', marginBottom: '6px' }} />
                <div style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{t.name}</div>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{t.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function V2ColorContent() {
  const light = [
    { name: '--background', value: V2T.bg, label: 'Background', isLight: true },
    { name: '--foreground', value: V2T.fg, label: 'Foreground', isLight: false },
    { name: '--card', value: V2T.card, label: 'Card', isLight: true },
    { name: '--primary', value: V2T.primary, label: 'Primary', isLight: false },
    { name: '--secondary', value: V2T.secondary, label: 'Secondary', isLight: true },
    { name: '--muted', value: V2T.muted, label: 'Muted', isLight: true },
    { name: '--accent', value: V2T.accent, label: 'Accent', isLight: true },
    { name: '--destructive', value: V2T.destructive, label: 'Destructive', isLight: false },
    { name: '--border', value: V2T.border, label: 'Border', isLight: true },
  ]
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Shadcn semantic roles · each = bg + foreground pair" />
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Light mode</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {light.map(t => (
            <div key={t.name} style={{ minWidth: '80px' }}>
              <div style={{ height: '44px', borderRadius: '8px', background: t.value, border: t.isLight ? `1px solid ${V2T.border}` : 'none', marginBottom: '6px' }} />
              <div style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{t.name}</div>
              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{t.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Dark mode swatches</div>
        <div style={{ background: V2DARK.bg, borderRadius: '8px', padding: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { l: 'bg', v: V2DARK.bg }, { l: 'card', v: V2DARK.card },
            { l: 'primary', v: V2DARK.primary }, { l: 'secondary', v: V2DARK.secondary },
            { l: 'border', v: V2DARK.border }, { l: 'accent', v: V2DARK.accent },
          ].map(t => (
            <div key={t.l} style={{ textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: t.v, border: `1px solid ${V2DARK.border}`, margin: '0 auto 4px' }} />
              <div style={{ fontSize: '10px', color: V2DARK.mutedFg, fontFamily: 'monospace' }}>{t.l}</div>
              <div style={{ fontSize: '9px', color: V2DARK.mutedFg, fontFamily: 'monospace' }}>{t.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function V1TypographyContent() {
  const scale = [
    { label: 'Display', size: '32px', weight: 700, token: '--text-display', usage: 'Page headings, hero numbers', mono: false },
    { label: 'Heading', size: '20px', weight: 600, token: '--text-heading', usage: 'Card headings', mono: false },
    { label: 'Body', size: '16px', weight: 400, token: '--text-body', usage: 'Primary copy', mono: false },
    { label: 'Small', size: '14px', weight: 500, token: '--text-small', usage: 'Labels, captions', mono: false },
    { label: '0x1a2b…3f9d', size: '13px', weight: 400, token: '--text-mono', usage: 'Addresses, hashes', mono: true },
  ]
  return (
    <div>
      <ColLabel v="V1" sub="Manrope · px scale · 5 sizes · 5 weights" />
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        {scale.map(t => (
          <div key={t.token} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'baseline' }}>
            <span style={{ fontSize: t.size, fontWeight: t.weight, color: 'var(--color-text-primary)', fontFamily: t.mono ? 'monospace' : 'Manrope, sans-serif', lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{t.label}</span>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-public)' }}>{t.token}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>{t.size} · wt {t.weight} - {t.usage}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Weights</div>
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
          {[400, 500, 600, 700, 800].map(w => (
            <div key={w} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: w, color: 'var(--color-text-primary)', fontFamily: 'Manrope, sans-serif', lineHeight: 1 }}>Aa</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{w}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function V2TypographyContent() {
  const scale = [
    { level: 'h1', size: '3rem',   weight: 700, classes: 'text-5xl font-bold leading-tight tracking-tight', sample: 'ShieldPay' },
    { level: 'h2', size: '2.25rem', weight: 700, classes: 'text-4xl font-bold leading-tight', sample: 'ShieldPay' },
    { level: 'h3', size: '1.875rem',weight: 600, classes: 'text-3xl font-semibold leading-snug', sample: 'Shield your balance' },
    { level: 'h4', size: '1.5rem',  weight: 600, classes: 'text-2xl font-semibold leading-snug', sample: 'Shield your balance' },
    { level: 'h5', size: '1.25rem', weight: 500, classes: 'text-xl font-medium', sample: 'Shield your balance' },
    { level: 'h6', size: '1.125rem',weight: 500, classes: 'text-lg font-medium', sample: 'Shield your balance' },
    { level: 'body', size: '1rem',  weight: 400, classes: 'text-base font-normal leading-relaxed', sample: 'Transaction confirmed on network' },
    { level: 'bodySmall', size: '0.875rem', weight: 400, classes: 'text-sm font-normal', sample: 'Transaction confirmed on network' },
    { level: 'caption', size: '0.75rem', weight: 400, classes: 'text-xs font-normal', sample: 'Processing - about 1 minute' },
    { level: 'label', size: '0.875rem', weight: 500, classes: 'text-sm font-medium', sample: 'Private Balance' },
    { level: 'button', size: '0.875rem', weight: 500, classes: 'text-sm font-medium', sample: 'Shield Now' },
  ]
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Inter · Tailwind scale · 11 levels" />
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        {scale.map(t => (
          <div key={t.level} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'baseline' }}>
            <span style={{ fontSize: t.size, fontWeight: t.weight, color: 'var(--color-text-primary)', fontFamily: V2T.font, lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{t.sample}</span>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-public)' }}>{t.level}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>{t.classes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function V1SpacingContent() {
  const scale = [1,2,3,4,5,6,7,8,9,10,11,12]
  return (
    <div>
      <ColLabel v="V1" sub="4px base grid · --space-1 through --space-12" />
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
        {scale.map(n => (
          <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '48px', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '24px', height: `${Math.max(n * 4, 4)}px`, background: 'var(--color-blue)', borderRadius: '3px', opacity: 0.25 + (n / 12) * 0.75 }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{n}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{n * 4}px</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>Rule:</strong> All padding, margin, and gap must use a spacing token. Never hardcode a value.
      </div>
    </div>
  )
}

function V1RadiusContent() {
  const scale = [
    { token: '--radius-sm',  value: '4px',    label: 'sm · 4px',   usage: 'Chips, tags' },
    { token: '--radius-md',  value: '8px',    label: 'md · 8px',   usage: 'Buttons, inputs' },
    { token: '--radius-lg',  value: '12px',   label: 'lg · 12px',  usage: 'Cards, panels' },
    { token: '--radius-xl',  value: '16px',   label: 'xl · 16px',  usage: 'Modals' },
    { token: '--radius-2xl', value: '24px',   label: '2xl · 24px', usage: 'Sheets' },
    { token: '--radius-full',value: '9999px', label: 'full',        usage: 'Pills, avatars' },
  ]
  return (
    <div>
      <ColLabel v="V1" sub="6-step scale - sm through full" />
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {scale.map(r => (
          <div key={r.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '72px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(55,72,255,0.08)', border: '1.5px solid rgba(55,72,255,0.2)', borderRadius: r.value }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{r.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{r.usage}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function V2RadiusContent() {
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Single token --radius · 0.75rem (12px)" />
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '20px' }}>
        {[
          { label: '--radius', value: '0.75rem', usage: 'All UI elements' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '80px', height: '80px', background: `rgba(55,72,255,0.08)`, border: '1.5px solid rgba(55,72,255,0.2)', borderRadius: r.value }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{r.label}</div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: V2T.mutedFg }}>{r.value}</div>
              <div style={{ fontSize: '11px', color: V2T.mutedFg }}>{r.usage}</div>
            </div>
          </div>
        ))}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: V2T.mutedFg, lineHeight: 1.6, marginTop: '4px' }}>
            Shadcn UI uses a single <code style={{ fontFamily: 'monospace', color: V2T.primary, fontSize: '12px' }}>--radius</code> variable. All components derive their border-radius from this one value (full = radius * 2, sm = radius * 0.5, etc.).
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'full', r: '9999px', note: '×∞' },
              { label: 'base', r: '0.75rem', note: '12px' },
              { label: 'sm', r: '0.375rem', note: '6px' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '48px', height: '48px', background: `rgba(55,72,255,0.08)`, border: '1.5px solid rgba(55,72,255,0.2)', borderRadius: s.r }} />
                <div style={{ fontSize: '10px', color: V2T.mutedFg, fontFamily: 'monospace' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function V1ElevationContent() {
  const scale = [
    { token: '--shadow-sm', label: 'sm', usage: 'Chips, interactive elements', value: '0 1px 3px rgba(20,20,26,.06), 0 1px 2px rgba(20,20,26,.04)' },
    { token: '--shadow-md', label: 'md', usage: 'Cards, dropdowns', value: '0 4px 8px rgba(20,20,26,.08), 0 2px 4px rgba(20,20,26,.04)' },
    { token: '--shadow-lg', label: 'lg', usage: 'Floating panels', value: '0 8px 24px rgba(20,20,26,.10), 0 4px 8px rgba(20,20,26,.06)' },
    { token: '--shadow-xl', label: 'xl', usage: 'RightPanel, modals', value: '0 16px 48px rgba(20,20,26,.14), 0 8px 16px rgba(20,20,26,.08)' },
  ]
  return (
    <div>
      <ColLabel v="V1" sub="4-level shadow scale using Midnight at low opacity" />
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {scale.map(s => (
          <div key={s.token} style={{ flex: 1, minWidth: '120px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)', padding: '20px 16px', boxShadow: s.value, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>shadow-{s.label}</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{s.usage}</span>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-public)', marginTop: '4px' }}>{s.token}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function V1MotionContent() {
  const durations = [
    { token: '--duration-instant', value: '0ms', usage: 'State switches' },
    { token: '--duration-fast', value: '100ms', usage: 'Hover states, tooltips' },
    { token: '--duration-normal', value: '200ms', usage: 'Most UI transitions' },
    { token: '--duration-slow', value: '300ms', usage: 'Panel slides, modals' },
    { token: '--duration-slower', value: '500ms', usage: 'Overlay fades' },
  ]
  const easings = [
    { token: '--ease-out', label: 'Ease Out', usage: 'Entering elements' },
    { token: '--ease-in', label: 'Ease In', usage: 'Exiting elements' },
    { token: '--ease-in-out', label: 'Ease In-Out', usage: 'State changes' },
    { token: '--ease-spring', label: 'Spring', usage: 'Confirmations, success pops' },
  ]
  return (
    <div>
      <ColLabel v="V1" sub="Duration + easing tokens · 3 motion tiers" />
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Duration</div>
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          {durations.map(d => (
            <div key={d.token} style={{ display: 'grid', gridTemplateColumns: '200px 60px 1fr', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-public)' }}>{d.token}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{d.value}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{d.usage}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Easing</div>
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          {easings.map(e => (
            <div key={e.token} style={{ display: 'grid', gridTemplateColumns: '200px 100px 1fr', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-public)' }}>{e.token}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{e.label}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{e.usage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function V1LayoutContent() {
  const tokens = [
    { token: '--layout-nav-height', value: '61px', usage: 'Top navigation bar' },
    { token: '--layout-sidebar-width', value: '220px', usage: 'Left column width' },
    { token: '--layout-right-panel-width', value: '380px', usage: 'RightPanel width' },
    { token: '--layout-ds-sidebar-width', value: '240px', usage: 'Design system sidebar' },
  ]
  return (
    <div>
      <ColLabel v="V1" sub="Fixed layout dimensions as tokens" />
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        {tokens.map(t => (
          <div key={t.token} style={{ display: 'grid', gridTemplateColumns: '240px 70px 1fr', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-public)' }}>{t.token}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.value}</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.usage}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function V2DarkModeContent() {
  const pairs = [
    { role: 'background', light: '#F5F6FC', dark: '#14141A' },
    { role: 'foreground', light: '#14141A', dark: '#F5F6FC' },
    { role: 'card', light: '#FFFFFF', dark: '#1A1A22' },
    { role: 'primary', light: '#3748FF', dark: '#3748FF' },
    { role: 'secondary', light: '#ECEDF5', dark: '#2A2A35' },
    { role: 'muted', light: '#F5F6FC', dark: '#2A2A35' },
    { role: 'muted-foreground', light: '#6B6C80', dark: '#6B6C80' },
    { role: 'accent', light: '#CEFF1C', dark: '#CEFF1C' },
    { role: 'destructive', light: '#dc2626', dark: '#b91c1c' },
    { role: 'border', light: '#E2E3EE', dark: '#404040' },
  ]
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Full dark mode via .dark class + prefers-color-scheme" />
      <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '12px', padding: '8px 0', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>Token</span><span>Light</span><span>Dark</span>
        </div>
        {pairs.map(p => (
          <div key={p.role} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: V2T.primary }}>--{p.role}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: p.light, border: `1px solid ${V2T.border}`, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: V2T.mutedFg }}>{p.light}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: p.dark, border: '1px solid #333', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: V2T.mutedFg }}>{p.dark}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: V2T.mutedFg, lineHeight: 1.6 }}>
        Toggle via <code style={{ fontFamily: 'monospace', color: V2T.primary, fontSize: '11px' }}>.dark</code> class on &lt;html&gt; or with <code style={{ fontFamily: 'monospace', color: V2T.primary, fontSize: '11px' }}>prefers-color-scheme: dark</code>.
      </div>
    </div>
  )
}

function V2GradientsContent() {
  const gradients = [
    { name: 'Primary Blue', css: 'linear-gradient(135deg, #3748FF 0%, #5C6CFF 100%)', usage: 'Primary buttons, hero sections' },
    { name: 'Security Shield', css: 'linear-gradient(135deg, #3748FF 0%, #14141A 100%)', usage: 'Security-focused elements' },
    { name: 'Lime Accent', css: 'linear-gradient(135deg, #CEFF1C 0%, #A8E600 100%)', usage: 'Success states, highlights' },
  ]
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="3 named brand gradients" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {gradients.map(g => (
          <div key={g.name} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '56px', borderRadius: V2T.radius, background: g.css, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: V2T.fg }}>{g.name}</div>
              <div style={{ fontSize: '11px', color: V2T.mutedFg, marginTop: '2px' }}>{g.usage}</div>
              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: V2T.primary, marginTop: '2px' }}>{g.css}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function V2IconsContent() {
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Phosphor Icons · regular weight" />
      <div style={{ padding: '16px', background: V2T.secondary, borderRadius: V2T.radius, marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: V2T.fg, marginBottom: '4px' }}>Library: phosphor-react</div>
        <div style={{ fontSize: '12px', color: V2T.mutedFg, marginBottom: '8px' }}>Default weight: <code style={{ fontFamily: 'monospace', color: V2T.primary, fontSize: '11px' }}>regular</code></div>
        <code style={{ fontSize: '11px', fontFamily: 'monospace', color: V2T.primary }}>import {'{ Shield, ArrowRight, Check }'} from "@phosphor-icons/react"</code>
      </div>
      <div style={{ fontSize: '12px', color: V2T.mutedFg, lineHeight: 1.6 }}>
        Available icon names relevant to ShieldPay: <strong style={{ color: V2T.fg }}>Shield, Lock, LockOpen, Wallet, ArrowRight, CheckCircle, XCircle, Warning, Clock, Lightning, Eye, EyeSlash, ArrowsLeftRight, CurrencyEth</strong>
      </div>
    </div>
  )
}

function V1IconsContent() {
  return (
    <div>
      <ColLabel v="V1" sub="Lucide React · used in practice" />
      <div style={{ padding: '16px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>Library: lucide-react</div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>No explicit spec in DS - Lucide icons used ad-hoc in components</div>
        <code style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-public)' }}>import {'{ ShieldCheck, ArrowRight, Wallet }'} from "lucide-react"</code>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        Currently used: <strong style={{ color: 'var(--color-text-primary)' }}>ShieldCheck, Send, ArrowDown, ExternalLink, Zap, CheckCircle, AlertCircle, Clock, X, Search, Eye, Wallet</strong>
      </div>
    </div>
  )
}

function V2AccessibilityContent() {
  const pairs = [
    { fg: '#14141A', fgLabel: 'Foreground',    bg: '#F5F6FC', bgLabel: 'Background',  ratio: '17.0:1' },
    { fg: '#FFFFFF', fgLabel: 'Primary FG',    bg: '#3748FF', bgLabel: 'Primary',      ratio: '5.9:1'  },
    { fg: '#14141A', fgLabel: 'Secondary FG',  bg: '#ECEDF5', bgLabel: 'Secondary',    ratio: '15.7:1' },
    { fg: '#14141A', fgLabel: 'Accent FG',     bg: '#CEFF1C', bgLabel: 'Accent',       ratio: '15.7:1' },
    { fg: '#6B6C80', fgLabel: 'Muted FG',      bg: '#F5F6FC', bgLabel: 'Muted',        ratio: '4.8:1'  },
    { fg: '#fafafa', fgLabel: 'Destructive FG',bg: '#dc2626', bgLabel: 'Destructive',  ratio: '4.6:1'  },
    { fg: '#14141A', fgLabel: 'Card FG',       bg: '#FFFFFF', bgLabel: 'Card',          ratio: '18.3:1' },
  ]
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="WCAG 2.1 contrast ratios · all pairs AA compliant" />
      <div style={{ fontSize: '11px', color: V2T.mutedFg, marginBottom: '12px' }}>AA requires 4.5:1 for text, 3:1 for large text</div>
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        {pairs.map(p => (
          <div key={p.fgLabel} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: p.fg, border: `1px solid ${V2T.border}`, flexShrink: 0 }} />
                <span style={{ color: V2T.mutedFg }}>{p.fgLabel}</span>
              </div>
              <span style={{ color: V2T.mutedFg, fontSize: '10px' }}>on</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: p.bg, border: `1px solid ${V2T.border}`, flexShrink: 0 }} />
                <span style={{ color: V2T.mutedFg }}>{p.bgLabel}</span>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: V2T.fg }}>{p.ratio}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(21,128,61,0.1)', color: '#15803d' }}>AA</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── V1 Component Section Content ────────────────────────────────────────────

function V1ButtonContent() {
  return (
    <div>
      <ColLabel v="V1" sub="4 variants · 2 sizes · icon support" />
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Variants</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="primary" size="md">Primary</Button>
          <Button variant="ghost" size="md">Ghost</Button>
          <Button variant="destructive" size="md">Danger</Button>
          <Button variant="link" size="md">Text</Button>
        </div>
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Sizes</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="sm">Small</Button>
        </div>
      </div>
    </div>
  )
}

function V2ButtonContent() {
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="6 variants · default size · Shadcn-style" />
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Variants</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <V2Btn variant="default" label="Primary" />
          <V2Btn variant="secondary" label="Secondary" />
          <V2Btn variant="outline" label="Outline" />
          <V2Btn variant="ghost" label="Ghost" />
          <V2Btn variant="destructive" label="Destructive" />
          <V2Btn variant="link" label="Link" />
        </div>
      </div>
      <div style={{ marginTop: '16px', padding: '12px', background: V2T.secondary, borderRadius: '0.5rem', fontSize: '12px', color: V2T.mutedFg, lineHeight: 1.6 }}>
        <strong style={{ color: V2T.fg }}>Note:</strong> Buttons use <code style={{ fontFamily: 'monospace', color: V2T.primary, fontSize: '11px' }}>bg-primary/90</code> on hover, <code style={{ fontFamily: 'monospace', color: V2T.primary, fontSize: '11px' }}>scale-[0.97]</code> on active. No separate size system - use padding variants.
      </div>
    </div>
  )
}

function V1InputContent() {
  const [val, setVal] = useState('')
  return (
    <div>
      <ColLabel v="V1" sub="Label · hint · error · disabled states" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '360px' }}>
        <TextField label="Amount" placeholder="0.00 ETH" value={val} onChange={(e) => setVal(e.target.value)} hint="Enter the amount to shield" />
        <TextField label="Wallet address" placeholder="0x…" value="" onChange={() => {}} />
        <TextField label="Error state" placeholder="0x…" value="bad input" onChange={() => {}} error="Invalid address format" />
        <TextField label="Disabled" placeholder="0x…" value="" onChange={() => {}} disabled />
      </div>
    </div>
  )
}

function V2InputContent() {
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Input · Textarea · transparent bg · ring focus" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: V2T.fg, marginBottom: '4px', display: 'block' }}>Email</label>
          <V2InputEl placeholder="name@example.com" />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: V2T.fg, marginBottom: '4px', display: 'block' }}>Password</label>
          <V2InputEl placeholder="Password" type="password" />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, color: V2T.fg, marginBottom: '4px', display: 'block' }}>Message</label>
          <textarea placeholder="Write a message..." style={{ width: '100%', minHeight: '64px', padding: '8px 12px', border: `1px solid ${V2T.border}`, borderRadius: '0.375rem', background: 'transparent', fontSize: '0.875rem', fontFamily: V2T.font, color: V2T.fg, outline: 'none', resize: 'vertical' }} />
        </div>
        <div style={{ padding: '12px', background: V2T.secondary, borderRadius: '0.5rem', fontSize: '12px', color: V2T.mutedFg }}>
          Focus ring: <code style={{ fontFamily: 'monospace', color: V2T.primary, fontSize: '11px' }}>ring-[3px] ring-ring/50 border-ring</code>
        </div>
      </div>
    </div>
  )
}

function V1NotificationContent() {
  const items = [
    { id: '1', type: 'info',    title: 'Processing', message: 'Your shield operation is running' },
    { id: '2', type: 'success', title: 'Shielded', message: '1.5 ETH added to private balance' },
    { id: '3', type: 'warning', title: 'Slow network', message: 'Estimated 4+ minutes' },
    { id: '4', type: 'error',   title: 'Transaction failed', message: 'Your funds are safe' },
  ] as const

  const typeConfig = {
    info:    { dot: 'var(--color-processing)', bg: 'rgba(55,72,255,0.06)' },
    success: { dot: 'var(--color-success)',    bg: 'rgba(91,184,30,0.06)' },
    warning: { dot: 'var(--color-warning)',    bg: 'rgba(245,207,0,0.08)' },
    error:   { dot: 'var(--color-error)',      bg: 'rgba(185,28,28,0.06)' },
  }

  return (
    <div>
      <ColLabel v="V1" sub="Toast-style · useNotifications hook · 4 types" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(n => {
          const cfg = typeConfig[n.type]
          return (
            <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: cfg.bg, border: '1px solid var(--color-border)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: cfg.dot, flexShrink: 0, marginTop: '5px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>{n.title}</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{n.message}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', flexShrink: 0, textTransform: 'capitalize' }}>{n.type}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function V2NotificationContent() {
  const items = [
    { id: 1, title: 'Shield complete', body: 'Private balance updated', time: '2m ago', color: V2T.primary },
    { id: 2, title: 'Team invite accepted', body: 'Sarah joined the project', time: '1h ago', color: V2T.primary },
    { id: 3, title: 'Transaction failed', body: 'Your funds are safe', time: '3h ago', color: V2T.destructive },
  ]
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Inline notification list · no dedicated hook" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(n => (
          <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: V2T.radius, background: V2T.secondary }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: n.color, flexShrink: 0, marginTop: '6px' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: V2T.fg, display: 'block' }}>{n.title}</span>
              <span style={{ fontSize: '0.75rem', color: V2T.mutedFg }}>{n.body}</span>
            </div>
            <span style={{ fontSize: '0.625rem', color: V2T.mutedFg, flexShrink: 0 }}>{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function V1BadgeContent() {
  const variants = ['processing', 'pending', 'success', 'failed', 'cancelled', 'action-required'] as const
  return (
    <div>
      <ColLabel v="V1" sub="ShieldPay-specific · maps to operation phases" />
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {variants.map(v => <StatusBadge key={v} variant={v} />)}
      </div>
    </div>
  )
}

function V2BadgeContent() {
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="4 generic variants · pill shape" />
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <V2Badge variant="default" label="Default" />
        <V2Badge variant="secondary" label="Secondary" />
        <V2Badge variant="destructive" label="Destructive" />
        <V2Badge variant="outline" label="Outline" />
      </div>
      <div style={{ marginTop: '16px', fontSize: '12px', color: V2T.mutedFg, lineHeight: 1.6 }}>
        V2 badges are generic. ShieldPay-specific states (processing, finalizing, etc.) would need a custom semantic layer on top.
      </div>
    </div>
  )
}

function V1PhaseIndicatorContent() {
  const [current, setCurrent] = useState(1)
  return (
    <div>
      <ColLabel v="V1" sub="Non-linear system phase display · not a stepper" />
      <div style={{ marginBottom: '16px' }}>
        <PhaseIndicatorVertical phases={[]} currentPhase={current} operation="shield" />
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[0, 1, 2, 3].map(i => (
          <button key={i} onClick={() => setCurrent(i)} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: current === i ? 'var(--color-blue)' : 'transparent', color: current === i ? '#fff' : 'var(--color-text-secondary)', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
            Step {i}
          </button>
        ))}
      </div>
    </div>
  )
}

function V1BalanceCardContent() {
  const [hiddenShielded, setHiddenShielded] = useState(false)
  return (
    <div>
      <ColLabel v="V1" sub="Always shows both balances together" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <BalanceCard type="public" amount="2.450" currency="ETH" hidden={false} usdValue="$8,432.50" />
        <BalanceCard type="shielded" amount="1.200" currency="ETH" hidden={hiddenShielded} onToggleHidden={() => setHiddenShielded(h => !h)} usdValue="$4,368.00" />
      </div>
    </div>
  )
}

function V1ActivityRowContent() {
  const now = Date.now()
  return (
    <div>
      <ColLabel v="V1" sub="Operation history row · all phase states" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <ActivityRow type="shield" amount="1.5" status="completed" date={now - 3600000} hidden={false} />
        <ActivityRow type="unshield" amount="0.8" status="processing" date={now - 120000} hidden={false} />
        <ActivityRow type="shield" amount="2.0" status="failed_dropped" date={now - 86400000} hidden={false} />
      </div>
    </div>
  )
}

function V1StatusBannerContent() {
  return (
    <div>
      <ColLabel v="V1" sub="Persists across page navigation · layout-level component" />
      <InfoBar
        phase="processing"
        operation="shield"
        amount="1.5"
        startedAt={Date.now() - 120000}
        onView={() => {}}
      />
    </div>
  )
}

function V1NavWarningContent() {
  return (
    <div>
      <ColLabel v="V1" sub="Blocks navigation during active operations" />
      <NavigationWarning urgency="urgent" onStay={() => {}} onLeave={() => {}} />
    </div>
  )
}

function V1ConnectWalletContent() {
  const [state, setState] = useState<ConnectState>('landing')
  return (
    <div>
      <ColLabel v="V1" sub="Multi-step wallet connection flow" />
      <ConnectWalletCard
        state={state}
        onConnect={() => setState('connecting')}
        onBack={() => setState('landing')}
        onRetry={() => setState('landing')}
        onCancel={() => setState('landing')}
        onEnableShielded={() => setState('landing')}
        onSkipShielded={() => setState('landing')}
        onDashboard={() => setState('landing')}
      />
    </div>
  )
}

function V1RightPanelContent() {
  return (
    <div>
      <ColLabel v="V1" sub="Fixed-width operation panel · idle → form → processing" />
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '500px', position: 'relative' }}>
        <RightPanel
          isOpen={true}
          onClose={() => {}}
          activeAction="shield"
          phase="idle"
          operationType="shield"
          publicBalance="2.450"
          shieldedBalance="1.200"
          onStartShield={() => {}}
          onStartSend={() => {}}
          onStartUnshield={() => {}}
          onCancel={() => {}}
          onComplete={() => {}}
          onDone={() => {}}
          onOverlayIntensity={() => {}}
        />
      </div>
    </div>
  )
}

function V1LeftOverlayContent() {
  const [intensity, setIntensity] = useState<0 | 30 | 50>(30)
  return (
    <div>
      <ColLabel v="V1" sub="Scrim overlay on left column during active operations" />
      <div style={{ position: 'relative', height: '200px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: 'var(--text-heading)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Left Column Content</div>
          <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>Overlaid at intensity {intensity}%</div>
        </div>
        <LeftColumnOverlay intensity={intensity} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        {([0, 30, 50] as const).map(v => (
          <button key={v} onClick={() => setIntensity(v)} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--color-border)', background: intensity === v ? 'var(--color-midnight)' : 'transparent', color: intensity === v ? '#fff' : 'var(--color-text-secondary)', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
            {v}%
          </button>
        ))}
      </div>
    </div>
  )
}

function V2CardContent() {
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Card · CardHeader · CardContent · CardFooter" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: V2T.card, border: `1px solid ${V2T.border}`, borderRadius: V2T.radius, padding: '24px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: V2T.cardFg, marginBottom: '2px' }}>Pro Plan</div>
          <div style={{ fontSize: '0.75rem', color: V2T.mutedFg, marginBottom: '16px' }}>Everything you need to scale</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.875rem', fontWeight: 700, color: V2T.fg }}>$29</span>
            <span style={{ fontSize: '0.875rem', color: V2T.mutedFg }}>/month</span>
          </div>
          {['Unlimited projects', 'Priority support', 'Custom domains'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '9999px', background: `${V2T.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '9999px', background: V2T.primary }} />
              </div>
              <span style={{ color: V2T.fg }}>{f}</span>
            </div>
          ))}
          <V2Btn variant="default" label="Get Started" fullWidth />
        </div>
      </div>
    </div>
  )
}

function V2SwitchContent() {
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Toggle switch · checked/unchecked states" />
      <div style={{ background: V2T.card, border: `1px solid ${V2T.border}`, borderRadius: V2T.radius, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: V2T.fg }}>Two-factor auth</div>
            <div style={{ fontSize: '0.75rem', color: V2T.mutedFg }}>Verify via email or phone</div>
          </div>
          <V2Switch checked={true} label="" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: V2T.fg }}>Marketing emails</div>
            <div style={{ fontSize: '0.75rem', color: V2T.mutedFg }}>Receive product updates</div>
          </div>
          <V2Switch checked={false} label="" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: V2T.fg }}>Push notifications</div>
            <div style={{ fontSize: '0.75rem', color: V2T.mutedFg }}>Real-time alerts</div>
          </div>
          <V2Switch checked={true} label="" />
        </div>
      </div>
    </div>
  )
}

function V2ProgressContent() {
  return (
    <div style={{ fontFamily: V2T.font }}>
      <ColLabel v="V2" sub="Progress bar · label + value + percentage" />
      <div style={{ background: V2T.card, border: `1px solid ${V2T.border}`, borderRadius: V2T.radius, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <V2ProgressBar label="Revenue" value={82} meta="$45,231" />
        <V2ProgressBar label="Subscriptions" value={65} meta="2,350" />
        <V2ProgressBar label="Active Users" value={91} meta="18,549" />
        <V2ProgressBar label="Churn Rate" value={24} meta="2.4%" />
      </div>
    </div>
  )
}

// ─── CompareSection ───────────────────────────────────────────────────────────

interface CompareSectionProps {
  id: string
  label: string
  group: string
  v1: React.ReactNode
  v2: React.ReactNode
  choice: SectionChoice
  onChange: (patch: Partial<SectionChoice>) => void
}

function CompareSection({ id, label, group, v1, v2, choice, onChange }: CompareSectionProps) {
  const picked = choice.pick
  return (
    <div
      id={`cmp-${id}`}
      style={{ borderBottom: '1px solid var(--color-border)', scrollMarginTop: '100px' }}
    >
      {/* Section header */}
      <div style={{ padding: '12px 24px', background: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', border: '1px solid var(--color-border)', padding: '1px 6px', borderRadius: '4px' }}>{group}</span>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{label}</h3>
        {picked && (
          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', background: picked === 'v1' ? '#14141A' : '#3748FF', color: '#fff' }}>
            {picked.toUpperCase()} selected
          </span>
        )}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '200px' }}>
        <div style={{
          padding: '24px',
          borderRight: '1px solid var(--color-border)',
          background: picked === 'v1' ? 'rgba(55,72,255,0.03)' : 'transparent',
          outline: picked === 'v1' ? '2px solid rgba(55,72,255,0.2)' : 'none',
          outlineOffset: '-2px',
        }}>
          {v1}
        </div>
        <div style={{
          padding: '24px',
          background: picked === 'v2' ? 'rgba(55,72,255,0.03)' : 'transparent',
          outline: picked === 'v2' ? '2px solid rgba(55,72,255,0.2)' : 'none',
          outlineOffset: '-2px',
        }}>
          {v2}
        </div>
      </div>

      {/* Choice + comment row */}
      <div style={{ padding: '14px 24px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-subtle)', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexShrink: 0, paddingTop: '9px' }}>
          {(['v1', 'v2'] as const).map(v => (
            <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="radio"
                name={`pick-${id}`}
                value={v}
                checked={picked === v}
                onChange={() => onChange({ pick: v })}
                style={{ accentColor: 'var(--color-blue)', width: '14px', height: '14px' }}
              />
              <span style={{ fontSize: '13px', fontWeight: picked === v ? 700 : 400, color: picked === v ? 'var(--color-blue)' : 'var(--color-text-secondary)' }}>
                Keep {v.toUpperCase()}
              </span>
            </label>
          ))}
          {picked && (
            <button
              onClick={() => onChange({ pick: null })}
              style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', paddingTop: '1px', fontFamily: 'Manrope, sans-serif' }}
            >
              clear
            </button>
          )}
        </div>
        <textarea
          placeholder="Add notes for the final design system…"
          value={choice.comment}
          onChange={e => onChange({ comment: e.target.value })}
          rows={2}
          style={{
            flex: 1, padding: '8px 12px',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-raised)',
            fontSize: '13px', color: 'var(--color-text-primary)',
            fontFamily: 'Manrope, sans-serif', resize: 'vertical', outline: 'none',
            lineHeight: 1.5, minHeight: '40px',
          }}
        />
      </div>
    </div>
  )
}

// ─── Summary Panel ────────────────────────────────────────────────────────────

function SummaryPanel({ state }: { state: CompareState }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const decided = SECTIONS.filter(s => state[s.id]?.pick)
  const undecided = SECTIONS.filter(s => !state[s.id]?.pick)

  const copyText = () => {
    const lines = ['# Design System - Final Choices', '']
    const groups = ['Foundation', 'Components']
    for (const g of groups) {
      lines.push(`## ${g}`, '')
      for (const s of SECTIONS.filter(s => s.group === g)) {
        const c = state[s.id]
        const pick = c?.pick ? c.pick.toUpperCase() : '-'
        lines.push(`### ${s.label} → ${pick}`)
        if (c?.comment) lines.push(`Comment: ${c.comment}`)
        lines.push('')
      }
    }
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: '52px', right: 0,
          width: '340px', maxHeight: '60vh', overflow: 'auto',
          background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
          padding: '16px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            {decided.length} / {SECTIONS.length} decided
          </div>
          {SECTIONS.map(s => {
            const c = state[s.id]
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '12px', flex: 1, color: 'var(--color-text-primary)' }}>{s.label}</span>
                {c?.pick ? (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: c.pick === 'v1' ? '#14141A' : '#3748FF', color: '#fff', flexShrink: 0 }}>{c.pick.toUpperCase()}</span>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', flexShrink: 0 }}>-</span>
                )}
              </div>
            )
          })}
          {undecided.length > 0 && (
            <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              Undecided: {undecided.map(s => s.label).join(', ')}
            </div>
          )}
          <button onClick={copyText} style={{ marginTop: '14px', width: '100%', padding: '8px', background: 'var(--color-blue)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
            {copied ? '✓ Copied!' : 'Copy summary as text'}
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '9999px',
          background: 'var(--color-midnight)', color: '#fff', border: 'none',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)', fontFamily: 'Manrope, sans-serif',
        }}
      >
        {decided.length > 0 && (
          <span style={{ background: 'var(--color-lime)', color: '#14141A', borderRadius: '9999px', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>{decided.length}</span>
        )}
        Choices {open ? '▲' : '▼'}
      </button>
    </div>
  )
}

// ─── Section Content Map ──────────────────────────────────────────────────────

type SectionContentMap = Record<string, { v1: React.ReactNode; v2: React.ReactNode }>

function buildContent(): SectionContentMap {
  return {
    'color':           { v1: <V1ColorContent />,         v2: <V2ColorContent /> },
    'typography':      { v1: <V1TypographyContent />,    v2: <V2TypographyContent /> },
    'spacing':         { v1: <V1SpacingContent />,       v2: <GapPlaceholder note="Spacing scale not defined in V2. Tailwind default scale would apply." /> },
    'radius':          { v1: <V1RadiusContent />,        v2: <V2RadiusContent /> },
    'elevation':       { v1: <V1ElevationContent />,     v2: <GapPlaceholder note="Shadow scale not defined in V2. Shadcn components use no shadow tokens." /> },
    'motion':          { v1: <V1MotionContent />,        v2: <GapPlaceholder note="Motion tokens not defined in V2. Tailwind transition utilities used ad-hoc." /> },
    'layout':          { v1: <V1LayoutContent />,        v2: <GapPlaceholder note="Layout dimension tokens not defined in V2." /> },
    'dark-mode':       { v1: <GapPlaceholder note="Dark mode not defined in V1. Light mode only." />, v2: <V2DarkModeContent /> },
    'gradients':       { v1: <GapPlaceholder note="Gradient tokens not defined in V1." />,             v2: <V2GradientsContent /> },
    'icons':           { v1: <V1IconsContent />,         v2: <V2IconsContent /> },
    'accessibility':   { v1: <GapPlaceholder note="WCAG contrast ratios not formally documented in V1." />, v2: <V2AccessibilityContent /> },
    'button':          { v1: <V1ButtonContent />,        v2: <V2ButtonContent /> },
    'input':           { v1: <V1InputContent />,         v2: <V2InputContent /> },
    'notification':    { v1: <V1NotificationContent />,  v2: <V2NotificationContent /> },
    'badge':           { v1: <V1BadgeContent />,         v2: <V2BadgeContent /> },
    'phase-indicator': { v1: <V1PhaseIndicatorContent />,v2: <GapPlaceholder note="No equivalent in V2. ShieldPay-specific component." /> },
    'balance-card':    { v1: <V1BalanceCardContent />,   v2: <GapPlaceholder note="No equivalent in V2. ShieldPay-specific component." /> },
    'activity-row':    { v1: <V1ActivityRowContent />,   v2: <GapPlaceholder note="No equivalent in V2. ShieldPay-specific component." /> },
    'status-banner':   { v1: <V1StatusBannerContent />,  v2: <GapPlaceholder note="No equivalent in V2. ShieldPay-specific component." /> },
    'nav-warning':     { v1: <V1NavWarningContent />,    v2: <GapPlaceholder note="No equivalent in V2. ShieldPay-specific component." /> },
    'connect-wallet':  { v1: <V1ConnectWalletContent />, v2: <GapPlaceholder note="No equivalent in V2. ShieldPay-specific component." /> },
    'right-panel':     { v1: <V1RightPanelContent />,    v2: <GapPlaceholder note="No equivalent in V2. ShieldPay-specific component." /> },
    'left-overlay':    { v1: <V1LeftOverlayContent />,   v2: <GapPlaceholder note="No equivalent in V2. ShieldPay-specific component." /> },
    'card':            { v1: <GapPlaceholder note="No generic Card component in V1. BalanceCard is ShieldPay-specific." />, v2: <V2CardContent /> },
    'switch':          { v1: <GapPlaceholder note="No Toggle/Switch component in V1." />,            v2: <V2SwitchContent /> },
    'progress':        { v1: <GapPlaceholder note="No Progress Bar component in V1." />,             v2: <V2ProgressContent /> },
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'shieldpay-ds-compare'

function loadState(): CompareState {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

export function DesignSystemCompare() {
  const [choices, setChoices] = useState<CompareState>(loadState)

  const update = (id: string, patch: Partial<SectionChoice>) => {
    setChoices(prev => {
      const existing = prev[id] ?? { pick: null, comment: '' }
      const next = { ...prev, [id]: { ...existing, ...patch } }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const scrollTo = (id: string) => document.getElementById(`cmp-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const content = buildContent()
  const foundationSections = SECTIONS.filter(s => s.group === 'Foundation')
  const componentSections = SECTIONS.filter(s => s.group === 'Components')

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-surface)' }}>

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 'var(--layout-nav-height)', zIndex: 30, background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border)' }}>
        {/* Title + section nav */}
        <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ flexShrink: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>DS Compare</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>V1 vs V2</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: '4px', scrollbarWidth: 'none' }}>
            {foundationSections.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)} style={{ flexShrink: 0, padding: '4px 10px', borderRadius: '9999px', border: '1px solid var(--color-border)', background: choices[s.id]?.pick ? 'var(--color-midnight)' : 'transparent', color: choices[s.id]?.pick ? '#fff' : 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Manrope, sans-serif', whiteSpace: 'nowrap' }}>
                {s.label}
              </button>
            ))}
            <div style={{ width: '1px', background: 'var(--color-border)', flexShrink: 0, margin: '2px 4px' }} />
            {componentSections.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)} style={{ flexShrink: 0, padding: '4px 10px', borderRadius: '9999px', border: '1px solid var(--color-border)', background: choices[s.id]?.pick ? 'var(--color-midnight)' : 'transparent', color: choices[s.id]?.pick ? '#fff' : 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Manrope, sans-serif', whiteSpace: 'nowrap' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {/* Column labels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '8px 24px', borderRight: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, background: '#14141A', color: '#fff', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.06em' }}>V1</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Custom tokens · Manrope · Lucide · Light only</span>
          </div>
          <div style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, background: '#3748FF', color: '#fff', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.06em' }}>V2</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Efecto / Shadcn · Inter · Phosphor · Dark mode</span>
          </div>
        </div>
      </div>

      {/* Foundation divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Foundation</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      </div>

      {foundationSections.map(s => (
        <CompareSection
          key={s.id}
          id={s.id}
          label={s.label}
          group={s.group}
          v1={content[s.id].v1}
          v2={content[s.id].v2}
          choice={choices[s.id] ?? { pick: null, comment: '' }}
          onChange={patch => update(s.id, patch)}
        />
      ))}

      {/* Components divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '32px 24px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Components</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      </div>

      {componentSections.map(s => (
        <CompareSection
          key={s.id}
          id={s.id}
          label={s.label}
          group={s.group}
          v1={content[s.id].v1}
          v2={content[s.id].v2}
          choice={choices[s.id] ?? { pick: null, comment: '' }}
          onChange={patch => update(s.id, patch)}
        />
      ))}

      <div style={{ height: '120px' }} />

      <SummaryPanel state={choices} />
    </div>
  )
}
