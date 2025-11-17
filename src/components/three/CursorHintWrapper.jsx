'use client'
import { useEffect, useState } from 'react'
import { CursorHint } from './CursorManager'

// Wrapper component that displays the cursor hint (always visible)
// This listens to the body class to determine cursor visibility
export function CursorHintWrapper() {
  const [cursorVisible, setCursorVisible] = useState(false)

  useEffect(() => {
    // Monitor body class changes to sync cursor state
    const observer = new MutationObserver(() => {
      const isHidden = document.body.classList.contains('hide-cursor')
      setCursorVisible(!isHidden)
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return <CursorHint cursorVisible={cursorVisible} />
}
