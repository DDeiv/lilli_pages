'use client'

import { useRouter } from 'next/navigation'
import { useSceneStore } from '@/store/useSceneStore'

export function CashierDialogue() {
  const router = useRouter()
  const showDialogue = useSceneStore((state) => state.showDialogue)
  const setShowDialogue = useSceneStore((state) => state.setShowDialogue)
  const setCameraLocked = useSceneStore((state) => state.setCameraLocked)
  const setShowScrollBlock = useSceneStore((state) => state.setShowScrollBlock)

  const handleInteractiveExperience = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    console.log('🎬 Interactive Experience clicked!');

    // Hide dialogue immediately
    setShowDialogue(false)

    // Force hide via DOM to ensure instant feedback on mobile
    const overlay = document.getElementById('cashier-dialogue-overlay');
    if (overlay) overlay.style.display = 'none';

    console.log('💬 Dialogue hidden');

    // Hide scroll block overlay
    setShowScrollBlock(false)
    console.log('✅ Scroll block overlay hidden');

    // Reset "reached cashier" flag so scroll path works again
    window.dispatchEvent(new CustomEvent('reset-cashier-reached'))
    console.log('🔄 Resetting cashier reached flag');

    // Request pointer lock immediately (button click is a user gesture!)
    // Only on desktop
    const isMobile = window.innerWidth < 768; // Simple check or use hook if available
    if (!isMobile) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        console.log('🔒 Requesting pointer lock from button click...');
        canvas.requestPointerLock()
          .then(() => {
            console.log('✅ Pointer lock engaged immediately!');
          })
          .catch((err) => {
            console.log('❌ Pointer lock failed:', err);
          });
      }
    }

    // Hide cursor immediately
    if (!isMobile) {
      document.body.classList.add('hide-cursor');
      console.log('🚫 Cursor hidden');
    }

    // Trigger camera rotation (90° left, 1 second)
    console.log('📹 Triggering camera rotation');
    window.dispatchEvent(new CustomEvent('camera-transition-to-shelves'))

    // Unlock camera after rotation completes (1.2 seconds)
    setTimeout(() => {
      console.log('🔓 Camera unlocked after rotation - mouse look now active!');
      setCameraLocked(false)
    }, 1200)
  }

  const handleVisitWebsite = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    // Navigate to portfolio page
    router.push('/portfolio')
  }

  if (!showDialogue) return null

  return (
    <div id="cashier-dialogue-overlay" className="fixed inset-0 flex items-end justify-center pb-8 md:pb-16 z-50 pointer-events-none">
      <div
        className="pointer-events-auto bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl"
        style={{
          width: '90vw',
          maxWidth: '800px',
          fontFamily: 'Courier New, monospace',
          border: '6px outset #d0d0d0',
          boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.8), inset -2px -2px 4px rgba(0,0,0,0.3), 8px 8px 0px rgba(0,0,0,0.4)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-2 md:px-3 py-1 md:py-2"
          style={{
            background: 'linear-gradient(to right, #000080, #1084d0)',
            borderBottom: '2px solid #000'
          }}
        >
          <div className="flex items-center gap-1 md:gap-2">
            <div style={{ width: '12px', height: '12px', background: '#c0c0c0', border: '1px solid #000' }} className="md:w-4 md:h-4"></div>
            <span className="text-white font-bold text-xs md:text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
              DIALOGUE.EXE
            </span>
          </div>
        </div>

        {/* Content area */}
        <div
          style={{
            background: '#fff',
            border: '3px inset #808080',
            margin: '8px',
            padding: '16px 20px',
          }}
        >
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5', color: '#2d3748', fontWeight: 'bold' }}>
            ▸ Welcome!
          </p>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', lineHeight: '1.4', color: '#4a5568' }}>
            What will you do?
          </p>

          {/* Menu options */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={(e) => handleInteractiveExperience(e)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                background: '#c0c0c0',
                border: '2px outset #d0d0d0',
                fontWeight: 'bold',
                textAlign: 'left',
              }}
            >
              <span style={{ marginRight: '8px' }}>▸</span>
              <span>EXPLORE 3D GALLERY</span>
            </button>
            <button
              onClick={(e) => handleVisitWebsite(e)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                background: '#c0c0c0',
                border: '2px outset #d0d0d0',
                fontWeight: 'bold',
                textAlign: 'left',
              }}
            >
              <span style={{ marginRight: '8px' }}>▸</span>
              <span>VIEW ALL PROJECTS</span>
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="px-2 md:px-3 py-1 text-xs"
          style={{
            background: '#c0c0c0',
            borderTop: '2px solid #fff',
            color: '#2d3748',
            fontWeight: 'bold',
          }}
        >
          <span>READY</span>
        </div>
      </div>
    </div>
  )
}
