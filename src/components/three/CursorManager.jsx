import { useEffect, useState } from 'react'
import { useSceneStore } from '@/store/useSceneStore'

// Custom hook to manage cursor visibility
export function useCursorManager(isolated) {
  const [cursorVisible, setCursorVisible] = useState(false)
  const showDialogue = useSceneStore((state) => state.showDialogue)

  // Single effect to manage cursor visibility
  useEffect(() => {
    const shouldShowCursor = showDialogue || isolated || cursorVisible;

    if (shouldShowCursor) {
      console.log('👁️ CursorManager: SHOWING cursor (dialogue:', showDialogue, 'isolated:', isolated, 'manual:', cursorVisible, ')');
      document.body.classList.remove('hide-cursor')
      // Add a data attribute to indicate cursor is manually visible
      if (cursorVisible) {
        document.body.setAttribute('data-cursor-manual', 'true')
      }
      // Exit pointer lock when cursor should be visible
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } else if (showDialogue === false && !isolated && !cursorVisible) {
      // When dialogue is closed and not in inspection mode, don't interfere
      // Let camera controls handle cursor visibility
      console.log('⏸️ CursorManager: Dialogue closed - letting camera controls handle cursor');
      return;
    } else {
      console.log('🚫 CursorManager: HIDING cursor (dialogue:', showDialogue, 'isolated:', isolated, 'manual:', cursorVisible, ')');
      document.body.classList.add('hide-cursor')
      // Remove manual cursor flag when hiding
      document.body.removeAttribute('data-cursor-manual')
    }
  }, [showDialogue, isolated, cursorVisible])

  // Handle keyboard toggle (X/ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'x' || e.key === 'X' || e.key === 'Escape') && !isolated && !showDialogue) {
        console.log('⌨️ X/ESC pressed - toggling cursor visibility');
        e.preventDefault(); // Prevent browser default ESC behavior
        setCursorVisible(prev => {
          console.log('⌨️ Cursor was:', prev, '→ now:', !prev);
          return !prev;
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isolated, showDialogue])

  return { cursorVisible }
}

// Component to display cursor toggle hint (always visible)
export function CursorHint({ cursorVisible }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
      style={{
        fontFamily: 'Courier New, monospace'
      }}
    >
      <div
        className="px-2 py-1"
        style={{
          background: 'linear-gradient(to bottom, #c0c0c0, #808080)',
          border: '2px outset #d0d0d0',
          boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.8), inset -1px -1px 0px rgba(0,0,0,0.5), 2px 2px 0px rgba(0,0,0,0.3)',
          color: '#000',
          fontSize: '10px',
          fontWeight: 'bold'
        }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 bg-black"
            style={{
              border: '1px solid #000',
              boxShadow: 'inset 0px 0px 2px rgba(255,255,255,0.5)'
            }}
          ></div>
          <span>
            {cursorVisible ? 'CURSOR: ON' : 'CURSOR: OFF'} - [X]/[ESC] to toggle
          </span>
        </div>
      </div>
    </div>
  )
}
