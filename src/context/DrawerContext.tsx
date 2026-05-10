import { createContext, useContext, useState, useCallback } from 'react'

export type DrawerAction = 'shield' | 'send' | 'unshield' | 'receive' | 'status'

interface DrawerContextValue {
  openDrawer: (action: DrawerAction) => void
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

  const openDrawer = useCallback((action: DrawerAction) => {
    setDrawerAction(action)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return { drawerOpen, drawerAction, openDrawer, closeDrawer }
}
