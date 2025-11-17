'use client'

import { useRouter } from 'next/navigation'
import { useSceneStore } from '@/store/useSceneStore'

export function SludgeLifeDialogue() {
  const router = useRouter()
  const showDialogue = useSceneStore((state) => state.showDialogue)
  const setShowDialogue = useSceneStore((state) => state.setShowDialogue)
  const setCameraLocked = useSceneStore((state) => state.setCameraLocked)

  const handleInteractiveExperience = () => {
    console.log('🎬 Interactive Experience clicked!');

    // First, hide cursor immediately (this sets up the state)
    document.body.classList.add('hide-cursor')
    console.log('🚫 Cursor hidden via body class');

    // Request pointer lock directly from the canvas (within user gesture)
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.requestPointerLock()
        .then(() => console.log('✅ Pointer lock granted from button click'))
        .catch((err) => console.log('❌ Pointer lock failed from button:', err))
    }

    // Hide dialogue
    setShowDialogue(false)
    console.log('💬 Dialogue hidden');

    // Unlock camera after a short delay
    setTimeout(() => {
      console.log('🔓 Camera unlocked');
      setCameraLocked(false)
    }, 100)
  }

  const handleExternalLink = () => {
    // Open external link in new tab
    window.open('https://www.example.com', '_blank')
  }

  if (!showDialogue) return null

  return (
    <div className="fixed inset-0 flex items-end justify-center pb-8 md:pb-16 z-50 pointer-events-none">
      <div
        className="pointer-events-auto"
        style={{
          width: '90vw',
          maxWidth: '800px',
          fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
          position: 'relative',
        }}
      >
        {/* Sludge Life inspired dialogue box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
            border: '4px solid #00ff00',
            boxShadow: '0 0 20px rgba(0,255,0,0.3), inset 0 0 30px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Noise/grain texture overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
              opacity: 0.15,
              pointerEvents: 'none',
            }}
          />

          {/* Graffiti-style header */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '3px solid #ff00ff',
              background: 'linear-gradient(90deg, rgba(255,0,255,0.2) 0%, rgba(0,255,255,0.2) 100%)',
              position: 'relative',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#00ff00',
                textShadow: '2px 2px 0 #ff00ff, 4px 4px 0 #00ffff, -1px -1px 0 #ffff00',
                letterSpacing: '2px',
                transform: 'skew(-5deg)',
              }}
            >
              YO WASSUP
            </h2>
          </div>

          {/* Content area with spray paint aesthetic */}
          <div
            style={{
              padding: '24px 28px',
              position: 'relative',
            }}
          >
            {/* Spray paint drip effect */}
            <div
              style={{
                position: 'absolute',
                top: '-3px',
                left: '20%',
                width: '3px',
                height: '30px',
                background: 'linear-gradient(180deg, #ff00ff 0%, transparent 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '-3px',
                left: '45%',
                width: '4px',
                height: '40px',
                background: 'linear-gradient(180deg, #ff00ff 0%, transparent 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '-3px',
                left: '75%',
                width: '3px',
                height: '25px',
                background: 'linear-gradient(180deg, #ff00ff 0%, transparent 100%)',
              }}
            />

            <p
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                lineHeight: '1.4',
                color: '#ffffff',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              Welcome to the gallery, homie!
            </p>
            <p
              style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                lineHeight: '1.3',
                color: '#cccccc',
              }}
            >
              What you wanna do?
            </p>

            {/* Menu options with graffiti style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleInteractiveExperience}
                style={{
                  padding: '14px 20px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#000',
                  background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
                  border: '3px solid #00ff00',
                  boxShadow: '0 0 15px rgba(0,255,0,0.4), inset 0 0 10px rgba(255,255,255,0.2)',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05) rotate(-1deg)'
                  e.target.style.boxShadow = '0 0 25px rgba(0,255,0,0.6), inset 0 0 15px rgba(255,255,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) rotate(0deg)'
                  e.target.style.boxShadow = '0 0 15px rgba(0,255,0,0.4), inset 0 0 10px rgba(255,255,255,0.2)'
                }}
              >
                <span style={{ marginRight: '10px', fontSize: '20px' }}>►</span>
                EXPLORE 3D GALLERY
              </button>

              <button
                onClick={handleExternalLink}
                style={{
                  padding: '14px 20px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#000',
                  background: 'linear-gradient(135deg, #ff00ff 0%, #cc00cc 100%)',
                  border: '3px solid #ff00ff',
                  boxShadow: '0 0 15px rgba(255,0,255,0.4), inset 0 0 10px rgba(255,255,255,0.2)',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05) rotate(1deg)'
                  e.target.style.boxShadow = '0 0 25px rgba(255,0,255,0.6), inset 0 0 15px rgba(255,255,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) rotate(0deg)'
                  e.target.style.boxShadow = '0 0 15px rgba(255,0,255,0.4), inset 0 0 10px rgba(255,255,255,0.2)'
                }}
              >
                <span style={{ marginRight: '10px', fontSize: '20px' }}>►</span>
                VISIT WEBSITE
              </button>
            </div>
          </div>

          {/* Bottom graffiti accent */}
          <div
            style={{
              height: '8px',
              background: 'linear-gradient(90deg, #00ff00 0%, #ff00ff 50%, #00ffff 100%)',
              boxShadow: '0 0 10px rgba(0,255,0,0.5)',
            }}
          />
        </div>

        {/* Floating tags/stickers */}
        <div
          style={{
            position: 'absolute',
            top: '-15px',
            right: '30px',
            background: '#ffff00',
            color: '#000',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid #000',
            transform: 'rotate(5deg)',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
          }}
        >
          NEW!
        </div>
      </div>

      <style>{`
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }
      `}</style>
    </div>
  )
}
