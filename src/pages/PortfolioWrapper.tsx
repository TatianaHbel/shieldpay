import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'

const BASE_URL = 'http://localhost:5173'
const MVP_URL  = `${BASE_URL}/app`

const UC_SECTIONS = [
  { id: 'user-goal',         num: '01', label: 'User Goal' },
  { id: 'flow-map',          num: '02', label: 'Flow Map' },
  { id: 'interaction-model', num: '03', label: 'Interaction Model' },
  { id: 'key-screens',       num: '04', label: 'Key Screens' },
  { id: 'content-design',    num: '05', label: 'Content Design' },
  { id: 'design-system',     num: '06', label: 'Design System' },
  { id: 'risks',             num: '07', label: 'Risks & Trade-offs' },
  { id: 'collaboration',     num: '08', label: 'Collaboration' },
  { id: 'ux-rules',          num: '09', label: 'UX Rules' },
  { id: 'how-i-did-it',      num: '10', label: 'How I did it' },
]

const DS_SECTIONS = [
  { id: 'color',                   num: '01', label: 'Color' },
  { id: 'typography',              num: '02', label: 'Typography' },
  { id: 'spacing',                 num: '03', label: 'Spacing' },
  { id: 'radius',                  num: '04', label: 'Border Radius' },
  { id: 'elevation',               num: '05', label: 'Elevation' },
  { id: 'motion',                  num: '06', label: 'Motion' },
  { id: 'button',                  num: '07', label: 'Button' },
  { id: 'text-field',              num: '08', label: 'TextField' },
  { id: 'balance-card',            num: '09', label: 'BalanceCard' },
  { id: 'right-panel',             num: '10', label: 'Drawer' },
  { id: 'phase-indicator-vertical',num: '11', label: 'PhaseIndicator' },
  { id: 'status-persistence-banner',num:'12', label: 'InfoBar' },
]

type ActiveSection = 'none' | 'use-case' | 'design-system'

function useIframeHeight(src: string) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'embed-height' && ref.current && e.source === ref.current.contentWindow) {
        setHeight(e.data.height)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [src])

  return { ref, height }
}

function AutoIframe({ src, title, iframeRef }: { src: string; title: string; iframeRef?: React.RefObject<HTMLIFrameElement | null> }) {
  const { ref, height } = useIframeHeight(src)
  const combinedRef = (el: HTMLIFrameElement | null) => {
    (ref as { current: HTMLIFrameElement | null }).current = el
    if (iframeRef) (iframeRef as { current: HTMLIFrameElement | null }).current = el
  }
  return (
    <iframe
      ref={combinedRef}
      src={src}
      title={title}
      style={{ width: '100%', border: 'none', display: 'block', height: `${height}px`, overflow: 'hidden' }}
    />
  )
}

function StripeTOC({
  active,
  ucIframeRef,
  dsIframeRef,
}: {
  active: ActiveSection
  ucIframeRef: React.RefObject<HTMLIFrameElement | null>
  dsIframeRef: React.RefObject<HTMLIFrameElement | null>
}) {
  const [visible, setVisible]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (active !== 'none') {
      const t = setTimeout(() => setVisible(true), 60)
      return () => clearTimeout(t)
    }
    setVisible(false)
    setExpanded(false)
  }, [active])

  const sendScroll = (id: string, target: 'uc' | 'ds') => {
    const iframe = target === 'uc' ? ucIframeRef.current : dsIframeRef.current
    iframe?.contentWindow?.postMessage({ type: 'scroll-to', id }, '*')
  }

  const NAV_GROUPS = [
    { id: 'uc' as const, label: 'Case Study',    sections: UC_SECTIONS },
    { id: 'ds' as const, label: 'Design System', sections: DS_SECTIONS },
  ]

  const isUcActive = active === 'use-case'
  const isDsActive = active === 'design-system'

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        position: 'fixed',
        left: 'calc(50vw + 520px + 16px)',
        top: '50%',
        width: expanded ? '160px' : '28px',
        opacity: visible ? 1 : 0,
        transform: `translateY(-50%) translateX(${visible ? '0' : '-8px'})`,
        transition: 'opacity 200ms ease, transform 200ms ease, width 220ms cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {NAV_GROUPS.map((group, gi) => {
        const groupActive = group.id === 'uc' ? isUcActive : isDsActive
        return (
          <div key={group.id} style={{ marginBottom: gi < NAV_GROUPS.length - 1 ? '16px' : 0 }}>

            {/* Group label — only visible when expanded */}
            <div style={{
              height: '18px',
              display: 'flex', alignItems: 'center',
              marginBottom: '4px',
              paddingLeft: '4px',
              overflow: 'hidden',
            }}>
              <span style={{
                fontSize: '9px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: groupActive ? '#111' : '#AAA',
                opacity: expanded ? 1 : 0,
                transition: 'opacity 180ms ease 60ms',
                whiteSpace: 'nowrap',
              }}>
                {group.label}
              </span>
            </div>

            {/* Section items */}
            {group.sections.map(s => (
              <button
                key={s.id}
                onClick={() => sendScroll(s.id, group.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  width: '100%', height: '22px',
                  padding: '0 4px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'Inter, system-ui, sans-serif',
                  borderRadius: '4px',
                  transition: 'background 100ms',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#EBEBEB')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {/* The line — always visible, morphs into number on expand */}
                <div style={{
                  flexShrink: 0,
                  width: expanded ? '16px' : '20px',
                  height: expanded ? 'auto' : '2px',
                  background: expanded ? 'transparent' : groupActive ? '#999' : '#DDD',
                  borderRadius: '1px',
                  transition: 'all 180ms ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {expanded && (
                    <span style={{
                      fontSize: '9px', fontWeight: 700,
                      color: '#CCC', fontVariantNumeric: 'tabular-nums',
                      opacity: expanded ? 1 : 0,
                      transition: 'opacity 140ms ease 80ms',
                    }}>
                      {s.num}
                    </span>
                  )}
                </div>

                {/* Label — fades in on expand */}
                <span style={{
                  fontSize: '12px', color: '#444', lineHeight: 1,
                  opacity: expanded ? 1 : 0,
                  transition: 'opacity 160ms ease 80ms',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function PortfolioWrapper() {
  const useCaseRef   = useRef<HTMLDivElement>(null)
  const designSysRef = useRef<HTMLDivElement>(null)
  const ucIframeRef  = useRef<HTMLIFrameElement>(null)
  const dsIframeRef  = useRef<HTMLIFrameElement>(null)
  const [activeSection, setActiveSection] = useState<ActiveSection>('none')

  useEffect(() => {
    const TOPBAR_H = 61
    const check = () => {
      const uc = useCaseRef.current
      const ds = designSysRef.current
      if (!uc || !ds) return
      const ucTop = uc.getBoundingClientRect().top
      const dsTop = ds.getBoundingClientRect().top
      // sidebar appears exactly when the sticky header touches the top bar
      if (dsTop <= TOPBAR_H) {
        setActiveSection('design-system')
      } else if (ucTop <= TOPBAR_H) {
        setActiveSection('use-case')
      } else {
        setActiveSection('none')
      }
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAFA',

      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#111',
    }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{
        padding: '20px 48px',
        borderBottom: '1px solid #E8E8E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FAFAFA',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <a
          href="#"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 500, color: '#555',
            textDecoration: 'none', transition: 'color 120ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#111')}
          onMouseLeave={e => (e.currentTarget.style.color = '#555')}
        >
          <ArrowLeft size={14} />
          Work
        </a>
        <span style={{ fontSize: '13px', color: '#BBB', letterSpacing: '-0.01em' }}>thebell.design</span>
      </div>

      {/* ── Hero content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '72px 48px 0' }}>

        {/* Headline */}
        <h1 style={{
          margin: '0 0 24px',
          fontSize: 'clamp(32px, 4vw, 52px)',
          fontWeight: 700,
          color: '#111',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          maxWidth: '720px',
        }}>
          Designing trust in a system users cannot see
        </h1>

        {/* Description */}
        <p style={{
          margin: '0 0 40px',
          fontSize: '17px',
          color: '#555',
          lineHeight: 1.7,
          maxWidth: '620px',
        }}>
          ShieldPay moves funds from a public blockchain balance into an FHE-encrypted
          private balance. The UX challenge is not the interface — it is communicating
          trust, recovery, and progress across an asynchronous multi-step operation
          that users cannot observe directly.
        </p>

        {/* Metadata grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, auto)',
          width: 'fit-content',
          marginBottom: '40px',
          border: '1px solid #E8E8E8',
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#fff',
        }}>
          {[
            { label: 'Role',     value: 'Senior Product Designer' },
            { label: 'Tools',    value: 'Figma · React · Claude Code' },
            { label: 'Timeline', value: '2 weeks' },
            { label: 'Type',     value: 'Prototype + Design System' },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                padding: '16px 24px',
                borderRight: i < 3 ? '1px solid #E8E8E8' : 'none',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#AAA', marginBottom: '4px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#222' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Three CTAs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '64px', flexWrap: 'wrap' }}>
          <button
            onClick={() => scrollTo(useCaseRef)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px',
              background: '#111', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#333')}
            onMouseLeave={e => (e.currentTarget.style.background = '#111')}
          >
            Case Study
          </button>
          <button
            onClick={() => scrollTo(designSysRef)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px',
              background: '#fff', color: '#111',
              border: '1px solid #E8E8E8', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#999'; e.currentTarget.style.background = '#F5F5F5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E8E8'; e.currentTarget.style.background = '#fff' }}
          >
            Design System
          </button>
          <a
            href={MVP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px',
              background: '#fff', color: '#111',
              border: '1px solid #E8E8E8', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600,
              textDecoration: 'none',
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#999'; e.currentTarget.style.background = '#F5F5F5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E8E8'; e.currentTarget.style.background = '#fff' }}
          >
            Explore live MVP
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* ── Hero screenshot ───────────────────────────────────────── */}
      <div style={{
        background: '#ECEDF5',
        borderTop: '1px solid #E8E8E8',
        borderBottom: '1px solid #E8E8E8',
      }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 48px' }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px 12px 0 0',
            marginTop: '48px',
            overflow: 'hidden',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              height: '36px',
              background: '#F5F5F5',
              borderBottom: '1px solid #E8E8E8',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: '6px',
            }}>
              {['#FF5F57', '#FFBD2E', '#28C840'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
              <div style={{
                marginLeft: '8px', flex: 1,
                background: '#EBEBEB', borderRadius: '4px',
                height: '20px', maxWidth: '320px',
                display: 'flex', alignItems: 'center', padding: '0 10px',
                fontSize: '11px', color: '#999',
              }}>
                shieldpay.netlify.app
              </div>
            </div>
            <img
              src="/images/app-connected-screenshot.png"
              alt="ShieldPay app"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>
      </div>

      {/* ── Three columns ─────────────────────────────────────────── */}
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '80px 48px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '2px',
          background: '#E8E8E8',
          border: '1px solid #E8E8E8',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {[
            {
              num: '01',
              label: 'The problem',
              text: 'Multi-step async blockchain operations break user trust. Etherscan says "Success" while the private balance is still being computed — and silence reads as loss.',
            },
            {
              num: '02',
              label: 'The approach',
              text: 'A persistent drawer-based flow with a state machine across 39 phases. Every state answers three questions: what is happening, what to do, and what happens if you leave.',
            },
            {
              num: '03',
              label: 'Agent-ready docs',
              text: '12 specification files written before a single component. The same docs that guided the design guide an AI agent to extend the product — design and code from one source of truth.',
            },
          ].map(item => (
            <div key={item.num} style={{ background: '#fff', padding: '32px 28px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#CCC', letterSpacing: '0.06em', marginBottom: '12px' }}>
                {item.num}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {item.label}
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Use Case section ─────────────────────────────────────── */}
      <div ref={useCaseRef} style={{ scrollMarginTop: '0px', marginTop: '80px', borderTop: '1px solid #E8E8E8' }}>
        <div style={{
          padding: '20px 48px',
          background: '#fff',
          borderBottom: '1px solid #E8E8E8',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'space-between',
          position: 'sticky',
          top: '61px',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#BBB' }}>
              01
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>Case Study</span>
          </div>
          <a
            href={MVP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: '#fff', color: '#111',
              border: '1px solid #E8E8E8', borderRadius: '6px',
              fontSize: '12px', fontWeight: 600,
              textDecoration: 'none', fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#999'; e.currentTarget.style.background = '#F5F5F5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E8E8'; e.currentTarget.style.background = '#fff' }}
          >
            Explore live MVP
            <ArrowUpRight size={12} />
          </a>
        </div>
        <AutoIframe
          src={`${BASE_URL}/use-case?embed`}
          title="ShieldPay Use Case"
          iframeRef={ucIframeRef}
        />
      </div>

      {/* ── Design System section ─────────────────────────────────── */}
      <div ref={designSysRef} style={{ scrollMarginTop: '0px', borderTop: '2px solid #E8E8E8' }}>
        <div style={{
          padding: '20px 48px',
          background: '#fff',
          borderBottom: '1px solid #E8E8E8',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'space-between',
          position: 'sticky',
          top: '61px',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#BBB' }}>
              02
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>Design System</span>
          </div>
          <a
            href={MVP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: '#fff', color: '#111',
              border: '1px solid #E8E8E8', borderRadius: '6px',
              fontSize: '12px', fontWeight: 600,
              textDecoration: 'none', fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#999'; e.currentTarget.style.background = '#F5F5F5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E8E8'; e.currentTarget.style.background = '#fff' }}
          >
            Explore live MVP
            <ArrowUpRight size={12} />
          </a>
        </div>
        <AutoIframe
          src={`${BASE_URL}/design-system?embed`}
          title="ShieldPay Design System"
          iframeRef={dsIframeRef}
        />
      </div>

      <StripeTOC
        active={activeSection}
        ucIframeRef={ucIframeRef}
        dsIframeRef={dsIframeRef}
      />

    </div>
  )
}
