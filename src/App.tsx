import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Overview } from './pages/Overview'
import { DesignSystem } from './pages/DesignSystem'
import { UseCase } from './pages/UseCase'
import { Calibrate } from './pages/Calibrate'
import { PortfolioWrapper } from './pages/PortfolioWrapper'

const MOCK_PUBLIC_BALANCE = '2.50'
const MOCK_SHIELDED_BALANCE = '0.50'
const MOCK_WALLET = '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'

export default function App() {
  const [shieldedHidden, setShieldedHidden] = useState(false)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/use-case" replace />} />
        <Route path="/portfolio-preview" element={<PortfolioWrapper />} />
        <Route path="/connect" element={<Navigate to="/use-case" replace />} />
        <Route
          path="/app"
          element={
            <AppShell publicBalance={MOCK_PUBLIC_BALANCE} shieldedBalance={MOCK_SHIELDED_BALANCE}>
              <Overview
                publicBalance={MOCK_PUBLIC_BALANCE}
                shieldedBalance={MOCK_SHIELDED_BALANCE}
                shieldedHidden={shieldedHidden}
                onToggleShielded={() => setShieldedHidden(h => !h)}
                walletAddress={MOCK_WALLET}
              />
            </AppShell>
          }
        />
        <Route
          path="/design-system"
          element={
            <AppShell publicBalance={MOCK_PUBLIC_BALANCE} shieldedBalance={MOCK_SHIELDED_BALANCE} hideRightPanel>
              <DesignSystem />
            </AppShell>
          }
        />
        <Route
          path="/use-case"
          element={
            <AppShell publicBalance={MOCK_PUBLIC_BALANCE} shieldedBalance={MOCK_SHIELDED_BALANCE} hideRightPanel>
              <UseCase />
            </AppShell>
          }
        />
        <Route
          path="/calibrate"
          element={
            <AppShell publicBalance={MOCK_PUBLIC_BALANCE} shieldedBalance={MOCK_SHIELDED_BALANCE} hideRightPanel>
              <Calibrate />
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
