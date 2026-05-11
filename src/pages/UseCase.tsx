import { useState, useRef, useEffect } from 'react'
import { User, Cpu, CheckCircle, AlertTriangle, Zap } from 'lucide-react'
import { RightPanel } from '../components/RightPanel'
import { InfoBar } from '../components/InfoBar'
import { PhaseIndicatorVertical } from '../components/PhaseIndicatorVertical'
import { StatusBadge } from '../components/StatusBadge'
import type { OperationPhase, OperationType } from '../types/operation'
import type { DrawerAction } from '../context/DrawerContext'

// ── Phase flow data ─────────────────────────────────────────────────────────

type Actor = 'user' | 'system' | 'action-required' | 'done' | 'error'

interface PhaseEntry {
  phase: OperationPhase
  label: string
  actor: Actor
  actorNote: string
}

const SHIELD_PHASES: PhaseEntry[] = [
  { phase: 'idle',                  label: 'Idle - form',       actor: 'user',            actorNote: 'User enters amount and clicks "Shield funds"' },
  { phase: 'awaiting_wallet_step1', label: 'Wallet - Step 1/2', actor: 'user',            actorNote: 'Sign to authorize ShieldPay to move tokens · costs gas' },
  { phase: 'awaiting_wallet_step2', label: 'Wallet - Step 2/2', actor: 'user',            actorNote: 'Sign to execute the shield transfer · costs gas' },
  { phase: 'submitted',             label: 'Submitted',         actor: 'system',          actorNote: 'Tx broadcast to the network - user can leave' },
  { phase: 'processing',            label: 'Confirming',        actor: 'system',          actorNote: 'On-chain confirmation in progress (~12–36s)' },
  { phase: 'finalizing',            label: 'Encrypting',        actor: 'system',          actorNote: 'FHE coprocessor encrypts shielded balance (~1–3 min) - Etherscan shows "Success" but balance not ready yet' },
  { phase: 'completed',             label: 'Complete',          actor: 'done',            actorNote: 'Shielded balance updated. Operation over.' },
  { phase: 'cancelled',             label: 'Cancelled',         actor: 'error',           actorNote: 'User dismissed wallet prompt - no funds moved' },
  { phase: 'failed_dropped',        label: 'Failed - dropped',  actor: 'error',           actorNote: 'Tx dropped from network - funds safe, can retry' },
]

const SEND_PHASES: PhaseEntry[] = [
  { phase: 'idle',                  label: 'Idle - form',       actor: 'user',            actorNote: 'User enters amount and recipient address' },
  { phase: 'awaiting_wallet_step1', label: 'Wallet confirm',    actor: 'user',            actorNote: 'User approves transfer in wallet · costs gas. One step for both public and shielded sends.' },
  { phase: 'submitted',             label: 'Submitted',         actor: 'system',          actorNote: 'Tx broadcast - user can leave' },
  { phase: 'processing',            label: 'Confirming',        actor: 'system',          actorNote: 'On-chain confirmation in progress' },
  { phase: 'finalizing',            label: 'Encrypting',        actor: 'system',          actorNote: 'Shielded sends only: transfer encrypted for sender and recipient (~1 min). Public sends (ETH, USDC, DAI) skip this step and go straight to completed.' },
  { phase: 'completed',             label: 'Complete',          actor: 'done',            actorNote: 'Transfer sent. Only sender and recipient can see the amount.' },
  { phase: 'cancelled',             label: 'Cancelled',         actor: 'error',           actorNote: 'User dismissed wallet - no funds moved' },
]

const UNSHIELD_PHASES: PhaseEntry[] = [
  { phase: 'idle',                  label: 'Idle - form',       actor: 'user',            actorNote: 'User enters amount to unshield' },
  { phase: 'awaiting_wallet_step1', label: 'Wallet - Step 1/2', actor: 'user',            actorNote: 'Sign to remove from shielded balance · shielded tokens burn from this point forward' },
  { phase: 'submitted',             label: 'Submitted',         actor: 'system',          actorNote: 'Tx broadcast - user can leave' },
  { phase: 'processing',            label: 'Proof wait',        actor: 'system',          actorNote: 'System generates decryption proof (~1–2 min). Shielded tokens already burned. User can close tab.' },
  { phase: 'proof_ready',           label: 'Proof ready',       actor: 'action-required', actorNote: 'User must return and complete Step 2 to release funds. Funds secured but not accessible until then.' },
  { phase: 'awaiting_wallet_step2', label: 'Wallet - Step 2/2', actor: 'user',            actorNote: 'Sign to release funds to public balance · costs gas' },
  { phase: 'finalizing',            label: 'Releasing',         actor: 'system',          actorNote: 'ERC-20 transfer to public balance (~30s)' },
  { phase: 'completed',             label: 'Complete',          actor: 'done',            actorNote: 'Both balances updated. Public balance increased.' },
  { phase: 'interrupted',           label: 'Interrupted',       actor: 'action-required', actorNote: 'User left during proof wait. On return: app checks proof status — if proof ready, restores to proof_ready (action required). Recoverable, not terminal.' },
]

const OP_PHASES: Record<OperationType, PhaseEntry[]> = {
  shield: SHIELD_PHASES,
  send: SEND_PHASES,
  unshield: UNSHIELD_PHASES,
}

const ACTOR_CONFIG: Record<Actor, { label: string; Icon: React.ElementType; bg: string; color: string }> = {
  user:             { label: 'User action',     Icon: User,          bg: 'rgba(55,72,255,0.08)',    color: '#3748FF' },
  system:           { label: 'System',          Icon: Cpu,           bg: 'rgba(107,108,128,0.10)',  color: '#6B6C80' },
  'action-required':{ label: 'Action required', Icon: Zap,           bg: 'rgba(180,83,9,0.08)',     color: '#B45309' },
  done:             { label: 'Done',            Icon: CheckCircle,   bg: 'rgba(91,184,30,0.10)',    color: '#5BB81E' },
  error:            { label: 'Terminal',        Icon: AlertTriangle, bg: 'rgba(185,28,28,0.08)',    color: '#B91C1C' },
}

// ── Layout primitives ───────────────────────────────────────────────────────

function UCSection({ id, num, title, description, children }: {
  id: string; num: string; title: string; description?: string; children: React.ReactNode
}) {
  return (
    <section id={id} style={{ marginBottom: '96px', scrollMarginTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#96C129', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>{num}</span>
        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {title}
        </h2>
      </div>
      {description && (
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 36px', lineHeight: 1.7 }}>
          {description}
        </p>
      )}
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
      {children}
    </div>
  )
}

function ProseBlock({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.75, margin: '0 0 24px' }}>
      {children}
    </p>
  )
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--color-surface-subtle)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-text-primary)' }}>
      {children}
    </code>
  )
}

function UCTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 14px', borderBottom: '2px solid var(--color-border)', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'var(--color-surface-subtle)' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', color: ci === 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: ci === 0 ? 500 : 400, lineHeight: 1.5 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Callout({ tone, children }: { tone: 'info' | 'warning' | 'success'; children: React.ReactNode }) {
  const colors = {
    info:    { bg: 'rgba(55,72,255,0.05)',  border: 'rgba(55,72,255,0.2)',   text: '#3748FF' },
    warning: { bg: 'rgba(180,83,9,0.05)',   border: 'rgba(180,83,9,0.2)',    text: '#B45309' },
    success: { bg: 'rgba(91,184,30,0.05)',  border: 'rgba(91,184,30,0.2)',   text: '#5BB81E' },
  }[tone]
  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '24px', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
      {children}
    </div>
  )
}

// ── Phase visualizer (Section 04) ───────────────────────────────────────────

const NOOP = () => {}
const MOCK_START = Date.now() - 95_000

function ActorBadge({ actor }: { actor: Actor }) {
  const cfg = ACTOR_CONFIG[actor]
  const { Icon } = cfg
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '99px', background: cfg.bg, fontSize: '11px', fontWeight: 600, color: cfg.color, flexShrink: 0, whiteSpace: 'nowrap' }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

function PhaseVisualizer() {
  const [op, setOp] = useState<OperationType>('shield')
  const [phaseIdx, setPhaseIdx] = useState(0)

  const phases = OP_PHASES[op]
  const current = phases[phaseIdx]

  const switchOp = (newOp: OperationType) => {
    setOp(newOp)
    setPhaseIdx(0)
  }

  const opTabs: { id: OperationType; label: string }[] = [
    { id: 'shield',   label: 'Shield' },
    { id: 'send',     label: 'Send' },
    { id: 'unshield', label: 'Unshield' },
  ]

  return (
    <div>
      {/* Op switcher */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', padding: '4px', width: 'fit-content' }}>
        {opTabs.map(t => (
          <button
            key={t.id}
            onClick={() => switchOp(t.id)}
            style={{
              padding: '7px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontSize: '13px', fontWeight: op === t.id ? 700 : 400,
              background: op === t.id ? 'var(--color-surface-raised)' : 'transparent',
              color: op === t.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: op === t.id ? 'var(--shadow-sm)' : 'none',
              fontFamily: 'Manrope, sans-serif',
              transition: 'all 150ms ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 2-col layout */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* Phase list */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {phases.map((entry, idx) => {
            const isActive = idx === phaseIdx
            const cfg = ACTOR_CONFIG[entry.actor]
            return (
              <button
                key={`${op}-${idx}`}
                onClick={() => setPhaseIdx(idx)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px',
                  width: '100%', padding: '10px 14px', textAlign: 'left',
                  background: isActive ? 'var(--color-surface-raised)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${isActive ? cfg.color : 'transparent'}`,
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  cursor: 'pointer',
                  transition: 'all 100ms ease',
                  fontFamily: 'Manrope, sans-serif',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-subtle)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', flex: 1 }}>
                    {entry.label}
                  </span>
                  <ActorBadge actor={entry.actor} />
                </div>
                {isActive && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                    {entry.actorNote}
                  </span>
                )}
              </button>
            )
          })}

          {/* Prev / Next */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', padding: '0 4px' }}>
            <button
              onClick={() => setPhaseIdx(i => Math.max(0, i - 1))}
              disabled={phaseIdx === 0}
              style={{ flex: 1, padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-raised)', cursor: phaseIdx === 0 ? 'default' : 'pointer', fontSize: '12px', fontWeight: 600, color: phaseIdx === 0 ? 'var(--color-border)' : 'var(--color-text-secondary)', fontFamily: 'Manrope, sans-serif', transition: 'color 100ms' }}
            >
              {String.fromCharCode(8592)} Prev
            </button>
            <button
              onClick={() => setPhaseIdx(i => Math.min(phases.length - 1, i + 1))}
              disabled={phaseIdx === phases.length - 1}
              style={{ flex: 1, padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-raised)', cursor: phaseIdx === phases.length - 1 ? 'default' : 'pointer', fontSize: '12px', fontWeight: 600, color: phaseIdx === phases.length - 1 ? 'var(--color-border)' : 'var(--color-text-secondary)', fontFamily: 'Manrope, sans-serif', transition: 'color 100ms' }}
            >
              Next {String.fromCharCode(8594)}
            </button>
          </div>
        </div>

        {/* RightPanel demo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <RightPanel
            key={op}
            demo
            isOpen
            activeAction={op as DrawerAction}
            phase={current.phase}
            operationType={op}
            amount="0.50"
            recipient="0x742d35Cc6634C0532925a3b8D4C9C2C5e09c3bE4"
            publicBalance="1.24"
            shieldedBalance="0.50"
            startedAt={MOCK_START}
            txHashStep1="0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1"
            txHashStep2="0xdef456abc123def456abc123def456abc123def456abc123def456abc123def4"
            onStartShield={NOOP}
            onStartSend={NOOP}
            onStartUnshield={NOOP}
            onCancel={NOOP}
            onComplete={NOOP}
            onDone={NOOP}
            onClose={NOOP}
            onOverlayIntensity={NOOP}
          />
        </div>
      </div>
    </div>
  )
}

// ── Flow map (Section 02) ────────────────────────────────────────────────────

function FlowMap() {
  // layout constants
  const NW = 86, NH = 50
  const FW = 72, FH = 34
  const STEP = 102
  const MAIN_X = 248

  const SY   = 100
  const SFY  = 208
  const SEP  = 287
  const UY   = 374
  const UFY  = 480
  const ENT_Y = Math.round((SY + UY) / 2)

  const CANVAS_W = MAIN_X + 8 * STEP + NW + 40
  const CANVAS_H = UFY + FH / 2 + 52

  type A = 'user' | 'system' | 'action-required' | 'done' | 'error'
  interface FN {
    id: string; label: string; sub?: string
    actor: A; x: number; y: number; small?: boolean
  }

  const COL: Record<A, string> = {
    user: '#3748FF', system: '#6B6C80',
    'action-required': '#B45309', done: '#5BB81E', error: '#B91C1C',
  }
  const FMBG: Record<A, string> = {
    user: 'rgba(55,72,255,0.07)', system: 'rgba(107,108,128,0.08)',
    'action-required': 'rgba(180,83,9,0.08)',
    done: 'rgba(91,184,30,0.08)', error: 'rgba(185,28,28,0.07)',
  }
  const FMAL: Record<A, string> = {
    user: 'USER', system: 'SYSTEM',
    'action-required': 'ACTION', done: 'DONE', error: 'TERMINAL',
  }

  const px = (i: number) => MAIN_X + i * STEP

  const entryNodes: FN[] = [
    { id: 'e0', label: 'Connect Wallet', sub: 'EIP-712 on first use', actor: 'user',   x: 20,  y: ENT_Y },
    { id: 'e1', label: 'Overview',       sub: 'wallet confirmed',     actor: 'system', x: 130, y: ENT_Y },
  ]

  const sMain: FN[] = [
    { id: 'si', label: 'Form',        sub: 'enter amount',    actor: 'user',   x: px(0), y: SY },
    { id: 'sp', label: 'Preparing',   sub: '~1s ZKPoK',       actor: 'system', x: px(1), y: SY },
    { id: 's1', label: 'Wallet 1/2',  sub: 'approve tokens',  actor: 'user',   x: px(2), y: SY },
    { id: 's2', label: 'Wallet 2/2',  sub: 'execute shield',  actor: 'user',   x: px(3), y: SY },
    { id: 'ss', label: 'Submitted',   sub: 'broadcast',       actor: 'system', x: px(4), y: SY },
    { id: 'sc', label: 'Confirming',  sub: '~12-36s',         actor: 'system', x: px(5), y: SY },
    { id: 'se', label: 'Encrypting',  sub: '~1-3 min',        actor: 'system', x: px(6), y: SY },
    { id: 'sd', label: 'Done',        actor: 'done',                           x: px(7), y: SY },
  ]

  const sFail: FN[] = [
    { id: 'sf1', label: 'Cancelled',  sub: 'step 1',     actor: 'error', x: px(2), y: SFY, small: true },
    { id: 'sf2', label: 'Cancelled',  sub: 'step 2',     actor: 'error', x: px(3), y: SFY, small: true },
    { id: 'sf3', label: 'Rejected',   sub: 'network',    actor: 'error', x: px(4), y: SFY, small: true },
    { id: 'sf4', label: 'Tx dropped', sub: 'low gas',    actor: 'error', x: px(5), y: SFY, small: true },
    { id: 'sf5', label: 'Enc. failed',sub: 'FHE error',  actor: 'error', x: px(6), y: SFY, small: true },
  ]

  const uMain: FN[] = [
    { id: 'ui', label: 'Form',        sub: 'enter amount',    actor: 'user',             x: px(0), y: UY },
    { id: 'up', label: 'Preparing',   sub: '~1s ZKPoK',       actor: 'system',           x: px(1), y: UY },
    { id: 'u1', label: 'Wallet 1/2',  sub: 'unwrap tokens',   actor: 'user',             x: px(2), y: UY },
    { id: 'us', label: 'Submitted',   sub: 'tokens burned',   actor: 'system',           x: px(3), y: UY },
    { id: 'uw', label: 'Proof wait',  sub: '~1-2 min',        actor: 'system',           x: px(4), y: UY },
    { id: 'ur', label: 'Proof ready', sub: 'return required', actor: 'action-required',  x: px(5), y: UY },
    { id: 'u2', label: 'Wallet 2/2',  sub: 'finalize unwrap', actor: 'user',             x: px(6), y: UY },
    { id: 'uf', label: 'Releasing',   sub: '~30s',            actor: 'system',           x: px(7), y: UY },
    { id: 'ud', label: 'Done',        actor: 'done',                                     x: px(8), y: UY },
  ]

  const uFail: FN[] = [
    { id: 'uf1', label: 'Cancelled',    sub: 'step 1',        actor: 'error',           x: px(2), y: UFY, small: true },
    { id: 'uf2', label: 'Rejected',     sub: 'network',       actor: 'error',           x: px(3), y: UFY, small: true },
    { id: 'uf3', label: 'Interrupted',  sub: 'user left',     actor: 'action-required', x: px(4), y: UFY, small: true },
    { id: 'uf4', label: 'Step 2 cancel',sub: 'returns later', actor: 'action-required', x: px(6), y: UFY, small: true },
  ]

  const allNodes = [...entryNodes, ...sMain, ...sFail, ...uMain, ...uFail]

  const hLink = (a: FN, b: FN) => `M${a.x + NW},${a.y} L${b.x},${b.y}`

  const drop = (from: FN, to: FN) => {
    const cx = from.x + NW / 2
    const y1 = from.y + NH / 2
    const y2 = to.y - FH / 2
    return `M${cx},${y1} C${cx},${y1 + 22} ${cx},${y2 - 22} ${cx},${y2}`
  }

  const entryArc = (to: FN) => {
    const ov = entryNodes[1]
    const x1 = ov.x + NW, y1 = ov.y, x2 = to.x, y2 = to.y
    return `M${x1},${y1} C${x1 + 18},${y1} ${x2 - 10},${y2} ${x2},${y2}`
  }

  const prdNode = uMain[5]
  const recArc1 = (() => {
    const n = uFail[2]
    const x1 = n.x + FW, y1 = n.y
    const x2 = prdNode.x + NW / 2, y2 = prdNode.y + NH / 2
    return `M${x1},${y1} C${x1 + 42},${y1} ${x2 + 28},${y2 + 52} ${x2},${y2}`
  })()
  const recArc2 = (() => {
    const n = uFail[3]
    const x1 = n.x + FW / 2, y1 = n.y - FH / 2
    const x2 = prdNode.x + NW / 2, y2 = prdNode.y + NH / 2
    return `M${x1},${y1} C${x1},${y1 - 44} ${x2},${y2 + 44} ${x2},${y2}`
  })()

  const INIT_SCALE = 0.72
  const containerRef = useRef<HTMLDivElement>(null)
  const scaleRef     = useRef(INIT_SCALE)
  const txRef        = useRef(0)
  const tyRef        = useRef(0)
  const dragRef      = useRef<{ sx: number; sy: number; stx: number; sty: number } | null>(null)
  const [xform, setXform]           = useState({ tx: 0, ty: 0, scale: INIT_SCALE })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.92 : 1.09
      const next = Math.min(2.5, Math.max(0.3, scaleRef.current * factor))
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const ntx = mx - (mx - txRef.current) * (next / scaleRef.current)
      const nty = my - (my - tyRef.current) * (next / scaleRef.current)
      scaleRef.current = next; txRef.current = ntx; tyRef.current = nty
      setXform({ tx: ntx, ty: nty, scale: next })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPtrDown = (e: React.PointerEvent) => {
    dragRef.current = { sx: e.clientX, sy: e.clientY, stx: txRef.current, sty: tyRef.current }
    setIsDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPtrMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const ntx = dragRef.current.stx + e.clientX - dragRef.current.sx
    const nty = dragRef.current.sty + e.clientY - dragRef.current.sy
    txRef.current = ntx; tyRef.current = nty
    setXform(x => ({ ...x, tx: ntx, ty: nty }))
  }
  const onPtrUp = () => { dragRef.current = null; setIsDragging(false) }

  return (
    <div>
      <div
        ref={containerRef}
        onPointerDown={onPtrDown}
        onPointerMove={onPtrMove}
        onPointerUp={onPtrUp}
        onPointerLeave={onPtrUp}
        style={{
          width: '100%', height: 520, overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative', userSelect: 'none',
        }}
      >
        <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10, display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginRight: 6, fontVariantNumeric: 'tabular-nums', fontFamily: 'Manrope, sans-serif' }}>
            {Math.round(xform.scale * 100)}%
          </span>
          {([
            ['+', () => { const n = Math.min(2.5, scaleRef.current * 1.2); scaleRef.current = n; setXform(x => ({ ...x, scale: n })) }],
            ['-', () => { const n = Math.max(0.3, scaleRef.current / 1.2); scaleRef.current = n; setXform(x => ({ ...x, scale: n })) }],
            ['reset', () => { scaleRef.current = INIT_SCALE; txRef.current = 0; tyRef.current = 0; setXform({ tx: 0, ty: 0, scale: INIT_SCALE }) }],
          ] as [string, () => void][]).map(([lbl, fn]) => (
            <button key={lbl} onClick={fn} style={{
              padding: '0 8px', height: 26,
              border: '1px solid var(--color-border)',
              borderRadius: 5, background: 'var(--color-surface)',
              fontSize: 11, fontWeight: 600,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
            }}>{lbl}</button>
          ))}
        </div>

        <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 9, color: 'var(--color-text-secondary)', letterSpacing: '0.05em', fontFamily: 'Manrope, sans-serif', opacity: 0.55 }}>
          scroll to zoom | drag to pan
        </div>

        <div style={{
          position: 'absolute', top: 0, left: 0,
          transformOrigin: '0 0',
          transform: `translate(${xform.tx}px,${xform.ty}px) scale(${xform.scale})`,
          width: CANVAS_W, height: CANVAS_H,
        }}>
          <svg width={CANVAS_W} height={CANVAS_H}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
          >
            <defs>
              <marker id="fmz-a" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--color-border)" />
              </marker>
              <marker id="fmz-e" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" fill="#B91C1C" />
              </marker>
              <marker id="fmz-w" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" fill="#B45309" />
              </marker>
            </defs>

            <path d={hLink(entryNodes[0], entryNodes[1])} stroke="var(--color-border)" strokeWidth="1.5" fill="none" markerEnd="url(#fmz-a)" />
            <path d={entryArc(sMain[0])} stroke="var(--color-border)" strokeWidth="1.5" fill="none" markerEnd="url(#fmz-a)" />
            <path d={entryArc(uMain[0])} stroke="var(--color-border)" strokeWidth="1.5" fill="none" markerEnd="url(#fmz-a)" />

            {sMain.slice(0, -1).map((n, i) => (
              <path key={`sm${i}`} d={hLink(n, sMain[i + 1])} stroke="var(--color-border)" strokeWidth="2" fill="none" markerEnd="url(#fmz-a)" />
            ))}
            {uMain.slice(0, -1).map((n, i) => (
              <path key={`um${i}`} d={hLink(n, uMain[i + 1])} stroke="var(--color-border)" strokeWidth="2" fill="none" markerEnd="url(#fmz-a)" />
            ))}

            {([
              [sMain[2], sFail[0]], [sMain[3], sFail[1]],
              [sMain[4], sFail[2]], [sMain[5], sFail[3]], [sMain[6], sFail[4]],
            ] as [FN, FN][]).map(([f, t], i) => (
              <path key={`sd${i}`} d={drop(f, t)} stroke="#B91C1C" strokeWidth="1" fill="none" strokeDasharray="4,3" opacity={0.38} markerEnd="url(#fmz-e)" />
            ))}
            {([
              [uMain[2], uFail[0], false], [uMain[3], uFail[1], false],
              [uMain[4], uFail[2], true],  [uMain[6], uFail[3], true],
            ] as [FN, FN, boolean][]).map(([f, t, warn], i) => (
              <path key={`ud${i}`} d={drop(f, t)} stroke={warn ? '#B45309' : '#B91C1C'} strokeWidth="1" fill="none" strokeDasharray="4,3" opacity={0.38} markerEnd={warn ? 'url(#fmz-w)' : 'url(#fmz-e)'} />
            ))}

            <path d={recArc1} stroke="#B45309" strokeWidth="1.5" fill="none" strokeDasharray="5,4" opacity={0.8} markerEnd="url(#fmz-w)" />
            <path d={recArc2} stroke="#B45309" strokeWidth="1.5" fill="none" strokeDasharray="5,4" opacity={0.8} markerEnd="url(#fmz-w)" />

            <text x={uFail[2].x + FW + 54} y={UFY - 26} style={{ fontSize: 9, fill: '#B45309', fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>user returns</text>
            <text x={uFail[3].x + FW / 2} y={UFY - 50} style={{ fontSize: 9, fill: '#B45309', fontFamily: 'Manrope, sans-serif', fontWeight: 700, textAnchor: 'middle' }}>retry step 2</text>

            <line x1={16} y1={SEP} x2={CANVAS_W - 16} y2={SEP} stroke="var(--color-border)" strokeWidth="1" opacity={0.28} />
            <text x={20} y={ENT_Y - NH / 2 - 14} style={{ fontSize: 9, fill: 'var(--color-text-secondary)', fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>ENTRY</text>
          </svg>

          {[
            { label: 'SHIELD',   top: SY - NH / 2 - 22,  color: '#3748FF' },
            { label: 'UNSHIELD', top: UY - NH / 2 - 22,  color: '#B45309' },
          ].map(({ label, top, color }) => (
            <div key={label} style={{
              position: 'absolute', left: MAIN_X, top,
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.1em', color,
              display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: 'Manrope, sans-serif',
            }}>
              <span style={{ width: 14, height: 2, background: color, display: 'inline-block', borderRadius: 1 }} />
              {label}
            </div>
          ))}

          {allNodes.map(node => {
            const w = node.small ? FW : NW
            const h = node.small ? FH : NH
            const col = COL[node.actor]
            return (
              <div key={node.id} style={{
                position: 'absolute',
                left: node.x, top: node.y - h / 2,
                width: w, height: h,
                background: FMBG[node.actor],
                border: `1px solid ${col}${node.small ? '28' : '3C'}`,
                borderRadius: 6,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 2, boxSizing: 'border-box',
                opacity: node.small ? 0.7 : 1,
                fontFamily: 'Manrope, sans-serif',
              }}>
                <span style={{
                  fontSize: node.small ? 9 : 11,
                  fontWeight: node.actor === 'system' ? 500 : 700,
                  color: 'var(--color-text-primary)',
                  textAlign: 'center', lineHeight: 1.15,
                  padding: '0 4px',
                }}>{node.label}</span>
                {node.sub && (
                  <span style={{
                    fontSize: 7.5,
                    color: node.small ? col : 'var(--color-text-secondary)',
                    textAlign: 'center', lineHeight: 1.1,
                    padding: '0 4px',
                  }}>{node.sub}</span>
                )}
                <span style={{
                  fontSize: 7, fontWeight: 800, color: col,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{FMAL[node.actor]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Static screen demo (Section 04) ─────────────────────────────────────────

function ScreenDemo({ op, phase, caption, annotation }: {
  op: OperationType; phase: OperationPhase; caption: string; annotation: string
}) {
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{caption}</span>
      </div>
      <RightPanel
        demo
        isOpen
        activeAction={op as DrawerAction}
        phase={phase}
        operationType={op}
        amount="0.50"
        recipient="0x742d35Cc6634C0532925a3b8D4C9C2C5e09c3bE4"
        publicBalance="1.24"
        shieldedBalance="0.50"
        startedAt={MOCK_START}
        txHashStep2="0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1"
        onStartShield={NOOP}
        onStartSend={NOOP}
        onStartUnshield={NOOP}
        onCancel={NOOP}
        onComplete={NOOP}
        onDone={NOOP}
        onClose={NOOP}
        onOverlayIntensity={NOOP}
      />
      <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        {annotation}
      </div>
    </div>
  )
}

// ── UX Rule card (Section 09) ────────────────────────────────────────────────

function RuleCard({ num, rule, why, correct, incorrect }: {
  num: string; rule: string; why: string; correct: string; incorrect: string
}) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-raised)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Rule {num}</div>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{rule}</p>
      </div>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Why</div>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>{why}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: '16px 20px', borderRight: '1px solid var(--color-border)', background: 'rgba(91,184,30,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Correct</div>
          <pre style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'monospace' }}>{correct}</pre>
        </div>
        <div style={{ padding: '16px 20px', background: 'rgba(185,28,28,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Incorrect</div>
          <pre style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'monospace' }}>{incorrect}</pre>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export function UseCase() {
  return (
    <div style={{ padding: '60px 72px', fontFamily: 'Manrope, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Zama · UX Design Challenge</div>
          <h1 style={{ margin: '0 0 20px', fontSize: '40px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: '640px' }}>
            Design how a human trusts a system they cannot see.
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: '580px', margin: 0 }}>
            ShieldPay moves funds from a public on-chain balance into an FHE-encrypted shielded balance. The operation is multi-step, asynchronous, and irreversible at certain points. The design challenge is not the UI - it is trust, recovery, and communication across time.
          </p>
        </div>

        {/* 01 - User Goal */}
        <UCSection id="user-goal" num="01" title="User Goal">
          {/* 2-column grid: left stacked cards + right full-height image */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '52% 48%',
            gridTemplateRows: '1fr 1fr',
            height: '476px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '40px',
          }}>
            <div style={{ padding: '24px', background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.277em', lineHeight: 1.18, marginBottom: '16px' }}>Who the User is</div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                <li>Crypto-native, basic-to-intermediate DeFi experience</li>
                <li>Understands wallets, gas fees, and transaction states</li>
                <li>Privacy-motivated - made a deliberate choice to shield</li>
                <li>Risk-sensitive - first time in a new financial system</li>
              </ul>
            </div>
            <div style={{ gridRow: '1 / 3', borderLeft: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <img src="/images/usecase-section01-photo-30671d.png" alt="User context" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ padding: '24px', background: 'var(--color-surface-raised)', borderTop: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.277em', lineHeight: 1.18, marginBottom: '8px' }}>Primary goal</div>
              <p style={{ margin: '0 0 15px', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                Move a specific amount from their public balance into a shielded balance - then use that shielded balance for a subsequent action.
              </p>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#C3B827', textTransform: 'uppercase', letterSpacing: '0.277em', lineHeight: 1.18, marginBottom: '8px' }}>Implicit goal</div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                Not lose funds, not get stuck, not need support.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#96C129', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>1.1</span>
            <h3 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>User Assumptions</h3>
          </div>

          <UCTable
            headers={['Concept', 'Assumed knowledge', 'Design implication']}
            rows={[
              ['Wallet confirmations', 'Knows how to connect and sign', 'Pre-declare each wallet interaction before popup appears'],
              ['Transaction fees', 'Knows gas exists and varies', 'Show fee estimate upfront; high-gas warning if >2x typical'],
              ['Two balances', 'Does NOT understand why', 'Explain briefly on first encounter; always label both clearly'],
              ['FHE / encryption', 'Has no concept of it', 'Never mention it. Use "shielded" as the only vocabulary'],
              ['Confirmed not done', 'Assumes confirmed = complete', 'Explicitly bridge: "confirmed on-chain, encrypting now (~1 min)"'],
              ['Intermediate Unshield state', 'Does not exist in their mental model', '"Funds not released yet" - explicit note on shielded balance decrease'],
            ]}
          />

          <div style={{ background: 'var(--color-midnight)', borderRadius: 'var(--radius-lg)', padding: '40px 28px 24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Target mental model</div>
            <blockquote style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#fff', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
              {"\"I initiated an operation. It's in progress. The system is handling it. I can check back later. My funds are safe.\""}
            </blockquote>
            <div style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
              {"Not: \"I clicked something and now I don't know if it worked.\""}
            </div>
          </div>
        </UCSection>

        {/* 02 - Flow Map */}
        <UCSection id="flow-map" num="02" title="Flow Map"
          description="Each operation is a single persistent object with phases - not a sequence of dialogs. Every phase has a defined actor and a defined answer to: what's happening, what to do, and what happens if you leave.">
          <Callout tone="info">
            <strong style={{ color: 'var(--color-text-primary)' }}>How to read this:</strong> Primary paths run left to right. Vertical dashed branches show failures and interruptions. Blue nodes are user actions. Gray nodes are system-driven - the user can leave safely. Amber nodes require action. The dashed arc on the Unshield track shows the recoverable return path from Interrupted back to Proof ready.
          </Callout>
          <FlowMap />
        </UCSection>

        {/* 03 - Interaction Model */}
        <UCSection id="interaction-model" num="03" title="Interaction Model"
          description="All financial operations live in the right panel. The left column is always the information layer. The right panel is always the action layer.">

          <Label>3-zone layout</Label>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '33px 28px 25px 25px', marginBottom: '28px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.8, overflowX: 'auto' }}>
            <pre style={{ margin: 0 }}>{'┌──────────────┬──────────────────────────────────┬─────────────────────┐\n│   '}<strong style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Sidebar</strong>{'    │   '}<strong style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Left column</strong>{'                    │   '}<strong style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Right panel</strong>{'       │\n│   Navigation │   Wallet                         │   Transaction       │\n│              │   Balance cards                  │   widget            │\n│              │   Activity feed                  │   All ops live here │\n├──────────────┴────────────────── InfoBar ────────┴─────────────────────┤\n└─────────────────────────────────────────────────────────────────────────┘'}</pre>
          </div>

          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.327em', lineHeight: 1, marginBottom: '16px', fontFamily: 'Manrope, sans-serif' }}>InfoBar - cross-page operation visibility</div>
          <ProseBlock>
            The banner persists in the layout on every route for all non-idle operation states - including in-progress, completed, failed, and cancelled. A newer operation always overrides the previous one. This means the user can initiate a transaction and walk away: when they return, the banner shows exactly what happened. Completed, failed, and cancelled states stay visible until the user explicitly dismisses them.
          </ProseBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {([
              { phase: 'processing' as OperationPhase,      op: 'shield'   as OperationType, label: 'Processing state' },
              { phase: 'finalizing' as OperationPhase,      op: 'shield'   as OperationType, label: 'Finalizing state' },
              { phase: 'proof_ready' as OperationPhase,     op: 'unshield' as OperationType, label: 'Proof ready - action required' },
              { phase: 'completed' as OperationPhase,       op: 'shield'   as OperationType, label: 'Completed while away' },
              { phase: 'failed_dropped' as OperationPhase,  op: 'shield'   as OperationType, label: 'Failed while away' },
            ]).map(({ phase, op, label }) => (
              <div key={label}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{label}</div>
                <InfoBar phase={phase} operation={op} amount="0.50" startedAt={MOCK_START} onView={NOOP} onDismiss={NOOP} />
              </div>
            ))}
          </div>
        </UCSection>

        {/* 04 - Key Screens */}
        <UCSection id="key-screens" num="04" title="Key Screens"
          description="All drawer states across the shield flow - from first wallet signature to completion and error recovery.">

          <PhaseVisualizer />

          <div style={{ marginTop: '32px' }} />

          <Label>Happy path</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px', marginBottom: '48px' }}>
            <ScreenDemo
              op="shield" phase="awaiting_wallet_step1"
              caption="Wallet Step 1 of 2"
              annotation="Pre-declares what will be approved before the wallet popup appears. Step counter sets expectations: 2 confirmations, this is the first. Left column overlaid at 50% - user must act now."
            />
            <ScreenDemo
              op="shield" phase="awaiting_wallet_step2"
              caption="Wallet Step 2 of 2"
              annotation="Second wallet signature executes the shield transfer. Step counter confirms progress. Same full-focus treatment - left column stays overlaid until user signs or cancels."
            />
            <ScreenDemo
              op="shield" phase="submitted"
              caption="Submitted"
              annotation="Transaction broadcast. Left column overlay lifts to 30%. Explicit permission to leave: the operation continues server-side. No action required from the user."
            />
            <ScreenDemo
              op="shield" phase="processing"
              caption="Processing - On-chain confirmation"
              annotation="Waiting for block confirmation (~12-36s). System is running, user is a passenger. Copy names the phase and gives an ETA. Overlay stays at 30%."
            />
            <ScreenDemo
              op="shield" phase="finalizing"
              caption="Encrypting balance (critical)"
              annotation='The trickiest state. Etherscan shows "Success" here, but the shielded balance is not ready. Copy explicitly bridges this gap. Never says "Confirmed" or "Complete" until balance is updated.'
            />
            <ScreenDemo
              op="shield" phase="completed"
              caption="Completed"
              annotation="Both balances updated. Timeline shows all four steps with timestamps. No further action needed - Done button dismisses the drawer and the InfoBar clears."
            />
          </div>

          <Label>Unshield - full flow</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px', marginBottom: '48px' }}>
            <ScreenDemo
              op="unshield" phase="awaiting_wallet_step1"
              caption="Unshield - Wallet Step 1 of 2"
              annotation="User signs to remove tokens from the shielded balance. Shielded tokens burn from this point - copy must be honest about that without triggering loss anxiety."
            />
            <ScreenDemo
              op="unshield" phase="submitted"
              caption="Unshield - Submitted"
              annotation="Transaction broadcast. User can safely leave - the proof generation runs server-side. Explicit permission to close the tab."
            />
            <ScreenDemo
              op="unshield" phase="processing"
              caption="Unshield - Generating proof"
              annotation="System generates the decryption proof (~1-2 min). Shielded tokens already burned. Copy confirms funds are secured and user can close the tab without consequence."
            />
            <ScreenDemo
              op="unshield" phase="proof_ready"
              caption="Unshield - Proof ready (action required)"
              annotation='Amber urgency. Funds are secured in an intermediate contract but not yet released. The only CTA is "Complete unshield". InfoBar on all routes drives the user back.'
            />
            <ScreenDemo
              op="unshield" phase="interrupted"
              caption="Unshield - Interrupted (returned)"
              annotation="User left during proof wait and came back. App checks proof status on load - if proof is ready, restores to this state. Recoverable, not terminal. Same amber urgency as proof_ready."
            />
            <ScreenDemo
              op="unshield" phase="awaiting_wallet_step2"
              caption="Unshield - Wallet Step 2 of 2"
              annotation="User signs to release funds to the public balance. Final wallet action. Left column overlaid at 50% - full focus until signed."
            />
            <ScreenDemo
              op="unshield" phase="finalizing"
              caption="Unshield - Releasing"
              annotation="ERC-20 transfer to public balance in progress (~30s). System running, user is a passenger. Explicit permission to leave - operation completes regardless."
            />
            <ScreenDemo
              op="unshield" phase="completed"
              caption="Unshield - Completed"
              annotation="Both balances updated. Public balance increased. Timeline shows all steps with timestamps. Done button dismisses the drawer and clears the InfoBar."
            />
          </div>

          <Label>Error states</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px' }}>
            <ScreenDemo
              op="shield" phase="failed_dropped"
              caption="Failed - dropped"
              annotation='"Your funds are safe" is the first line of every error state where funds are genuinely untouched. Error explanation and retry come after.'
            />
            <ScreenDemo
              op="shield" phase="cancelled"
              caption="Cancelled"
              annotation="Neutral tone - not an error. User chose to dismiss the wallet prompt. No funds moved, no anxiety needed. Retry CTA available without pressure."
            />
          </div>
        </UCSection>

        {/* 05 - Content Design */}
        <UCSection id="content-design" num="05" title="Content Design"
          description="Copy is the primary trust mechanism. Every state must answer three questions - and answer them in the right order.">

          <div style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
            <Label>The 3-question rule - every status state must answer:</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { n: '1', q: 'What is happening?', a: 'Named phase in plain language. Never just a spinner.' },
                { n: '2', q: 'What should I do?', a: 'Explicit required action - or explicit permission to do nothing.' },
                { n: '3', q: 'What happens if I leave?', a: '"You can close this tab" or the specific consequence of leaving. Never silence.' },
              ].map(({ n, q, a }) => (
                <div key={n} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-blue)', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>{q}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Label>Copy contrast - the Encrypting state</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Before</div>
              <code style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, display: 'block' }}>
                Transaction confirmed<br />
                [spinner]
              </code>
              <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--color-error)' }}>Fails all 3 questions. User opens Etherscan, sees "Success", refreshes, finds balance unchanged, assumes loss.</div>
            </div>
            <div style={{ background: 'rgba(91,184,30,0.04)', border: '1px solid rgba(91,184,30,0.2)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>After</div>
              <code style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, display: 'block' }}>
                Encrypting your balance<br />
                Your transaction is confirmed on-chain.<br />
                {"We're"} now encrypting your shielded<br />
                balance - ~1 min. Your funds are safe.<br />
                You can close this tab.
              </code>
            </div>
          </div>

          <Label>Vocabulary decisions</Label>
          <UCTable
            headers={['Use this', 'Not this', 'Why']}
            rows={[
              ['"Shield" / "Unshield"',     '"Encrypt" / "Decrypt"',          'Action verbs tied to the product, not to cryptography'],
              ['"Shielded balance"',         '"Private balance", "hidden balance"', 'Consistent with the verb "Shield"'],
              ['"Public balance"',           '"Regular balance", "wallet balance"', 'Explicit contrast with "shielded"'],
              ['"Network fee"',              '"Gas", "gas fee"',               'Gas is jargon. Network fee is accessible.'],
              ['"Your funds are safe"',      '(nothing - silence during errors)', 'Fund safety must be stated; never left to inference'],
              ['"Your funds are secured"',   '"Your funds are safe" (Unshield)',  '"Safe" = untouched. "Secured" = protected in intermediate state.'],
              ['"~2 minutes"',               '"A few moments", "shortly"',     'Specific times reduce anxiety. Vague times increase it.'],
              ['"You can close this tab"',   '(nothing)',                      'Explicit permission to leave prevents abandonment anxiety'],
              ['"Shield" / "Unshield" as phase labels', '"Mint cToken" / "Burn cToken"', 'Phase labels name the experience, not the on-chain mechanic. Minting is an implementation detail. Burn sounds like fund destruction mid-operation.'],
              ['Burn/mint in confirmation prose', 'Burn/mint in phase labels or status headings', '"This step removes your cETH from the shielded balance - once the proof is ready, the equivalent ETH is released." Belongs in body copy, never in a progress node label.'],
            ]}
          />

          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.327em', lineHeight: 1, marginTop: '8px', marginBottom: '16px', fontFamily: 'Manrope, sans-serif' }}>Phase label vocabulary - aligned across three surfaces</div>
          <ProseBlock>
            The same root word appears in the PhaseIndicatorVertical during the operation, the success timeline afterwards, and the Etherscan row labels in the Details tab. A user who watches "Shield" on the progress bar will see "Submitted & confirmed" in the timeline and "Shield" on the Etherscan link - the same event, named consistently.
          </ProseBlock>
          <UCTable
            headers={['Operation', 'PhaseIndicatorVertical node', 'Success timeline', 'Etherscan row label']}
            rows={[
              ['Shield',   'Authorize',  'Authorized',            'Authorization'],
              ['Shield',   'Shield',     'Submitted & confirmed', 'Shield'],
              ['Shield',   'Encrypting', 'Balance encrypted',     '-'],
              ['Unshield', 'Unshield',   'Unshield initiated',    'Unshield'],
              ['Unshield', 'Confirming', 'Confirmed on-chain',    '-'],
              ['Unshield', 'Releasing',  'Released to public balance', 'Release'],
            ]}
          />
        </UCSection>

        {/* 06 - Design System */}
        <UCSection id="design-system" num="06" title="Design System Implications"
          description="3 operation types x 13 phases = 39 possible panel states. One architecture handles all of them.">

          <Callout tone="success">
            <strong style={{ color: 'var(--color-text-primary)' }}>The scaling principle:</strong> Adding a new operation type (private swap, private staking) requires exactly two things: a new idle form and updated copy per phase. Zero new components needed.
          </Callout>

          <UCTable
            headers={['Component', 'Role', 'Rule']}
            rows={[
              ['Drawer',                 'All transaction states across all ops',          'Only one instance. Maps directly to the operation state machine.'],
              ['PhaseIndicatorVertical', 'Visual progress across named phases in Drawer',  'Never numbered steps. Phases are named after what the system does.'],
              ['InfoBar',                'Cross-page operation visibility',                'Lives in AppShell - renders on every route while an op is active.'],
              ['NavigationWarning',      'Interrupt protection during critical phases',    'Two levels: soft (processing/finalizing) and urgent (proof ready).'],
              ['BalanceCard',            'Balance display',                                'Overview: both side by side. Section pages: relevant type only.'],
              ['ActivityRow',            'Transaction history list item',                  'In-progress rows always first. proof_ready rows show Complete CTA.'],
              ['ConnectWalletCard',      'Wallet connection + EIP-712 onboarding',         '/connect route only. EIP-712 is never auto-triggered on page load.'],
            ]}
          />

          <Label>PhaseIndicatorVertical - across operation types</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px', marginBottom: '24px' }}>
            {(['shield', 'send', 'unshield'] as OperationType[]).map((op, i) => (
              <div key={op}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  {['Shield - step 2 of 4 (wallet step 2)', 'Send - step 3 of 4 (processing)', 'Unshield - step 4 of 4 (proof ready)'][i]}
                </div>
                <PhaseIndicatorVertical phases={[]} currentPhase={i + 1} operation={op} />
              </div>
            ))}
          </div>

          <Label>StatusBadge - operation states</Label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {(['processing', 'action-required', 'success', 'cancelled', 'failed'] as const).map(v => (
              <StatusBadge key={v} variant={v} />
            ))}
          </div>
        </UCSection>

        {/* 07 - Risks & Trade-offs */}
        <UCSection id="risks" num="07" title="Risks & Trade-offs"
          description="The design decisions that matter most are the ones that prevent real user harm - panic, abandonment, and misinterpreted fund states.">

          <Label>Top confusion points - ranked by likelihood x impact</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {[
              { risk: 'Shielded balance shows 0 after Etherscan says "Success"', mitigation: 'The finalizing state explicitly names this gap. Never say "Confirmed" until balance is updated.' },
              { risk: 'User closed the tab - did the operation go through?', mitigation: 'InfoBar on every route. Right panel restores from localStorage on next load.' },
              { risk: 'Shielded balance decreased but public balance unchanged (Unshield)', mitigation: '"Funds not released yet" note inline. "Your funds are secured" - never "safe" in this state.' },
              { risk: 'User abandons Unshield at proof_ready - funds stay locked', mitigation: 'Urgent NavigationWarning + amber banner on all routes + ActivityRow CTA. Three entry points.' },
              { risk: 'Second wallet popup appears with no context', mitigation: 'Step counter declared before Step 1. After Step 1 is approved, the Step 2 confirm screen appears immediately - user approves again.' },
            ].map(({ risk, mitigation }, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', background: 'rgba(185,28,28,0.03)', borderRight: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Risk</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{risk}</div>
                </div>
                <div style={{ padding: '14px 16px', background: 'rgba(91,184,30,0.03)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Mitigation</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{mitigation}</div>
                </div>
              </div>
            ))}
          </div>

          <Label>Key trade-offs</Label>
          {[
            {
              title: 'Transparency vs cognitive load',
              decision: 'Default to high-level status. Surface technical details (tx hash, block number) as optional secondary elements.',
              risk: 'Advanced users may not trust a system that hides details.',
              mitigation: '"View on Etherscan" always available. Never hidden - just deprioritized.',
            },
            {
              title: 'Persistent banner vs clean UI',
              decision: 'Accept the visual clutter. Operation visibility is more important than visual cleanliness during a financial operation.',
              risk: 'Banner fatigue - users start ignoring it.',
              mitigation: 'Pulse animation only on action-required states. Static banner for background operations.',
            },
            {
              title: 'Time estimates vs accuracy',
              decision: 'Show estimates with ~ prefix and ranges. If actual time exceeds estimate by 2x, update copy.',
              risk: 'Blockchain times are variable. A wrong estimate increases anxiety.',
              mitigation: '"Taking longer than expected - still processing. Your funds are safe." updates automatically.',
            },
          ].map(({ title, decision, risk, mitigation }) => (
            <div key={title} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Decision:</strong> {decision}<br />
                <strong style={{ color: 'var(--color-error)' }}>Risk:</strong> {risk}<br />
                <strong style={{ color: 'var(--color-success)' }}>Mitigation:</strong> {mitigation}
              </div>
            </div>
          ))}
        </UCSection>

        {/* 08 - Collaboration */}
        <UCSection id="collaboration" num="08" title="Collaboration Context"
          description="The design system scales across teams and AI-driven development because it is rule-based, not intuition-based.">

          <UCTable
            headers={['Team', 'Scope', 'Consumes']}
            rows={[
              ['Wallet',      'Connect, disconnect, signature flows',       'ConnectWalletCard, WalletConfirmStep, EIP-712 onboarding'],
              ['Transaction', 'All on-chain operations',                    'Drawer, useOperation hook, InfoBar'],
              ['Balance',     'Balance display, activity history',          'BalanceCard, ActivityRow, StatusBadge'],
              ['Onboarding',  'First-time user experience',                 'ConnectWalletCard explain modes, EIP-712 setup state'],
              ['Settings',    'Notifications, preferences',                 'Operation persistence settings'],
            ]}
          />

          <ProseBlock>
            With 3 operation types and 13 phases, there are theoretically 39 distinct Drawer states. The wrong approach is to wireframe all 39. The right approach: define the state machine once, define the Drawer component once, define the copy formula per phase. Any new operation type gets correct UI for free.
          </ProseBlock>

          <Label>AI agent component selection logic</Label>
          <div style={{ background: 'var(--color-midnight)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: '24px', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontFamily: 'monospace' }}>{`Is there an async operation in progress?
  YES → Drawer renders operation phase sub-component
        Is user action required immediately?
          YES (wallet step) → WalletConfirmView (overlay 50%)
          YES (proof ready) → ProofReadyView (overlay 50%)
          NO                → ProcessingView (overlay 30%)

Is the operation complete or failed?
  COMPLETE → SuccessView with BalanceCard delta animations
  FAILED   → FailedView (fund safety as first element)
  CANCELLED → CancelledView (neutral - not an error)

Is an operation active while user navigates?
  YES → InfoBar in AppShell
        ActivityRow in-progress entry at top of feed

Is user trying to leave during Unshield?
  processing  → soft NavigationWarning
  proof_ready → urgent NavigationWarning`}</pre>
          </div>

          <Callout tone="info">
            <strong style={{ color: 'var(--color-text-primary)' }}>Why rules matter more than wireframes for agent-driven scope:</strong> A human designer sees a processing state and knows the visual treatment intuitively. An AI agent needs explicit decision rules. This document and <InlineCode>CLAUDE.md</InlineCode> encode those rules so any agent can build correct UI without visual intuition.
          </Callout>
        </UCSection>

        {/* 09 - UX Rules */}
        <UCSection id="ux-rules" num="09" title="UX Rules (Agent-Ready)"
          description="Reusable decision rules derived from this flow. Each rule includes the constraint, the reason it exists, and a correct/incorrect example.">

          <RuleCard
            num="1"
            rule="Multi-step blockchain operations are single persistent objects - never a sequence of independent dialogs."
            why="Users cannot maintain mental context across fragmented interactions. Presenting 'Confirm transaction 1 of 3' as three separate modals means users lose track of their overall state, cannot assess progress, and are more likely to abandon. Partial completion can leave funds in an intermediate state with no clear path to recovery."
            correct={`One PhaseIndicatorVertical inside Drawer:
Auth · Confirm · Encrypt · Done

User sees one operation from start to finish.
Phase advances automatically.`}
            incorrect={`Modal: "Approve step 1" → dismissed
Modal: "Approve step 2" → dismissed
Modal: "Approve step 3" → dismissed

No persistent context. User has no idea
how many steps remain or what was done.`}
          />

          <RuleCard
            num="2"
            rule="Every operation status state must answer: (1) What is happening? (2) What should I do? (3) What happens if I leave?"
            why="Blockchain operations are asynchronous and often require users to wait without acting. Users misinterpret silence as failure. Explicitly answering 'you can close this tab' reduces abandonment. Without question 3, users either stay anxious or leave and assume the worst."
            correct={`"Your funds are being moved to your shielded balance.
This may take ~2 minutes. You can close this tab
- your balance will update automatically."`}
            incorrect={`"Transaction pending"
[spinner]

Answers none of the three questions.
User has no idea if they should wait,
act, or whether leaving is safe.`}
          />

          <RuleCard
            num="6 - FHE-specific"
            rule={'The finalizing phase (FHE encryption after on-chain confirmation) must be communicated as distinct from "transaction confirmed." Never show "Confirmed" or "Complete" until the shielded balance is actually updated.'}
            why={'Crypto users interpret "transaction confirmed" as "operation complete." In FHE-based systems, on-chain confirmation triggers an additional encryption step that takes 1-3 minutes. If the UI shows "confirmed" before the shielded balance is ready, users will try to use it, find it empty, and assume a loss.'}
            correct={`Phase label: "Encrypting your balance"

"Your transaction is confirmed on the network.
We're now applying encryption to your shielded
balance - ~1 minute. You can close this tab."`}
            incorrect={`Phase label: "Confirmed"

(shielded balance not yet updated)

User opens app, sees "Confirmed",
checks shielded balance: 0. Assumes loss.`}
          />

          <RuleCard
            num="Filter copy"
            rule={'Active filter states must communicate scope exclusivity - use "Only [Category]" not just "[Category]" when a view is narrowed.'}
            why={'A trigger label that only reads "Shielded" is ambiguous - it looks identical to a column header or a status badge. "Only Shielded" unambiguously signals that the view is a subset, that other items exist but are hidden, and that clearing the filter restores the full list. Without "Only", users may interpret a filtered empty state as a data error rather than an intentional scope restriction.'}
            correct={`Filter trigger (active): "Only Shielded"
Filter trigger (active): "Only Unshielded"
Filter trigger (default): icon only - no label

User knows immediately the view is narrowed.
Clearing the filter is understood as "show all".`}
            incorrect={`Filter trigger (active): "Shielded"

Same label as the column header and the
PrivacyBadge. User cannot tell if the table
is filtered or just labeled.`}
          />

          <RuleCard
            num="On-chain vocabulary"
            rule={'Phase labels name the user\'s experience, not the on-chain mechanism. Never use "Burn" or "Mint" as phase labels.'}
            why={'"Burn" sounds like destruction of funds. Even experienced DeFi users feel anxiety seeing it as a named phase while their transaction is in flight. "Mint" is an ERC-20 implementation detail that adds jargon without adding trust. The fact that unshielding burns the cToken and that shielding mints one is technically accurate - but it belongs in wallet confirmation prose, where it has context and is surrounded by fund-safety copy. A 4-node progress bar has neither the space nor the context to make "Burn" feel safe.'}
            correct={`PhaseIndicatorVertical: Unshield → Confirming → Releasing → Done

WalletConfirmView body copy:
"This step removes your cETH from the shielded
balance. Your cETH will be burned - once the
decryption proof is ready, the equivalent ETH
will be released to your public balance."`}
            incorrect={`PhaseIndicatorVertical: Burn cETH → Proof → Mint ETH → Done

User sees "Burn" as a named phase while their
funds are in motion. "Burn" = destruction in
most mental models. The anxiety it creates
cannot be repaired by surrounding copy.`}
          />

          <Callout tone="info">
            The full ruleset (9 rules with correct/incorrect/exceptions) is defined in <InlineCode>docs/05-ux-rules.md</InlineCode> and enforced via <InlineCode>CLAUDE.md</InlineCode>. Rules are written to be consumed by AI agents, design systems, and cross-functional teams without requiring design intuition to apply correctly.
          </Callout>
        </UCSection>

      </div>
    </div>
  )
}
