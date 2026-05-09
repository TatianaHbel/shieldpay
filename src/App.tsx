import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { DesignSystem } from './pages/DesignSystem'
import { DesignSystemCompare } from './pages/DesignSystemCompare'
import { Layers, GitCompare, Sun, Moon } from 'lucide-react'

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, () => setDark(d => !d)] as const
}

function Placeholder({ title }: { title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--text-body)',
      }}
    >
      {title} — coming soon
    </div>
  )
}

function Nav({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: 'var(--text-small)',
    fontWeight: 500,
    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    background: isActive ? 'var(--color-surface-raised)' : 'transparent',
    border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  })

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        gap: '4px',
        padding: '12px 20px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface-raised)',
      }}
    >
      <NavLink to="/" end style={linkStyle}>Overview</NavLink>
      <NavLink to="/public" style={linkStyle}>Public</NavLink>
      <NavLink to="/shielded" style={linkStyle}>Shielded</NavLink>
      <NavLink to="/explore" style={linkStyle}>Explore</NavLink>
      <div style={{ flex: 1 }} />
      <NavLink to="/design-system" style={linkStyle}>
        <Layers size={14} />
        Design System
      </NavLink>
      <NavLink to="/design-system-compare" style={linkStyle}>
        <GitCompare size={14} />
        DS Compare
      </NavLink>
      <button
        onClick={onToggle}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          background: 'transparent',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'color 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-subtle)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)'
        }}
      >
        {dark ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </nav>
  )
}

export default function App() {
  const [dark, toggleDark] = useDarkMode()

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Nav dark={dark} onToggle={toggleDark} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Placeholder title="Overview" />} />
            <Route path="/public" element={<Placeholder title="Public" />} />
            <Route path="/shielded" element={<Placeholder title="Shielded" />} />
            <Route path="/explore" element={<Placeholder title="Explore" />} />
            <Route path="/design-system" element={<DesignSystem />} />
            <Route path="/design-system-compare" element={<DesignSystemCompare />} />
            <Route path="/connect" element={<Placeholder title="Connect wallet" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
