'use client'

import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

export function ExternalLink({ link }) {
  return (
    <div
      style={{
        background: UI.panelAlt,
        border: `2px solid ${UI.border}`,
        padding: '16px',
        marginBottom: '24px',
      }}
    >
      <h2
        style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: UI.accent,
          fontWeight: 'bold',
          letterSpacing: '1px',
        }}
      >
        ▸ EXTERNAL LINK
      </h2>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: UI.link,
          fontSize: '13px',
          textDecoration: 'underline',
        }}
        onMouseOver={(e) => (e.target.style.color = UI.accent)}
        onMouseOut={(e) => (e.target.style.color = UI.link)}
      >
        {link}
      </a>
    </div>
  )
}
