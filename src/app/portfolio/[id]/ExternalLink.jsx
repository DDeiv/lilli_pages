'use client'

export function ExternalLink({ link }) {
  return (
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
        }}
      >
        ▸ EXTERNAL LINK
      </h2>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#0000EE',
          fontSize: '13px',
          textDecoration: 'underline',
        }}
        onMouseOver={(e) => (e.target.style.color = '#551A8B')}
        onMouseOut={(e) => (e.target.style.color = '#0000EE')}
      >
        {link}
      </a>
    </div>
  )
}
