'use client'
import { useState, useEffect } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize on first render - check screen size only
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  })

  useEffect(() => {
    const checkMobile = () => {
      // Check screen size only (easier for testing)
      const isSmallScreen = window.innerWidth <= 768

      // Only update if value actually changed
      setIsMobile(prev => {
        if (prev !== isSmallScreen) {
          return isSmallScreen
        }
        return prev
      })
    }

    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}
