import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Connect } from './pages/Connect'
import { Overview } from './pages/Overview'
import { PublicSection } from './pages/PublicSection'
import { ShieldedSection } from './pages/ShieldedSection'
import { Explore } from './pages/Explore'
import { DesignSystem } from './pages/DesignSystem'
import { DesignSystemCompare } from './pages/DesignSystemCompare'

const MOCK_PUBLIC_BALANCE = '1.24'
const MOCK_SHIELDED_BALANCE = '0.50'

function AppWithShell({ publicBalance, shieldedBalance }: { publicBalance: string; shieldedBalance: string }) {
  const [shieldedHidden, setShieldedHidden] = useState(true)
  const toggleShielded = () => setShieldedHidden(h => !h)

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppShell publicBalance={publicBalance} shieldedBalance={shieldedBalance}>
            <Overview
              publicBalance={publicBalance}
              shieldedBalance={shieldedBalance}
              shieldedHidden={shieldedHidden}
              onToggleShielded={toggleShielded}
            />
          </AppShell>
        }
      />
      <Route
        path="/public"
        element={
          <AppShell publicBalance={publicBalance} shieldedBalance={shieldedBalance}>
            <PublicSection publicBalance={publicBalance} />
          </AppShell>
        }
      />
      <Route
        path="/shielded"
        element={
          <AppShell publicBalance={publicBalance} shieldedBalance={shieldedBalance}>
            <ShieldedSection
              shieldedBalance={shieldedBalance}
              shieldedHidden={shieldedHidden}
              onToggleShielded={toggleShielded}
            />
          </AppShell>
        }
      />
      <Route
        path="/explore"
        element={
          <AppShell publicBalance={publicBalance} shieldedBalance={shieldedBalance}>
            <Explore />
          </AppShell>
        }
      />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="/design-system-compare" element={<DesignSystemCompare />} />
    </Routes>
  )
}

export default function App() {
  const [connected, setConnected] = useState(() => localStorage.getItem('shieldpay_connected') === 'true')

  const handleConnected = () => {
    localStorage.setItem('shieldpay_connected', 'true')
    setConnected(true)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/connect"
          element={
            connected
              ? <Navigate to="/" replace />
              : <Connect onConnected={handleConnected} />
          }
        />
        <Route
          path="/design-system"
          element={<DesignSystem />}
        />
        <Route
          path="/design-system-compare"
          element={<DesignSystemCompare />}
        />
        <Route
          path="/*"
          element={
            connected
              ? <AppWithShell publicBalance={MOCK_PUBLIC_BALANCE} shieldedBalance={MOCK_SHIELDED_BALANCE} />
              : <Navigate to="/connect" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
