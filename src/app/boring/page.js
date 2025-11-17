'use client'

import Link from 'next/link'

export default function BoringPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#c0c0c0',
        fontFamily: 'Courier New, monospace',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'white',
          border: '2px solid',
          borderColor: '#808080 #ffffff #ffffff #808080',
          padding: '30px',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(to right, #000080, #1084d0)',
            color: 'white',
            padding: '8px 12px',
            marginBottom: '20px',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          Welcome to the Boring Page
        </div>

        {/* Content */}
        <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
            Portfolio - Simple Version
          </h1>

          <p style={{ marginBottom: '15px' }}>
            Welcome! This is the lightweight, fast-loading version of the portfolio
            without 3D graphics or interactive elements.
          </p>

          <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px' }}>
            About
          </h2>
          <p style={{ marginBottom: '15px' }}>
            This page is designed for users who prefer a simpler browsing experience
            or have devices with limited resources. All the same information is
            available here, just in a more traditional format.
          </p>

          <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px' }}>
            Projects
          </h2>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li style={{ marginBottom: '8px' }}>Project 1 - Description coming soon</li>
            <li style={{ marginBottom: '8px' }}>Project 2 - Description coming soon</li>
            <li style={{ marginBottom: '8px' }}>Project 3 - Description coming soon</li>
          </ul>

          <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px' }}>
            Skills
          </h2>
          <p style={{ marginBottom: '15px' }}>
            JavaScript, React, Next.js, Three.js, Web Development, UI/UX Design
          </p>

          <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px' }}>
            Contact
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Email: your.email@example.com
          </p>

          {/* Navigation button */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Link href="/">
              <button
                style={{
                  backgroundColor: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  padding: '10px 30px',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '1px 1px 0 #808080',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.borderColor = '#000000 #ffffff #ffffff #000000'
                  e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #000000'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff'
                  e.currentTarget.style.boxShadow = '1px 1px 0 #808080'
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
            backgroundColor: '#c0c0c0',
            borderTop: '2px solid',
            borderColor: '#ffffff',
            padding: '8px 12px',
            marginTop: '20px',
            fontSize: '12px',
          }}
        >
          Ready | Simple mode | Fast loading
        </div>
      </div>
    </div>
  )
}
