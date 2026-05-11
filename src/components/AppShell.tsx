import { useState, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Shield, PanelLeft, Layers, FileText } from 'lucide-react'
import { RightPanel } from './RightPanel'
import { InfoBar } from './InfoBar'
import { NavigationWarning } from './NavigationWarning'
import { LeftColumnOverlay } from './LeftColumnOverlay'
import { useOperation } from '../hooks/useOperation'
import { DrawerContext, useDrawerState } from '../context/DrawerContext'
import { Footer } from './Footer'
import type { OperationPhase } from '../types/operation'


const UC_SECTIONS = [
  { id: 'user-goal',         num: '01', label: 'User Goal & Assumptions' },
  { id: 'flow-map',          num: '02', label: 'Flow Map' },
  { id: 'interaction-model', num: '03', label: 'Interaction Model' },
  { id: 'key-screens',       num: '04', label: 'Key Screens' },
  { id: 'content-design',    num: '05', label: 'Content Design' },
  { id: 'design-system',     num: '06', label: 'Design System' },
  { id: 'risks',             num: '07', label: 'Risks & Trade-offs' },
  { id: 'collaboration',     num: '08', label: 'Collaboration' },
  { id: 'ux-rules',          num: '09', label: 'UX Rules' },
]

const DS_FOUNDATION = [
  { id: 'color',         label: 'Color' },
  { id: 'typography',    label: 'Typography' },
  { id: 'spacing',       label: 'Spacing' },
  { id: 'radius',        label: 'Border Radius' },
  { id: 'elevation',     label: 'Elevation' },
  { id: 'motion',        label: 'Motion' },
  { id: 'layout',        label: 'Layout' },
  { id: 'accessibility', label: 'Accessibility' },
]

const DS_CATEGORIES = [
  { label: 'Avatar',         items: [{ id: 'blockie', label: 'Blockie' }, { id: 'token-avatar', label: 'TokenAvatar' }] },
  { label: 'Buttons',        items: [{ id: 'button', label: 'Button' }, { id: 'action-button-row', label: 'ActionButtonRow' }] },
  { label: 'Inputs',         items: [{ id: 'text-field', label: 'TextField' }] },
  { label: 'Card',           items: [{ id: 'card', label: 'Card' }, { id: 'balance-card', label: 'BalanceCard' }, { id: 'connect-wallet-card', label: 'ConnectWalletCard' }] },
  { label: 'Notifications',  items: [{ id: 'status-persistence-banner', label: 'InfoBar' }, { id: 'navigation-warning', label: 'NavigationWarning' }, { id: 'status-badge', label: 'StatusBadge' }] },
  { label: 'Table',          items: [{ id: 'table', label: 'Table' }, { id: 'activity-row', label: 'ActivityRow' }, { id: 'token-table', label: 'TokenTable' }] },
  { label: 'Phase Indicator', items: [{ id: 'phase-indicator-vertical', label: 'PhaseIndicatorVertical' }] },
  { label: 'Drawer',         items: [{ id: 'right-panel', label: 'Drawer' }, { id: 'left-column-overlay', label: 'LeftColumnOverlay' }] },
]

const NAV_ITEMS = [
  { to: '/', label: 'Portfolio', icon: LayoutDashboard, end: true },
]


function needsNavigationWarning(phase: OperationPhase): 'soft' | 'urgent' | null {
  if (phase === 'processing' || phase === 'finalizing') return 'soft'
  if (phase === 'proof_ready') return 'urgent'
  return null
}

function isBannerPhase(phase: OperationPhase): boolean {
  return phase !== 'idle' && phase !== 'preparing'
}

interface AppShellProps {
  children: React.ReactNode
  publicBalance: string
  shieldedBalance: string
  hideRightPanel?: boolean
}

export function AppShell({ children, publicBalance, shieldedBalance, hideRightPanel }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [overlayIntensity, setOverlayIntensity] = useState<0 | 30 | 50>(0)
  const [navWarning, setNavWarning] = useState<{ urgency: 'soft' | 'urgent'; destination: string } | null>(null)
  const location = useLocation()

  const op = useOperation()
  const warningLevel = needsNavigationWarning(op.phase)
  const showBanner = isBannerPhase(op.phase)

  const { drawerOpen, drawerAction, drawerReplay, openDrawer, openDrawerReplay, closeDrawer } = useDrawerState()

  const FORM_ACTIONS = ['shield', 'send', 'unshield', 'receive'] as const
  const TERMINAL_PHASES: OperationPhase[] = ['completed', 'cancelled', 'timed_out', 'failed_submission', 'failed_dropped', 'failed_finalization']

  // When a user opens a fresh form action while a terminal-phase op is showing,
  // clear the old op so the drawer shows the form rather than the result screen.
  const handleOpenDrawer = useCallback((action: Parameters<typeof openDrawer>[0]) => {
    if ((FORM_ACTIONS as readonly string[]).includes(action) && TERMINAL_PHASES.includes(op.phase)) {
      op.reset()
    }
    openDrawer(action)
  }, [openDrawer, op, op.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNavClick = useCallback((e: React.MouseEvent, destination: string) => {
    if (!warningLevel) return
    if (location.pathname === destination) return
    e.preventDefault()
    setNavWarning({ urgency: warningLevel, destination })
  }, [warningLevel, location.pathname])

  const handleLeave = useCallback(() => setNavWarning(null), [])
  const handleStay = useCallback(() => setNavWarning(null), [])

  const isOnUseCase = location.pathname === '/use-case'
  const isOnDesignSystem = location.pathname === '/design-system'
  const sidebarWidth = collapsed ? '60px' : 'var(--layout-sidebar-width)'

  return (
    <DrawerContext.Provider value={{ openDrawer: handleOpenDrawer, openDrawerReplay }}>
      <div style={{ display: 'flex', height: '100dvh', background: 'var(--color-surface)' }}>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside style={{
          width: sidebarWidth,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-surface-raised)',
          borderRight: '1px solid var(--color-border)',
          transition: 'width 0.2s var(--ease-out)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>

          {/* Header: logo + collapse toggle */}
          <div style={{
            padding: collapsed ? '12px 10px' : '14px 12px 14px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: collapsed ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: collapsed ? '6px' : '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'var(--gradient-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Shield size={14} color="#fff" />
              </div>
              {!collapsed && (
                <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                  ShieldPay
                </span>
              )}
            </div>
            <button
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '4px', background: 'transparent', border: 'none',
                color: 'var(--color-text-secondary)', cursor: 'pointer',
                borderRadius: '6px', transition: 'color 0.15s ease, background 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <PanelLeft size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={(e) => handleNavClick(e, to)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: collapsed ? '10px' : '9px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-blue)' : 'var(--color-text-secondary)',
                  background: isActive ? 'rgba(55, 72, 255, 0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  whiteSpace: 'nowrap',
                })}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {!collapsed && label}
              </NavLink>
            ))}

            <div style={{ marginTop: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
              <NavLink
                to="/use-case"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: collapsed ? '10px' : '9px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: isActive ? 'var(--color-blue)' : 'var(--color-text-secondary)',
                  background: isActive ? 'rgba(55, 72, 255, 0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  whiteSpace: 'nowrap',
                  opacity: 0.7,
                })}
              >
                <FileText size={14} style={{ flexShrink: 0 }} />
                {!collapsed && 'Use Case'}
              </NavLink>

              {isOnUseCase && !collapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', paddingLeft: '26px', marginTop: '2px' }}>
                  {UC_SECTIONS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '6px',
                        width: '100%', padding: '4px 8px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', borderRadius: '6px',
                        fontFamily: 'inherit', transition: 'background 100ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-border)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, paddingTop: '3px', letterSpacing: '0.03em' }}>{s.num}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <NavLink
                to="/design-system"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: collapsed ? '10px' : '9px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: isActive ? 'var(--color-blue)' : 'var(--color-text-secondary)',
                  background: isActive ? 'rgba(55, 72, 255, 0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  whiteSpace: 'nowrap',
                  opacity: 0.7,
                })}
              >
                <Layers size={14} style={{ flexShrink: 0 }} />
                {!collapsed && 'Design System'}
              </NavLink>

              {isOnDesignSystem && !collapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '26px', marginTop: '4px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-border)', padding: '2px 8px 3px' }}>Foundation</div>
                  {DS_FOUNDATION.map(s => (
                    <button
                      key={s.id}
                      onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      style={{
                        display: 'flex', width: '100%', padding: '4px 8px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', borderRadius: '6px', fontFamily: 'inherit',
                        transition: 'background 100ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{s.label}</span>
                    </button>
                  ))}
                  <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
                  {DS_CATEGORIES.map(cat => (
                    <div key={cat.label}>
                      <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-border)', padding: '6px 8px 3px' }}>{cat.label}</div>
                      {cat.items.map(s => (
                        <button
                          key={s.id}
                          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                          style={{
                            display: 'flex', width: '100%', padding: '4px 8px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            textAlign: 'left', borderRadius: '6px', fontFamily: 'inherit',
                            transition: 'background 100ms ease',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* ── Main content ─────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

{showBanner && (
            <InfoBar
              phase={op.phase}
              operation={op.operationType}
              amount={op.amount}
              token={op.token}
              startedAt={op.startedAt}
              onView={() => openDrawer('status')}
              onDismiss={op.reset}
            />
          )}

          <div style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
            {children}
            <Footer />
            <LeftColumnOverlay intensity={drawerOpen ? overlayIntensity : 0} />
          </div>
        </div>

        {/* ── Drawer ──────────────────────────────────────────────── */}
        {!hideRightPanel && (
          <RightPanel
            isOpen={drawerOpen}
            onClose={closeDrawer}
            activeAction={drawerAction}
            phase={drawerReplay?.phase ?? op.phase}
            operationType={drawerReplay?.action ?? op.operationType}
            amount={drawerReplay?.amount ?? op.amount}
            recipient={drawerReplay?.recipient ?? op.recipient}
            publicBalance={publicBalance}
            shieldedBalance={shieldedBalance}
            startedAt={drawerReplay?.startedAt ?? op.startedAt}
            txHashStep1={drawerReplay?.txHashStep1 ?? op.txHashStep1}
            txHashStep2={drawerReplay?.txHashStep2 ?? op.txHashStep2}
            replayToken={drawerReplay?.token}
            onStartShield={op.startShield}
            onStartSend={op.startSend}
            onStartUnshield={op.startUnshield}
            onConfirmWalletStep={op.confirmWalletStep}
            onCancel={drawerReplay ? closeDrawer : op.cancel}
            onComplete={drawerReplay ? closeDrawer : op.completeUnshield}
            onDone={drawerReplay ? closeDrawer : op.reset}
            onOverlayIntensity={setOverlayIntensity}
          />
        )}

        {/* ── Navigation warning ───────────────────────────────────── */}
        {navWarning && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(20, 20, 26, 0.5)',
          }}>
            <NavigationWarning
              urgency={navWarning.urgency}
              onStay={handleStay}
              onLeave={handleLeave}
            />
          </div>
        )}
      </div>
    </DrawerContext.Provider>
  )
}
