'use client'

import { useState } from 'react'

export default function ImageGallery({ gallery }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!gallery || gallery.length === 0) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length)
  }

  return (
    <div
      style={{
        marginBottom: '24px',
        background: '#000',
        border: '2px inset #808080',
        padding: '16px',
      }}
    >
      {/* Image Display */}
      <div
        style={{
          position: 'relative',
          background: '#1a1a1a',
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
          }}
        >
          <div style={{ marginBottom: '8px' }}>[ IMAGE PLACEHOLDER ]</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>{gallery[currentImageIndex].url}</div>
        </div>
      </div>

      {/* Image Caption */}
      <div
        style={{
          background: '#c0c0c0',
          border: '1px solid #808080',
          padding: '8px',
          marginBottom: '12px',
          fontSize: '12px',
          color: '#2d3748',
        }}
      >
        {gallery[currentImageIndex].caption}
      </div>

      {/* Gallery Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={prevImage}
          disabled={gallery.length <= 1}
          style={{
            padding: '6px 12px',
            background: '#c0c0c0',
            border: '2px outset #d0d0d0',
            cursor: gallery.length > 1 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#2d3748',
            opacity: gallery.length <= 1 ? 0.5 : 1,
          }}
        >
          ← Prev
        </button>
        <span style={{ fontSize: '12px', color: '#c0c0c0' }}>
          {currentImageIndex + 1} / {gallery.length}
        </span>
        <button
          onClick={nextImage}
          disabled={gallery.length <= 1}
          style={{
            padding: '6px 12px',
            background: '#c0c0c0',
            border: '2px outset #d0d0d0',
            cursor: gallery.length > 1 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#2d3748',
            opacity: gallery.length <= 1 ? 0.5 : 1,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
