import { useState } from 'react'
import { CalibrationProvider, useCalibration, ACCENT } from '../context/CalibrationContext'
import { UseCase } from './UseCase'

function LegendDot({ kind, label }: { kind: 'section' | 'title' | 'desc'; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
      <div style={{ width: '10px', height: '2px', background: ACCENT[kind], borderRadius: '1px', flexShrink: 0 }} />
      {label}
    </div>
  )
}

function Toolbar() {
  const { getCopyText, reset } = useCalibration()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(getCopyText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 200,
      background: 'var(--color-surface-raised)',
      borderBottom: '2px solid var(--color-border)',
      padding: '10px 72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Gap Calibrator
        </span>
        <LegendDot kind="title"   label="Title gap (global)" />
        <LegendDot kind="desc"    label="Description gap (global)" />
        <LegendDot kind="section" label="Section gap" />
        <LegendDot kind="custom"  label="Sub-element gap" />
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={reset}
          style={{
            padding: '7px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          Reset
        </button>
        <button
          onClick={copy}
          style={{
            padding: '7px 16px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: copied ? '#5BB81E' : '#3748FF',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Manrope, sans-serif',
            transition: 'background 200ms ease',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? 'Copied!' : 'Copy instructions'}
        </button>
      </div>
    </div>
  )
}

export function Calibrate() {
  return (
    <CalibrationProvider>
      <div style={{ userSelect: 'none' }}>
        <Toolbar />
        <UseCase />
      </div>
    </CalibrationProvider>
  )
}
