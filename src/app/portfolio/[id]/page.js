import Link from 'next/link'
import { getItemById } from '@/data/portfolioItems'
import ImageGallery from './ImageGallery'
import { ExternalLink } from './ExternalLink'
import { NavigationButtons } from './NavigationButtons'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

// Disable caching for development - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PortfolioDetailPage({ params }) {
  // Next.js 16: params is a Promise and must be awaited
  const { id } = await params
  const item = await getItemById(id)

  if (!item) {
    return (
      <div style={{ minHeight: '100vh', background: UI.pageBg, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: UI.panel, border: `3px solid ${UI.border}`, boxShadow: UI.shadow, padding: '40px', textAlign: 'center', fontFamily: UI.font }}>
          <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', color: UI.text }}>404 - Item Not Found</h1>
          <Link href="/portfolio" style={{ color: UI.link, textDecoration: 'underline' }}>← Back to Portfolio</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: UI.pageBg, padding: '20px' }}>
      {/* Lo-fi window */}
      <div
        style={{
          maxWidth: '1000px',
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
            {item.name.toUpperCase()}
          </span>
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: '24px',
            fontFamily: UI.font,
          }}
        >
          {/* Header Section */}
          <div
            style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `2px solid ${UI.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '24px',
                  color: UI.text,
                  fontWeight: 'bold',
                }}
              >
                {item.name}
              </h1>
              {item.showInScene && (
                <div
                  style={{
                    background: UI.accent,
                    color: UI.accentText,
                    fontSize: '11px',
                    padding: '4px 8px',
                    border: `1px solid ${UI.border}`,
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
                color: UI.textDim,
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
                paddingBottom: '8px',
                borderBottom: `1px solid ${UI.border}`,
                letterSpacing: '1px',
              }}
            >
              ▸ DESCRIPTION
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: UI.textDim,
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
          READY
        </div>
      </div>
    </div>
  )
}
