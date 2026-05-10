import { createContext, useContext, useState, useCallback } from 'react'
import type { OperationPhase, OperationType } from '../types/operation'

export type DrawerAction = 'shield' | 'send' | 'unshield' | 'receive' | 'status'

export interface DrawerReplay {
  action: OperationType
  phase: OperationPhase
  amount: string
  token?: string
  txHash?: string
  recipient?: string
  startedAt?: number
}

interface DrawerContextValue {
  openDrawer: (action: DrawerAction) => void
  openDrawerReplay: (replay: DrawerReplay) => void
}

export const DrawerContext = createContext<DrawerContextValue | null>(null)

export function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawer must be used within AppShell')
  return ctx
}

export function useDrawerState() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerAction, setDrawerAction] = useState<DrawerAction>('shield')
  const [drawerReplay, setDrawerReplay] = useState<DrawerReplay | null>(null)

  const openDrawer = useCallback((action: DrawerAction) => {
    setDrawerReplay(null)
    setDrawerAction(action)
    setDrawerOpen(true)
  }, [])

  const openDrawerReplay = useCallback((replay: DrawerReplay) => {
    setDrawerReplay(replay)
    setDrawerAction(replay.action)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setDrawerReplay(null)
  }, [])

  return { drawerOpen, drawerAction, drawerReplay, openDrawer, openDrawerReplay, closeDrawer }
}
