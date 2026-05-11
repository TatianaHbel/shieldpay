import { createContext, useContext, useState, useRef, type ReactNode } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTIONS = [
  { num: '01', title: 'User Goal' },
  { num: '02', title: 'Flow Map' },
  { num: '03', title: 'Interaction Model' },
  { num: '04', title: 'Key Screens' },
  { num: '05', title: 'Content Design' },
  { num: '06', title: 'Design System' },
  { num: '07', title: 'Risks & Trade-offs' },
  { num: '08', title: 'Collaboration Context' },
  { num: '09', title: 'UX Rules (Agent-Ready)' },
]

export const DEFAULT_SECTION_GAPS = [120, 136, 140, 184, 136, 100, 132, 136]
export const DEFAULT_SECTION_GAP  = 100
export const DEFAULT_TITLE_GAP    = 40
export const DEFAULT_DESC_GAP     = 92
const SNAP = 4

export const CUSTOM_GAPS: Record<string, { label: string; defaultPx: number; copyLabel: string }> = {
  's01-user-assumptions': { label: 'card -> 1.1',             defaultPx: 80,  copyLabel: 'S01: card -> 1.1 User Assumptions' },
  's03-infobar':          { label: '3-zone -> InfoBar',       defaultPx: 160, copyLabel: 'S03: 3-zone layout -> InfoBar heading' },
  's04-happy-path':       { label: 'visualizer -> Happy',     defaultPx: 116, copyLabel: 'S04: PhaseVisualizer -> Happy path' },
  's04-unshield':         { label: 'Happy -> Unshield',       defaultPx: 120, copyLabel: 'S04: Happy path -> Unshield full flow' },
  's04-errors':           { label: 'Unshield -> Errors',      defaultPx: 164, copyLabel: 'S04: Unshield full flow -> Error states' },
  's05-vocabulary':       { label: 'contrast -> Vocabulary',  defaultPx: 136, copyLabel: 'S05: Copy contrast grid -> Vocabulary decisions' },
  's05-phase-label':      { label: 'Vocabulary -> Phase label', defaultPx: 116, copyLabel: 'S05: Vocabulary table -> Phase label heading' },
  's06-ds-implications':  { label: 'DSBento -> 6.1',          defaultPx: 124, copyLabel: 'S06: DSBento -> 6.1 Design System Implications' },
  's03-infobar-below':    { label: 'InfoBar header -> prose', defaultPx: 68,  copyLabel: 'S03: InfoBar heading -> prose text' },
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type DragTarget =
  | { kind: 'section'; index: number }
  | { kind: 'title' }
  | { kind: 'desc' }
  | { kind: 'custom'; key: string }

export const ACCENT: Record<DragTarget['kind'], string> = {
  section: '#3748FF',
  title:   '#B45309',
  desc:    '#6B6C80',
  custom:  '#7C3AED',
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CalibrationCtx {
  active: boolean
  sectionGaps: number[]
  titleGap: number
  descGap: number
  customGaps: Record<string, number>
  activeDrag: DragTarget | null
  startDrag: (target: DragTarget, startVal: number, e: React.MouseEvent) => void
  getCopyText: () => string
  reset: () => void
}

const defaultCustomGaps = Object.fromEntries(
  Object.entries(CUSTOM_GAPS).map(([k, v]) => [k, v.defaultPx])
)

const CalibrationContext = createContext<CalibrationCtx>({
  active: false,
  sectionGaps: [...DEFAULT_SECTION_GAPS],
  titleGap: DEFAULT_TITLE_GAP,
  descGap: DEFAULT_DESC_GAP,
  customGaps: defaultCustomGaps,
  activeDrag: null,
  startDrag: () => {},
  getCopyText: () => '',
  reset: () => {},
})

export function useCalibration() {
  return useContext(CalibrationContext)
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function CalibrationProvider({ children }: { children: ReactNode }) {
  const [sectionGaps, setSectionGaps] = useState<number[]>([...DEFAULT_SECTION_GAPS])
  const [titleGap, setTitleGap]   = useState(DEFAULT_TITLE_GAP)
  const [descGap, setDescGap]     = useState(DEFAULT_DESC_GAP)
  const [customGaps, setCustomGaps] = useState<Record<string, number>>(
    () => ({ ...defaultCustomGaps })
  )
  const [activeDrag, setActiveDrag] = useState<DragTarget | null>(null)

  const dragState = useRef<{
    target: DragTarget
    startY: number
    startVal: number
  } | null>(null)

  const startDrag = (target: DragTarget, startVal: number, e: React.MouseEvent) => {
    e.preventDefault()
    dragState.current = { target, startY: e.clientY, startVal }
    setActiveDrag(target)

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragState.current) return
      const { target: t, startY, startVal: sv } = dragState.current
      const snapped = Math.max(8, Math.round((sv + ev.clientY - startY) / SNAP) * SNAP)

      if (t.kind === 'section') {
        setSectionGaps(prev => { const n = [...prev]; n[t.index] = snapped; return n })
      } else if (t.kind === 'title') {
        setTitleGap(snapped)
      } else if (t.kind === 'desc') {
        setDescGap(snapped)
      } else {
        setCustomGaps(prev => ({ ...prev, [t.key]: snapped }))
      }
    }

    const onMouseUp = () => {
      dragState.current = null
      setActiveDrag(null)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const getCopyText = () => {
    const sectionLines = sectionGaps.map((gap, i) =>
      `  - ${SECTIONS[i].num} ${SECTIONS[i].title} -> ${SECTIONS[i + 1].num} ${SECTIONS[i + 1].title}: ${gap}px`
    )
    const customLines = Object.entries(CUSTOM_GAPS).map(([key, { copyLabel }]) =>
      `  - ${copyLabel}: ${customGaps[key]}px`
    )
    return [
      'Set UseCase section gaps (marginBottom on each UCSection):',
      ...sectionLines,
      '',
      'Set UCSection inner gaps (edit UCSection component directly):',
      `  - Title -> description gap (header div marginBottom): ${titleGap}px`,
      `  - Description -> content gap (description <p> margin-bottom): ${descGap}px`,
      '',
      'Set section-specific gaps:',
      ...customLines,
    ].join('\n')
  }

  const reset = () => {
    setSectionGaps([...DEFAULT_SECTION_GAPS])
    setTitleGap(DEFAULT_TITLE_GAP)
    setDescGap(DEFAULT_DESC_GAP)
    setCustomGaps(defaultCustomGaps)
  }

  return (
    <CalibrationContext.Provider value={{
      active: true,
      sectionGaps, titleGap, descGap, customGaps, activeDrag,
      startDrag, getCopyText, reset,
    }}>
      {children}
    </CalibrationContext.Provider>
  )
}

// ── Drag active check ─────────────────────────────────────────────────────────

function isDragActive(active: DragTarget | null, target: DragTarget): boolean {
  if (!active || active.kind !== target.kind) return false
  if (active.kind === 'section' && target.kind === 'section') return active.index === target.index
  if (active.kind === 'custom'  && target.kind === 'custom')  return active.key   === target.key
  return true
}

// ── Inline drag handle ────────────────────────────────────────────────────────

export function CalibrationHandle({ target, label }: { target: DragTarget; label: string }) {
  const { sectionGaps, titleGap, descGap, customGaps, activeDrag, startDrag } = useCalibration()

  const value =
    target.kind === 'section' ? sectionGaps[target.index]
    : target.kind === 'title'  ? titleGap
    : target.kind === 'desc'   ? descGap
    : (customGaps[target.key] ?? CUSTOM_GAPS[target.key]?.defaultPx ?? 8)

  const on    = isDragActive(activeDrag, target)
  const color = ACCENT[target.kind]

  return (
    <div
      onMouseDown={(e) => startDrag(target, value, e)}
      style={{
        height: `${value}px`,
        minHeight: '20px',
        cursor: 'ns-resize',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '50%',
        height: on ? '2px' : '1px',
        background: on ? color : `${color}50`,
        transform: 'translateY(-50%)',
        transition: 'height 80ms, background 80ms',
      }} />
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px',
        background: on ? color : '#fff',
        border: `1px solid ${on ? color : `${color}70`}`,
        borderRadius: '99px',
        fontSize: '11px', fontWeight: 700,
        color: on ? '#fff' : color,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.04em',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
        transition: 'all 80ms',
      }}>
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M4 1v10M1 3l3-3 3 3M1 9l3 3 3-3"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {label} {value}px
      </div>
    </div>
  )
}

// ── Spacer — renders plain div on /use-case, handle on /calibrate ─────────────

export function CalibrationSpacer({
  defaultPx,
  target,
  label,
}: {
  defaultPx: number
  target: DragTarget
  label: string
}) {
  const { active } = useCalibration()
  if (!active) return <div style={{ height: `${defaultPx}px` }} />
  return <CalibrationHandle target={target} label={label} />
}
