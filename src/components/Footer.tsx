import { useState } from 'react'
import { Heart } from 'lucide-react'

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tatianahernandezbel/' },
  { label: 'GitHub', href: 'https://github.com/TatianaHbel/' },
]

export function Footer() {
  const [liked, setLiked] = useState(false)

  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      padding: 'var(--space-5) var(--space-6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 'var(--space-4)',
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 'var(--text-small)',
          fontFamily: 'var(--font-ui)',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
        }}>
          Designed + Coded with
        </span>

        <button
          onClick={() => setLiked(l => !l)}
          aria-label={liked ? 'Unlike' : 'Like'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Heart
            size={13}
            style={{
              color: liked ? '#E03D4E' : 'var(--color-text-secondary)',
              fill: liked ? '#E03D4E' : 'none',
              transition: `color var(--duration-normal) var(--ease-out), fill var(--duration-normal) var(--ease-out)`,
            }}
          />
        </button>

        <span style={{
          fontSize: 'var(--text-small)',
          fontFamily: 'var(--font-ui)',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
        }}>
          by{' '}
          <a
            href="https://thebell.design"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-blue)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          >
            Tatiana Hern&#225;ndez
          </a>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        {SOCIAL_LINKS.map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'var(--font-ui)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: `color var(--duration-fast) var(--ease-out)`,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-blue)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            {link.label}
          </a>
        ))}

        <a
          href="mailto:tati.hbel@gmail.com"
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            opacity: 0.6,
            transition: `opacity var(--duration-fast) var(--ease-out)`,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
        >
          tati.hbel@gmail.com
        </a>
      </div>

    </footer>
  )
}
