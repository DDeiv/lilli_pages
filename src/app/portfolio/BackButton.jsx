'use client'

import Link from 'next/link'

export function BackButton() {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <button
        style={{
          padding: '8px 16px',
          background: '#c0c0c0',
          border: '2px outset #d0d0d0',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#2d3748',
          fontFamily: 'Courier New, monospace',
        }}
        onMouseDown={(e) => {
          e.target.style.border = '2px inset #d0d0d0'
        }}
        onMouseUp={(e) => {
          e.target.style.border = '2px outset #d0d0d0'
        }}
        onMouseLeave={(e) => {
          e.target.style.border = '2px outset #d0d0d0'
        }}
      >
        ← Back to Gallery
      </button>
    </Link>
  )
}
