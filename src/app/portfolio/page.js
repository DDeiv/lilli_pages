import { getAllItems } from '@/data/portfolioItems'
import { PortfolioCard } from './PortfolioCard'
import { BackButton } from './BackButton'

// Disable caching for development - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PortfolioPage() {
  const portfolioItems = await getAllItems()

  return (
    <div style={{ minHeight: '100vh', background: '#008080', padding: '20px' }}>
      {/* Windows 95 Window */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: '#c0c0c0',
          border: '2px outset #ffffff',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            background: 'linear-gradient(to right, #000080, #1084d0)',
            padding: '4px 8px',
            borderBottom: '2px solid #000',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              background: '#c0c0c0',
              border: '1px solid #000',
            }}
          />
          <span
            style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Courier New, monospace',
              textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
            }}
          >
            PORTFOLIO.EXE
          </span>
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: '24px',
            fontFamily: 'Courier New, monospace',
          }}
        >
          {/* Header */}
          <div
            style={{
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '2px solid #808080',
            }}
          >
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                color: '#000',
                fontWeight: 'bold',
              }}
            >
              Portfolio
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#4a5568',
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
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #808080' }}>
            <BackButton />
          </div>
        </div>

        {/* Status Bar */}
        <div
          style={{
            background: '#c0c0c0',
            padding: '4px 8px',
            borderTop: '2px solid #fff',
            fontSize: '11px',
            color: '#2d3748',
            fontWeight: 'bold',
            fontFamily: 'Courier New, monospace',
          }}
        >
          {portfolioItems.length} items
        </div>
      </div>
    </div>
  )
}
