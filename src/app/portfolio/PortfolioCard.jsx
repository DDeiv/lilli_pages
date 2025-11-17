'use client'

import Link from 'next/link'

export function PortfolioCard({ item }) {
  return (
    <Link
      href={`/portfolio/${item.id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          background: 'white',
          border: '2px inset #808080',
          padding: '16px',
          cursor: 'pointer',
          transition: 'transform 0.1s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '2px 2px 4px rgba(0,0,0,0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
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
                color: '#2d3748',
                fontWeight: 'bold',
              }}
            >
              {item.name}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: '#718096',
              }}
            >
              {item.type}
            </p>
          </div>
          {item.showInScene && (
            <div
              style={{
                background: '#00aa00',
                color: 'white',
                fontSize: '10px',
                padding: '3px 6px',
                border: '1px solid #008800',
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
            color: '#4a5568',
            lineHeight: '1.4',
          }}
        >
          {item.description}
        </p>

        {/* View More Link */}
        <div
          style={{
            fontSize: '11px',
            color: '#0000EE',
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
