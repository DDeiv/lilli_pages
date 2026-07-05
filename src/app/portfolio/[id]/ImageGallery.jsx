'use client'

import { useState } from 'react'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

const navButtonStyle = (enabled) => ({
  padding: '6px 12px',
  background: UI.panelAlt,
  border: `2px solid ${enabled ? UI.text : UI.textDim}`,
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontSize: '12px',
  fontWeight: 'bold',
  color: enabled ? UI.text : UI.textDim,
  fontFamily: UI.font,
  opacity: enabled ? 1 : 0.5,
})

export default function ImageGallery({ gallery }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!gallery || gallery.length === 0) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length)
  }

  const multiple = gallery.length > 1

  return (
    <div
      style={{
        marginBottom: '24px',
        background: UI.panel,
        border: `2px solid ${UI.border}`,
        padding: '16px',
      }}
    >
      {/* Image Display */}
      <div
        style={{
          position: 'relative',
          background: '#000',
          border: `2px solid ${UI.border}`,
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
        }}
      >
        {/* Placeholder for image - will be replaced with actual images */}
        <div
          style={{
            color: '#00ff00',
            fontSize: '14px',
            textAlign: 'center',
            padding: '20px',
            fontFamily: UI.font,
          }}
        >
          <div style={{ marginBottom: '8px' }}>[ IMAGE PLACEHOLDER ]</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>{gallery[currentImageIndex].url}</div>
        </div>
      </div>

      {/* Image Caption */}
      <div
        style={{
          background: UI.panelAlt,
          border: `1px solid ${UI.border}`,
          padding: '8px',
          marginBottom: '12px',
          fontSize: '12px',
          color: UI.textDim,
        }}
      >
        {gallery[currentImageIndex].caption}
      </div>

      {/* Gallery Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={prevImage} disabled={!multiple} style={navButtonStyle(multiple)}>
          ← Prev
        </button>
        <span style={{ fontSize: '12px', color: UI.textDim, fontFamily: UI.font }}>
          {currentImageIndex + 1} / {gallery.length}
        </span>
        <button onClick={nextImage} disabled={!multiple} style={navButtonStyle(multiple)}>
          Next →
        </button>
      </div>
    </div>
  )
}
