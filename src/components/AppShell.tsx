import { useState, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Eye, Shield, Compass, PanelLeft, Layers } from 'lucide-react'
import { RightPanel } from './RightPanel'
import { StatusPersistenceBanner } from './StatusPersistenceBanner'
import { NavigationWarning } from './NavigationWarning'
import { LeftColumnOverlay } from './LeftColumnOverlay'
import { Blockie } from './Blockie'
import { useOperation } from '../hooks/useOperation'
import { DrawerContext, useDrawerState } from '../context/DrawerContext'
import type { OperationPhase } from '../types/operation'

const MOCK_WALLET = '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/public', label: 'Public', icon: Eye, end: false },
  { to: '/shielded', label: 'Shielded', icon: Shield, end: false },
  { to: '/explore', label: 'Explore', icon: Compass, end: false },
]


function needsNavigationWarning(phase: OperationPhase): 'soft' | 'urgent' | null {
  if (phase === 'processing' || phase === 'finalizing') return 'soft'
  if (phase === 'proof_ready') return 'urgent'
  return null
}

function isBannerPhase(phase: OperationPhase): boolean {
  if (phase === 'idle' || phase === 'completed' || phase === 'cancelled' || phase === 'timed_out') return false
  if (phase.startsWith('failed_')) return false
  return true
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

  const { drawerOpen, drawerAction, openDrawer, closeDrawer } = useDrawerState()

  const handleNavClick = useCallback((e: React.MouseEvent, destination: string) => {
    if (!warningLevel) return
    if (location.pathname === destination) return
    e.preventDefault()
    setNavWarning({ urgency: warningLevel, destination })
  }, [warningLevel, location.pathname])

  const handleLeave = useCallback(() => setNavWarning(null), [])
  const handleStay = useCallback(() => setNavWarning(null), [])

  const sidebarWidth = collapsed ? '60px' : 'var(--layout-sidebar-width)'

  return (
    <DrawerContext.Provider value={{ openDrawer }}>
      <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-surface)' }}>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside style={{
          width: sidebarWidth,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-surface-raised)',
          borderRight: '1px solid var(--color-border)',
          transition: 'width 0.2s var(--ease-out)',
          overflow: 'hidden',
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
            </div>
          </nav>
        </aside>

        {/* ── Main content ─────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

          {/* Top nav: wallet pinned right */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '10px 24px',
            borderBottom: '1px solid var(--color-border)',
            gap: '10px',
            flexShrink: 0,
          }}>
            <Blockie address={MOCK_WALLET} size={7} scale={4} style={{ borderRadius: '50%' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {MOCK_WALLET.slice(0, 6)}…{MOCK_WALLET.slice(-4)}
            </span>
            <button style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: '12px', color: 'var(--color-blue)',
            }}>
              Disconnect
            </button>
          </div>

          {showBanner && (
            <StatusPersistenceBanner
              phase={op.phase}
              operation={op.operationType}
              amount={op.amount}
              startedAt={op.startedAt}
              onView={() => openDrawer('status')}
            />
          )}

          <div style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
            {children}
            <LeftColumnOverlay intensity={overlayIntensity} />
          </div>
        </div>

        {/* ── Drawer ──────────────────────────────────────────────── */}
        {!hideRightPanel && (
          <RightPanel
            isOpen={drawerOpen}
            onClose={closeDrawer}
            activeAction={drawerAction}
            phase={op.phase}
            operationType={op.operationType}
            amount={op.amount}
            recipient={op.recipient}
            publicBalance={publicBalance}
            shieldedBalance={shieldedBalance}
            startedAt={op.startedAt}
            txHash={op.txHash}
            onStartShield={op.startShield}
            onStartSend={op.startSend}
            onStartUnshield={op.startUnshield}
            onCancel={op.cancel}
            onComplete={op.completeUnshield}
            onDone={op.reset}
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
