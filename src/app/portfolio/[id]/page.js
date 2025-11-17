import Link from 'next/link'
import { getItemById } from '@/data/portfolioItems'
import ImageGallery from './ImageGallery'
import { ExternalLink } from './ExternalLink'
import { NavigationButtons } from './NavigationButtons'

// Disable caching for development - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PortfolioDetailPage({ params }) {
  const item = await getItemById(params.id)

  if (!item) {
    return (
      <div style={{ minHeight: '100vh', background: '#008080', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#c0c0c0', border: '2px outset #ffffff', padding: '40px', textAlign: 'center', fontFamily: 'Courier New, monospace' }}>
          <h1 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>404 - Item Not Found</h1>
          <Link href="/portfolio" style={{ color: '#0000EE', textDecoration: 'underline' }}>← Back to Portfolio</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#008080', padding: '20px' }}>
      {/* Windows 95 Window */}
      <div
        style={{
          maxWidth: '1000px',
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
            {item.name.toUpperCase()}.EXE
          </span>
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: '24px',
            fontFamily: 'Courier New, monospace',
          }}
        >
          {/* Header Section */}
          <div
            style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #808080',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '24px',
                  color: '#000',
                  fontWeight: 'bold',
                }}
              >
                {item.name}
              </h1>
              {item.showInScene && (
                <div
                  style={{
                    background: '#00aa00',
                    color: 'white',
                    fontSize: '11px',
                    padding: '4px 8px',
                    border: '1px solid #008800',
                    fontWeight: 'bold',
                  }}
                >
                  IN 3D GALLERY
                </div>
              )}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#4a5568',
                fontWeight: 'bold',
              }}
            >
              {item.type}
            </p>
          </div>

          {/* Gallery Section */}
          <ImageGallery gallery={item.gallery} />

          {/* Description Section */}
          <div
            style={{
              background: 'white',
              border: '2px inset #808080',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#2d3748',
                fontWeight: 'bold',
                paddingBottom: '8px',
                borderBottom: '1px solid #cbd5e0',
              }}
            >
              ▸ DESCRIPTION
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#4a5568',
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
              }}
            >
              {item.detailedDescription}
            </p>
          </div>

          {/* External Link */}
          {item.link && <ExternalLink link={item.link} />}

          {/* Navigation Buttons */}
          <NavigationButtons />
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
          }}
        >
          Ready
        </div>
      </div>
    </div>
  )
}
