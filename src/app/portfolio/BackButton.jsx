'use client'

import Link from 'next/link'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

export function BackButton() {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <button
        style={{
          padding: '8px 16px',
          background: UI.panelAlt,
          border: `2px solid ${UI.text}`,
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 'bold',
          color: UI.text,
          fontFamily: UI.font,
          letterSpacing: '0.5px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = UI.accent
          e.currentTarget.style.color = UI.accentText
          e.currentTarget.style.borderColor = UI.accent
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = UI.panelAlt
          e.currentTarget.style.color = UI.text
          e.currentTarget.style.borderColor = UI.text
        }}
      >
        ← Back to Gallery
      </button>
    </Link>
  )
}
