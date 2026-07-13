'use client'

import { useRouter } from 'next/navigation'
import { useSceneStore } from '@/store/useSceneStore'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

// Shared lo-fi button style (flat, chunky, one accent on hover)
const buttonStyle = {
  padding: '10px 14px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 'bold',
  fontFamily: UI.font,
  color: UI.text,
  background: UI.panelAlt,
  border: `2px solid ${UI.text}`,
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  letterSpacing: '0.5px',
}

const buttonHover = (e, on) => {
  e.currentTarget.style.background = on ? UI.accent : UI.panelAlt
  e.currentTarget.style.color = on ? UI.accentText : UI.text
  e.currentTarget.style.borderColor = on ? UI.accent : UI.text
}

export function CashierDialogue() {
  const router = useRouter()
  const showDialogue = useSceneStore((state) => state.showDialogue)
  const setShowDialogue = useSceneStore((state) => state.setShowDialogue)
  const setCameraLocked = useSceneStore((state) => state.setCameraLocked)
  const setShowScrollBlock = useSceneStore((state) => state.setShowScrollBlock)
  const setCashierTalked = useSceneStore((state) => state.setCashierTalked)

  const handleInteractiveExperience = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    // The user has talked to the cashier: shelf items unlock from here on
    setCashierTalked(true)

    // Hide dialogue immediately
    setShowDialogue(false)

    // Force hide via DOM to ensure instant feedback on mobile
    const overlay = document.getElementById('cashier-dialogue-overlay');
    if (overlay) overlay.style.display = 'none';

    // Hide scroll block overlay
    setShowScrollBlock(false)

    // Reset "reached cashier" flag so scroll path works again
    window.dispatchEvent(new CustomEvent('reset-cashier-reached'))

    // Request pointer lock immediately (button click is a user gesture).
    // If the browser refuses, the cursor stays visible and the user can
    // click the canvas to engage FPS mode - no stuck state.
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.requestPointerLock().catch(() => {});
      }
    }

    // Trigger the camera transition (desktop: 1s turn; mobile: ~3.5s travel)
    window.dispatchEvent(new CustomEvent('camera-transition-to-shelves'))

    // Desktop: unlock after the turn completes.
    // Mobile: the transition timeline unlocks itself in its onComplete -
    // unlocking early here would let the frame loop fight the animation.
    if (!isMobile) {
      setTimeout(() => {
        setCameraLocked(false)
      }, 1200)
    }
  }

  const handleVisitWebsite = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    // Counts as talking to the cashier (persisted, so items stay unlocked
    // when the user comes back from the portfolio pages)
    setCashierTalked(true)
    // Navigate to portfolio page
    router.push('/portfolio')
  }

  if (!showDialogue) return null

  return (
    <div id="cashier-dialogue-overlay" className="fixed inset-0 flex items-end justify-center pb-8 md:pb-16 z-50 pointer-events-none">
      <div
        className="pointer-events-auto"
        style={{
          width: '90vw',
          maxWidth: '760px',
          fontFamily: UI.font,
          background: UI.panel,
          border: `3px solid ${UI.border}`,
          borderRadius: '3px',
          boxShadow: UI.shadow,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grain over the whole panel */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: UI.noise,
            opacity: 0.06,
            pointerEvents: 'none',
          }}
        />

        {/* Sticker-style name tag */}
        <div
          style={{
            position: 'absolute',
            top: '-1px',
            right: '18px',
            background: UI.accent,
            color: UI.accentText,
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 'bold',
            border: `2px solid ${UI.border}`,
            borderTop: 'none',
            transform: 'rotate(1.5deg)',
            letterSpacing: '1px',
          }}
        >
          CASHIER
        </div>

        {/* Content area */}
        <div style={{ padding: '20px 24px 14px 24px', position: 'relative' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '15px', lineHeight: '1.5', color: UI.text, fontWeight: 'bold' }}>
            Welcome.
          </p>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', lineHeight: '1.4', color: UI.textDim }}>
            What will you do?
          </p>

          {/* Menu options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={(e) => handleInteractiveExperience(e)}
              style={buttonStyle}
              onMouseEnter={(e) => buttonHover(e, true)}
              onMouseLeave={(e) => buttonHover(e, false)}
            >
              <span style={{ marginRight: '10px' }}>▸</span>
              <span>EXPLORE 3D GALLERY</span>
            </button>
            <button
              onClick={(e) => handleVisitWebsite(e)}
              style={buttonStyle}
              onMouseEnter={(e) => buttonHover(e, true)}
              onMouseLeave={(e) => buttonHover(e, false)}
            >
              <span style={{ marginRight: '10px' }}>▸</span>
              <span>VIEW ALL PROJECTS</span>
            </button>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            padding: '6px 24px',
            borderTop: `2px solid ${UI.border}`,
            background: UI.panelAlt,
            color: UI.textDim,
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            position: 'relative',
          }}
        >
          <span>READY</span>
        </div>
      </div>
    </div>
  )
}
