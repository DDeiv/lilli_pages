import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { WebGLRenderer } from 'three'
import { useRouter } from 'next/navigation'

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

    // Exit handler - requests pointer lock and exits inspection mode
    const handleExit = (e) => {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      console.log('🚪 Exiting inspection mode');

      // Get the main canvas (not inspection canvas)
      const mainCanvas = document.querySelector('canvas:not(#inspection-ui-overlay canvas)');

      // Request pointer lock immediately (we're in user gesture context!)
      // Only request on desktop where pointer lock is supported/needed
      const isMobile = window.innerWidth < 768;
      if (!isMobile && mainCanvas && typeof mainCanvas.requestPointerLock === 'function') {
        console.log('🔒 Requesting pointer lock from inspection exit...');
        mainCanvas.requestPointerLock()
          .then(() => {
            console.log('✅ Pointer lock re-engaged from inspection exit!');
          })
          .catch((err) => {
            console.log('❌ Pointer lock failed from inspection exit:', err);
            console.log('💡 User can click canvas to re-engage pointer lock');
          });
      }

      // Hide cursor immediately
      document.body.classList.add('hide-cursor');
      console.log('🚫 Cursor hidden');

      // Exit inspection mode
      exitIsolation();
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
        console.log('⌨️ ESC/X pressed in inspection mode - exiting');
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

    const overlay = (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none" style={{ fontFamily: 'Courier New, monospace' }}>
        {/* No backdrop - scene remains visible */}

        {/* Retro Card */}
        <div
          className="relative pointer-events-auto bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl"
          style={{
            border: '6px outset #d0d0d0',
            boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.8), inset -2px -2px 4px rgba(0,0,0,0.3), 8px 8px 0px rgba(0,0,0,0.4)',
            maxWidth: '1000px',
            width: '95%',
            maxHeight: '90vh'
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
                OBJECT_VIEWER.EXE
              </span>
            </div>
            <button
              onClick={handleExit}
              className="font-bold text-white hover:bg-red-600 transition-colors"
              style={{
                width: '32px', // Larger touch target
                height: '32px',
                background: '#c0c0c0',
                border: '2px outset #d0d0d0',
                color: '#000',
                fontSize: '20px',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
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
                border: '3px inset #808080',
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
                  background: '#fff',
                  border: '3px inset #808080',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  color: '#4a5568',
                  width: '100%'
                }}
              >
                <div className="font-bold mb-2 pb-2 text-xs md:text-sm" style={{ borderBottom: '2px solid #cbd5e0', color: '#2d3748' }}>
                  ▸ OBJECT INFO
                </div>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                  <div>
                    <span className="font-bold" style={{ color: '#2d3748' }}>NAME:</span><br />
                    <span style={{ color: '#4a5568' }}>{objectInfo.name || 'Unknown Object'}</span>
                  </div>
                  <div>
                    <span className="font-bold" style={{ color: '#2d3748' }}>TYPE:</span><br />
                    <span style={{ color: '#4a5568' }}>{objectInfo.type || 'Mesh'}</span>
                  </div>
                  <div>
                    <span className="font-bold" style={{ color: '#2d3748' }}>DESC:</span><br />
                    <span style={{ color: '#4a5568' }}>{objectInfo.description || 'No description available.'}</span>
                  </div>
                  {objectInfo.id && (
                    <div className="mt-2 md:mt-4 pt-2" style={{ borderTop: '1px solid #cbd5e0' }}>
                      <a
                        href={`/portfolio/${objectInfo.id}`}
                        className="font-bold"
                        style={{
                          color: '#0000EE',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#551A8B'}
                        onMouseOut={(e) => e.target.style.color = '#0000EE'}
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
                  background: '#c0c0c0',
                  border: '2px inset #808080',
                  color: '#2d3748'
                }}
              >
                <span className="font-bold">STATUS:</span> INSPECTING<AnimatedDots />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="px-2 md:px-3 py-1 md:py-2 text-xs flex justify-between items-center"
            style={{
              background: '#c0c0c0',
              borderTop: '2px solid #fff',
              color: '#2d3748'
            }}
          >
            <span className="font-bold hidden md:inline">Press [X] or [ESC] to exit</span>
            <span className="font-bold md:hidden">Tap X to exit</span>
            <span className="font-bold">READY</span>
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
