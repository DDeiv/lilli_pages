'use client'

import Link from 'next/link'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

const buttonStyle = {
  padding: '8px 16px',
  background: UI.panelAlt,
  border: `2px solid ${UI.text}`,
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 'bold',
  color: UI.text,
  fontFamily: UI.font,
  letterSpacing: '0.5px',
}

const hover = (e, on) => {
  e.currentTarget.style.background = on ? UI.accent : UI.panelAlt
  e.currentTarget.style.color = on ? UI.accentText : UI.text
  e.currentTarget.style.borderColor = on ? UI.accent : UI.text
}

export function NavigationButtons() {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Link href="/portfolio" style={{ textDecoration: 'none' }}>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => hover(e, true)}
          onMouseLeave={(e) => hover(e, false)}
        >
          ← Back to Portfolio
        </button>
      </Link>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => hover(e, true)}
          onMouseLeave={(e) => hover(e, false)}
        >
          ← Back to 3D Gallery
        </button>
      </Link>
    </div>
  )
}
