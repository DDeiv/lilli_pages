import { getAllItems } from '@/data/portfolioItems'
import { PortfolioCard } from './PortfolioCard'
import { BackButton } from './BackButton'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

// Disable caching for development - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PortfolioPage() {
  const portfolioItems = await getAllItems()

  return (
    <div style={{ minHeight: '100vh', background: UI.pageBg, padding: '20px' }}>
      {/* Lo-fi window */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: UI.panel,
          border: `3px solid ${UI.border}`,
          borderRadius: '3px',
          boxShadow: UI.shadow,
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            background: UI.panelAlt,
            padding: '6px 10px',
            borderBottom: `2px solid ${UI.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              background: UI.accent,
              border: `1px solid ${UI.border}`,
            }}
          />
          <span
            style={{
              color: UI.text,
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: UI.font,
              letterSpacing: '1px',
            }}
          >
            PORTFOLIO
          </span>
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: '24px',
            fontFamily: UI.font,
          }}
        >
          {/* Header */}
          <div
            style={{
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: `2px solid ${UI.border}`,
            }}
          >
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                color: UI.text,
                fontWeight: 'bold',
              }}
            >
              Portfolio
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: UI.textDim,
              }}
            >
              All projects and work samples
            </p>
          </div>

          {/* Portfolio Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {portfolioItems.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>

          {/* Back Button */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `2px solid ${UI.border}` }}>
            <BackButton />
          </div>
        </div>

        {/* Status Bar */}
        <div
          style={{
            background: UI.panelAlt,
            padding: '4px 10px',
            borderTop: `2px solid ${UI.border}`,
            fontSize: '11px',
            color: UI.textDim,
            fontWeight: 'bold',
            fontFamily: UI.font,
            letterSpacing: '1px',
          }}
        >
          {portfolioItems.length} ITEMS
        </div>
      </div>
    </div>
  )
}
