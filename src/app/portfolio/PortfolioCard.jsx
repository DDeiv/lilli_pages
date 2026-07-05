'use client'

import Link from 'next/link'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

export function PortfolioCard({ item }) {
  return (
    <Link
      href={`/portfolio/${item.id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          background: UI.panelAlt,
          border: `2px solid ${UI.border}`,
          padding: '16px',
          cursor: 'pointer',
          transition: 'transform 0.1s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.borderColor = UI.accent
          e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = UI.border
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Item Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: '0 0 4px 0',
                fontSize: '16px',
                color: UI.text,
                fontWeight: 'bold',
              }}
            >
              {item.name}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: UI.textDim,
              }}
            >
              {item.type}
            </p>
          </div>
          {item.showInScene && (
            <div
              style={{
                background: UI.accent,
                color: UI.accentText,
                fontSize: '10px',
                padding: '3px 6px',
                border: `1px solid ${UI.border}`,
                fontWeight: 'bold',
              }}
            >
              3D
            </div>
          )}
        </div>

        {/* Description */}
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '12px',
            color: UI.textDim,
            lineHeight: '1.4',
          }}
        >
          {item.description}
        </p>

        {/* View More Link */}
        <div
          style={{
            fontSize: '11px',
            color: UI.link,
            fontWeight: 'bold',
            textDecoration: 'underline',
          }}
        >
          ▸ View Details
        </div>
      </div>
    </Link>
  )
}
