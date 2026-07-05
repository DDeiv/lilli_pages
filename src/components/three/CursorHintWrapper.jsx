'use client'
import { useEffect, useState } from 'react'
import { useSceneStore } from '@/store/useSceneStore'
import { SLUDGE } from '@/lib/theme'

const UI = SLUDGE.ui

/**
 * Contextual control hint (Windows 95 style).
 * Driven by the REAL pointer lock state - no CSS class monitoring.
 *
 * - Pointer lock OFF: tell the user to click to look around
 * - Pointer lock ON:  tell them how to inspect and how to free the cursor
 * - Hidden while the dialogue or an inspection overlay is open
 */
export function CursorHintWrapper() {
  const [pointerLocked, setPointerLocked] = useState(false)
  const showDialogue = useSceneStore((state) => state.showDialogue)
  const inspecting = useSceneStore((state) => !!state.inspectedItemId)

  useEffect(() => {
    const onLockChange = () => setPointerLocked(!!document.pointerLockElement)
    document.addEventListener('pointerlockchange', onLockChange)
    onLockChange()
    return () => document.removeEventListener('pointerlockchange', onLockChange)
  }, [])

  if (showDialogue || inspecting) return null

  const text = pointerLocked
    ? 'SCROLL TO MOVE • AIM + CLICK TO INSPECT • [ESC] FREES CURSOR'
    : 'CLICK TO LOOK AROUND • SCROLL TO MOVE'

  return (
    <div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
      style={{ fontFamily: UI.font }}
    >
      <div
        className="px-2.5 py-1"
        style={{
          background: UI.panel,
          border: `2px solid ${UI.border}`,
          borderRadius: '2px',
          boxShadow: '3px 3px 0px rgba(0,0,0,0.35)',
          color: UI.text,
          fontSize: '10px',
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2"
            style={{
              background: UI.accent,
              border: `1px solid ${UI.border}`
            }}
          ></div>
          <span>{text}</span>
        </div>
      </div>
    </div>
  )
}
