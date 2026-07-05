import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { WebGLRenderer } from 'three'
import { useRouter } from 'next/navigation'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

// Animated dots component
function AnimatedDots() {
  const [dotCount, setDotCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4) // Cycle 0, 1, 2, 3
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return <span>{'.'.repeat(dotCount)}</span>
}

// Glitchy text component
function GlitchyText({ children }) {
  const [glitchEffect, setGlitchEffect] = useState({ scale: 1, skew: 0, opacity: 1 })
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      // Random chance to glitch (5% chance every 150ms - more rare)
      if (Math.random() < 0.05) {
        setIsGlitching(true)
        setGlitchEffect({
          scale: 1 + (Math.random() - 0.5) * 0.04, // Subtle scale distortion
          skew: (Math.random() - 0.5) * 3, // Slight skew distortion
          opacity: 0.85 + Math.random() * 0.15 // Very subtle opacity flicker
        })
        // Stop glitch after very short duration
        setTimeout(() => {
          setIsGlitching(false)
          setGlitchEffect({ scale: 1, skew: 0, opacity: 1 })
        }, 40)
      }
    }, 150)

    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <span style={{
      display: 'inline-block',
      transform: isGlitching ? `scaleX(${glitchEffect.scale}) skewX(${glitchEffect.skew}deg)` : 'none',
      opacity: glitchEffect.opacity,
      transition: 'transform 0.03s, opacity 0.03s'
    }}>
      {children}
    </span>
  )
}

// Custom hook that renders the inspection overlay UI to the DOM
export function useInspectionOverlay({
  isolated,
  objectInfo,
  exitIsolation,
  inspectionScene,
  inspectionCamera,
  inspectionObject
}) {
  const animationFrameId = useRef(null)
  const inspectionCanvas = useRef(null)
  const inspectionRenderer = useRef(null)

  // Mouse interaction state
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const rotationVelocity = useRef({ x: 0, y: 0 })
  const targetRotation = useRef({ x: 0, y: 0 })
  const initialRotation = useRef({ x: 0, y: 0 }) // Store the initial rotation from model

  useEffect(() => {
    if (!isolated || typeof window === 'undefined') return

    const container = document.createElement('div')
    container.id = 'inspection-ui-overlay'
    document.body.appendChild(container)

    // Create canvas for inspection scene
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    inspectionCanvas.current = canvas

    // Setup WebGL renderer for inspection canvas
    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    inspectionRenderer.current = renderer

    // Exit handler - exits inspection mode and tries to resume FPS mode
    const handleExit = (e) => {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }

      // Exit inspection mode FIRST so the store/camera state is consistent
      exitIsolation();

      // Best-effort: re-engage pointer lock (we're in a user gesture context).
      // If the browser refuses (e.g. too soon after a previous unlock), the
      // cursor simply stays visible and the user can click the canvas to resume.
      const mainCanvas = document.querySelector('canvas:not(#inspection-ui-overlay canvas)');
      const isMobile = window.innerWidth < 768;
      if (!isMobile && mainCanvas && typeof mainCanvas.requestPointerLock === 'function') {
        const lockPromise = mainCanvas.requestPointerLock();
        if (lockPromise && lockPromise.catch) {
          lockPromise.catch(() => { /* cursor stays visible - that's fine */ });
        }
      }
    }

    // Mouse drag handlers
    const handleMouseDown = (e) => {
      isDragging.current = true
      previousMousePosition.current = { x: e.clientX, y: e.clientY }
      rotationVelocity.current = { x: 0, y: 0 }
    }

    const handleMouseMove = (e) => {
      if (!isDragging.current) return

      const deltaX = e.clientX - previousMousePosition.current.x
      const deltaY = e.clientY - previousMousePosition.current.y

      // Update rotation based on mouse movement
      targetRotation.current.y += deltaX * 0.01
      targetRotation.current.x += deltaY * 0.01

      // Store velocity for inertia
      rotationVelocity.current.x = deltaY * 0.01
      rotationVelocity.current.y = deltaX * 0.01

      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    // Add mouse event listeners to canvas
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    // Keyboard handler for ESC/X to exit inspection
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        handleExit();
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    // Initialize target rotation from object's current rotation
    if (inspectionObject.current) {
      initialRotation.current.x = inspectionObject.current.rotation.x
      initialRotation.current.y = inspectionObject.current.rotation.y
      targetRotation.current.x = inspectionObject.current.rotation.x
      targetRotation.current.y = inspectionObject.current.rotation.y
    }

    // Animation loop for inspection canvas
    const animate = () => {
      if (!isolated || !inspectionObject.current || !inspectionScene.current || !inspectionCamera.current) {
        return
      }

      // Apply rotation with smooth interpolation
      if (isDragging.current) {
        // Direct control while dragging
        inspectionObject.current.rotation.y = targetRotation.current.y
        inspectionObject.current.rotation.x = targetRotation.current.x
      } else {
        // Check if velocity is nearly zero (stopped from inertia)
        const velocityMagnitude = Math.abs(rotationVelocity.current.y) + Math.abs(rotationVelocity.current.x)

        if (velocityMagnitude < 0.001) {
          // Apply auto-rotation when idle (only Y-axis)
          targetRotation.current.y += 0.008

          // Smoothly interpolate X rotation back to initial rotation
          const rotationDiff = initialRotation.current.x - targetRotation.current.x
          targetRotation.current.x += rotationDiff * 0.05 // Smooth lerp back to initial
        } else {
          // Apply inertia when coasting after drag
          targetRotation.current.y += rotationVelocity.current.y
          targetRotation.current.x += rotationVelocity.current.x

          // Dampen velocity for smooth stop
          rotationVelocity.current.y *= 0.95
          rotationVelocity.current.x *= 0.95
        }

        inspectionObject.current.rotation.y = targetRotation.current.y
        inspectionObject.current.rotation.x = targetRotation.current.x
      }

      // Render the scene
      renderer.render(inspectionScene.current, inspectionCamera.current)

      animationFrameId.current = requestAnimationFrame(animate)
    }

    const root = createRoot(container)

    // Clicking outside the card closes the inspection (backdrop catches the click)
    const handleBackdropMouseDown = (e) => {
      if (e.target === e.currentTarget) {
        handleExit(e);
      }
    }

    const overlay = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-auto"
        style={{ fontFamily: UI.font }}
        onMouseDown={handleBackdropMouseDown}
      >
        {/* Transparent backdrop - scene remains visible, clicks outside close the viewer */}

        {/* Lo-fi card */}
        <div
          className="relative pointer-events-auto"
          style={{
            background: UI.panel,
            border: `3px solid ${UI.border}`,
            borderRadius: '3px',
            boxShadow: UI.shadow,
            maxWidth: '1000px',
            width: '95%',
            maxHeight: '90vh'
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center justify-between px-2 md:px-3 py-1 md:py-2"
            style={{
              background: UI.panelAlt,
              borderBottom: `2px solid ${UI.border}`
            }}
          >
            <div className="flex items-center gap-1 md:gap-2">
              <div style={{ width: '10px', height: '10px', background: UI.accent, border: `1px solid ${UI.border}` }}></div>
              <span className="font-bold text-xs md:text-sm" style={{ color: UI.text, letterSpacing: '1px' }}>
                ITEM_VIEWER
              </span>
            </div>
            <button
              onClick={handleExit}
              className="font-bold"
              style={{
                width: '32px', // Larger touch target
                height: '32px',
                background: UI.panel,
                border: `2px solid ${UI.text}`,
                color: UI.text,
                fontSize: '20px',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = UI.accent; e.currentTarget.style.color = UI.accentText; e.currentTarget.style.borderColor = UI.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = UI.panel; e.currentTarget.style.color = UI.text; e.currentTarget.style.borderColor = UI.text; }}
            >
              ×
            </button>
          </div>

          {/* Content area */}
          <div className="flex flex-col md:flex-row" style={{ height: 'calc(90vh - 100px)', minHeight: '300px' }}>
            {/* 3D View - Top on mobile, Right on desktop */}
            <div
              className="relative flex-1 order-1 md:order-2"
              style={{
                background: '#000',
                border: `2px solid ${UI.border}`,
                margin: '8px',
                marginLeft: '8px',
                overflow: 'hidden',
                minHeight: '200px'
              }}
              ref={(el) => {
                if (el && canvas && !el.contains(canvas)) {
                  el.appendChild(canvas)
                  // Set canvas size
                  const rect = el.getBoundingClientRect()
                  renderer.setSize(rect.width, rect.height)
                  inspectionCamera.current.aspect = rect.width / rect.height
                  inspectionCamera.current.updateProjectionMatrix()
                  // Start animation
                  animate()
                }
              }}
            >
              {/* Green label overlay */}
              <div className="absolute top-2 left-2 text-green-400 text-xs font-bold pointer-events-none z-10" style={{ textShadow: '0 0 5px #00ff00' }}>
                <GlitchyText>[ 3D VIEWER ]</GlitchyText>
              </div>
            </div>

            {/* Description - Bottom on mobile, Left on desktop */}
            <div
              className="flex flex-col order-2 md:order-1 mx-2 md:mx-3"
              style={{
                width: '100%',
                maxWidth: '300px'
              }}
            >
              <div
                className="flex-1 p-3 md:p-4 overflow-y-auto"
                style={{
                  background: UI.panelAlt,
                  border: `2px solid ${UI.border}`,
                  fontSize: '11px',
                  lineHeight: '1.4',
                  color: UI.textDim,
                  width: '100%'
                }}
              >
                <div className="font-bold mb-2 pb-2 text-xs md:text-sm" style={{ borderBottom: `2px solid ${UI.border}`, color: UI.accent, letterSpacing: '1px' }}>
                  ▸ ITEM INFO
                </div>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                  <div>
                    <span className="font-bold" style={{ color: UI.text }}>NAME:</span><br />
                    <span style={{ color: UI.textDim }}>{objectInfo.name || 'Unknown Object'}</span>
                  </div>
                  <div>
                    <span className="font-bold" style={{ color: UI.text }}>TYPE:</span><br />
                    <span style={{ color: UI.textDim }}>{objectInfo.type || 'Mesh'}</span>
                  </div>
                  <div>
                    <span className="font-bold" style={{ color: UI.text }}>DESC:</span><br />
                    <span style={{ color: UI.textDim }}>{objectInfo.description || 'No description available.'}</span>
                  </div>
                  {objectInfo.id && (
                    <div className="mt-2 md:mt-4 pt-2" style={{ borderTop: `1px solid ${UI.border}` }}>
                      <a
                        href={`/portfolio/${objectInfo.id}`}
                        className="font-bold"
                        style={{
                          color: UI.link,
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.target.style.color = UI.accent}
                        onMouseOut={(e) => e.target.style.color = UI.link}
                      >
                        ▸ SHOW MORE
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Status bar */}
              <div
                className="mt-2 px-2 py-1 text-xs"
                style={{
                  background: UI.panelAlt,
                  border: `2px solid ${UI.border}`,
                  color: UI.textDim
                }}
              >
                <span className="font-bold" style={{ color: UI.text }}>STATUS:</span> INSPECTING<AnimatedDots />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="px-2 md:px-3 py-1 md:py-2 text-xs flex justify-between items-center"
            style={{
              background: UI.panelAlt,
              borderTop: `2px solid ${UI.border}`,
              color: UI.textDim
            }}
          >
            <span className="font-bold hidden md:inline">Press [X] or [ESC] to exit</span>
            <span className="font-bold md:hidden">Tap X to exit</span>
            <span className="font-bold" style={{ color: UI.accent }}>READY</span>
          </div>
        </div>
      </div>
    )

    root.render(overlay)

    return () => {
      // Stop animation
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }

      // Remove event listeners
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)

      // Dispose renderer
      if (inspectionRenderer.current) {
        inspectionRenderer.current.dispose()
        inspectionRenderer.current = null
      }

      // Clean up DOM
      root.unmount()
      if (container.parentNode) {
        document.body.removeChild(container)
      }
    }
  }, [isolated, objectInfo, exitIsolation, inspectionScene, inspectionCamera, inspectionObject])
}
