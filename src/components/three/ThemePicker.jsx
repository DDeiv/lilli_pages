'use client'
import { useState, useEffect, useCallback } from 'react'
import { SLUDGE } from '@/lib/theme'

// Keys we expose for live editing (excludes nested ui object and arrays)
const COLOR_KEYS = [
  'fog', 'wall', 'ceiling', 'shelf', 'shelfBoard', 'rail',
  'counter', 'counterTop', 'floor', 'doors', 'checkerLight', 'checkerDark',
  'concrete', 'concreteLight', 'concreteDark', 'cashierFigure',
]

const PANEL_STYLE = {
  position: 'fixed',
  top: '50%',
  left: '16px',
  transform: 'translateY(-50%)',
  zIndex: 9999,
  background: '#1a1a19',
  border: '2px solid #000',
  boxShadow: '6px 6px 0px rgba(0,0,0,0.5)',
  padding: '12px',
  fontFamily: 'Courier New, monospace',
  fontSize: '11px',
  color: '#e8e4d8',
  width: '220px',
  maxHeight: '90vh',
  overflowY: 'auto',
  userSelect: 'none',
}

export function ThemePicker({ onThemeChange }) {
  const [open, setOpen] = useState(false)
  // Local overrides on top of SLUDGE defaults
  const [colors, setColors] = useState(() => {
    const init = {}
    COLOR_KEYS.forEach(k => { init[k] = SLUDGE[k] })
    return init
  })
  const [activeKey, setActiveKey] = useState(null)
  const [copied, setCopied] = useState(false)

  // Toggle with T key (only in dev)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 't' || e.key === 'T') setOpen(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleChange = useCallback((key, value) => {
    setColors(prev => {
      const next = { ...prev, [key]: value }
      onThemeChange?.(next)
      return next
    })
  }, [onThemeChange])

  const exportTheme = useCallback(() => {
    const lines = COLOR_KEYS.map(k => `  ${k}: '${colors[k]}',`).join('\n')
    const out = `// Paste these into src/lib/theme.js → SLUDGE object\n{\n${lines}\n}`
    navigator.clipboard.writeText(out).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [colors])

  if (process.env.NODE_ENV !== 'development') return null
  if (!open) return null

  return (
    <div style={PANEL_STYLE} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottom: '1px solid #333', paddingBottom: 6 }}>
        <span style={{ color: '#d8e24a', fontWeight: 'bold', letterSpacing: 1 }}>THEME PICKER [T]</span>
        <button
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: '#e8e4d8', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
        >×</button>
      </div>

      {COLOR_KEYS.map(key => (
        <div
          key={key}
          onClick={() => setActiveKey(activeKey === key ? null : key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '3px 4px', cursor: 'pointer', borderRadius: 2,
            background: activeKey === key ? '#2a2a28' : 'transparent',
            marginBottom: 2,
          }}
        >
          <div
            style={{
              width: 18, height: 18, flexShrink: 0,
              background: colors[key],
              border: '1px solid #555',
              borderRadius: 1,
            }}
          />
          <span style={{ flex: 1, fontSize: 10, opacity: 0.85 }}>{key}</span>
          <span style={{ fontSize: 10, opacity: 0.5 }}>{colors[key]}</span>
        </div>
      ))}

      {activeKey && (
        <div style={{ marginTop: 10, borderTop: '1px solid #333', paddingTop: 8 }}>
          <div style={{ marginBottom: 4, color: '#d8e24a', fontSize: 10 }}>{activeKey}</div>
          <input
            type="color"
            value={colors[activeKey]}
            onChange={e => handleChange(activeKey, e.target.value)}
            style={{ width: '100%', height: 32, border: 'none', cursor: 'pointer', background: 'none' }}
          />
          <input
            type="text"
            value={colors[activeKey]}
            onChange={e => {
              if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) handleChange(activeKey, e.target.value)
            }}
            style={{
              marginTop: 4, width: '100%', background: '#242422', border: '1px solid #444',
              color: '#e8e4d8', fontFamily: 'Courier New, monospace', fontSize: 11,
              padding: '3px 6px', boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      <button
        onClick={exportTheme}
        style={{
          marginTop: 12, width: '100%', padding: '5px 0',
          background: copied ? '#57d996' : '#d8e24a',
          color: '#141410', fontFamily: 'Courier New, monospace',
          fontWeight: 'bold', fontSize: 11, border: 'none', cursor: 'pointer',
          letterSpacing: 1,
        }}
      >
        {copied ? 'COPIED!' : 'COPY TO CLIPBOARD'}
      </button>
      <div style={{ marginTop: 6, fontSize: 9, opacity: 0.4, textAlign: 'center' }}>
        paste into src/lib/theme.js
      </div>
    </div>
  )
}
