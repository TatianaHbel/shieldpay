import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Connect } from './pages/Connect'
import { Overview } from './pages/Overview'
import { DesignSystem } from './pages/DesignSystem'
import { DesignSystemCompare } from './pages/DesignSystemCompare'
import { UseCase } from './pages/UseCase'

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
        path="/design-system"
        element={
          <AppShell publicBalance={publicBalance} shieldedBalance={shieldedBalance} hideRightPanel>
            <DesignSystem />
          </AppShell>
        }
      />
      <Route path="/design-system-compare" element={<DesignSystemCompare />} />
      <Route
        path="/use-case"
        element={
          <AppShell publicBalance={publicBalance} shieldedBalance={shieldedBalance} hideRightPanel>
            <UseCase />
          </AppShell>
        }
      />
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
