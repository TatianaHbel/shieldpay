import { Compass } from 'lucide-react'

export function Explore() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '400px',
      gap: '12px',
      padding: '32px',
      textAlign: 'center',
    }}>
      <Compass size={32} color="var(--color-text-secondary)" strokeWidth={1.5} />
      <h2 style={{ fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Coming soon
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '280px', lineHeight: 1.6 }}>
        New products and features will live here.
      </p>
    </div>
  )
}
