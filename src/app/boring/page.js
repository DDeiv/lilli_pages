'use client'

import Link from 'next/link'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

export default function BoringPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: UI.pageBg,
        fontFamily: UI.font,
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: UI.panel,
          border: `3px solid ${UI.border}`,
          borderRadius: '3px',
          boxShadow: UI.shadow,
          padding: '30px',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: UI.panelAlt,
            color: UI.text,
            padding: '8px 12px',
            marginBottom: '20px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: `2px solid ${UI.border}`,
            letterSpacing: '1px',
          }}
        >
          THE BORING PAGE
        </div>

        {/* Content */}
        <div style={{ lineHeight: '1.6', fontSize: '14px', color: UI.textDim }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px', color: UI.text }}>
            Portfolio - Simple Version
          </h1>

          <p style={{ marginBottom: '15px' }}>
            Welcome! This is the lightweight, fast-loading version of the portfolio
            without 3D graphics or interactive elements.
          </p>

          <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px', color: UI.accent, letterSpacing: '1px' }}>
            ▸ ABOUT
          </h2>
          <p style={{ marginBottom: '15px' }}>
            This page is designed for users who prefer a simpler browsing experience
            or have devices with limited resources. All the same information is
            available here, just in a more traditional format.
          </p>

          <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px', color: UI.accent, letterSpacing: '1px' }}>
            ▸ PROJECTS
          </h2>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li style={{ marginBottom: '8px' }}>Project 1 - Description coming soon</li>
            <li style={{ marginBottom: '8px' }}>Project 2 - Description coming soon</li>
            <li style={{ marginBottom: '8px' }}>Project 3 - Description coming soon</li>
          </ul>

          <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px', color: UI.accent, letterSpacing: '1px' }}>
            ▸ SKILLS
          </h2>
          <p style={{ marginBottom: '15px' }}>
            JavaScript, React, Next.js, Three.js, Web Development, UI/UX Design
          </p>

          <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px', color: UI.accent, letterSpacing: '1px' }}>
            ▸ CONTACT
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Email: your.email@example.com
          </p>

          {/* Navigation button */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Link href="/">
              <button
                style={{
                  background: UI.panelAlt,
                  border: `2px solid ${UI.text}`,
                  padding: '10px 30px',
                  cursor: 'pointer',
                  fontFamily: UI.font,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: UI.text,
                  letterSpacing: '0.5px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = UI.accent
                  e.currentTarget.style.color = UI.accentText
                  e.currentTarget.style.borderColor = UI.accent
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = UI.panelAlt
                  e.currentTarget.style.color = UI.text
                  e.currentTarget.style.borderColor = UI.text
                }}
              >
                Back to Interactive Experience
              </button>
            </Link>
          </div>
        </div>

        {/* Status Bar */}
        <div
          style={{
            background: UI.panelAlt,
            border: `2px solid ${UI.border}`,
            padding: '8px 12px',
            marginTop: '20px',
            fontSize: '12px',
            color: UI.textDim,
            letterSpacing: '1px',
          }}
        >
          READY | SIMPLE MODE | FAST LOADING
        </div>
      </div>
    </div>
  )
}
