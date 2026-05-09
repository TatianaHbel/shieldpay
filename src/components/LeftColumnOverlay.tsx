export interface LeftColumnOverlayProps {
  intensity: 0 | 30 | 50
}

export function LeftColumnOverlay({ intensity }: LeftColumnOverlayProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: `rgba(20, 20, 26, ${intensity / 100})`,
        pointerEvents: intensity > 0 ? 'all' : 'none',
        transition: 'background var(--duration-slower) var(--ease-in-out)',
        zIndex: 10,
      }}
    />
  )
}
