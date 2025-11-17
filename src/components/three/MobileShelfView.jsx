'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { useSceneStore } from '@/store/useSceneStore'

export function MobileShelfView() {
  const { camera } = useThree()
  const scrollPosition = useRef(0)
  const targetScrollPosition = useRef(0)
  const touchStartRef = useRef(null)
  const cameraLocked = useSceneStore((state) => state.cameraLocked)
  const setCameraLocked = useSceneStore((state) => state.setCameraLocked)
  const setCameraState = useSceneStore((state) => state.setCameraState)
  const savedCameraPosition = useSceneStore((state) => state.cameraPosition)
  const savedCameraRotation = useSceneStore((state) => state.cameraRotation)
  const showDialogue = useSceneStore((state) => state.showDialogue)

  useEffect(() => {
    // Only restore if there's saved position AND dialogue is hidden (user was exploring)
    if (savedCameraPosition && savedCameraRotation && !showDialogue) {
      // Restore saved camera state when returning from portfolio
      console.log('🔄 [Mobile] Restoring saved camera position');
      camera.position.set(
        savedCameraPosition.x,
        savedCameraPosition.y,
        savedCameraPosition.z
      );
      camera.rotation.order = 'YXZ';
      camera.rotation.set(
        savedCameraRotation.x,
        savedCameraRotation.y,
        0
      );

      // Restore scroll position from z position
      scrollPosition.current = savedCameraPosition.z
      targetScrollPosition.current = savedCameraPosition.z

      // Unlock camera when restoring (user was already exploring)
      console.log('🔓 [Mobile] Unlocking camera for restored state');
      setCameraLocked(false);
    } else {
      // Position camera perpendicular to continuous shelf gallery
      // Left shelf is at z=-12 (extends from -24 to 0), Right shelf is at z=12 (extends from 0 to 24)
      // Total gallery length: 48 units (from z=-24 to z=+24)
      // Start camera at the beginning of the left shelf
      camera.position.set(-8, 3, -24) // Left side of shelf, at the start of left shelf

      // Set rotation order before setting rotation
      camera.rotation.order = 'YXZ'
      camera.rotation.set(0, Math.PI / 2, 0) // Rotate 90 degrees to face right
      camera.lookAt(0.5, 3, -24) // Look directly at the start of the gallery

      // Initialize scroll position to start at the beginning
      scrollPosition.current = -24
      targetScrollPosition.current = -24
    }

    // Widen horizontal view while keeping vertical FOV the same
    // Increase aspect ratio to make the view wider horizontally
    const currentAspect = window.innerWidth / window.innerHeight
    camera.aspect = currentAspect * 1.05 // 1.5x wider horizontal view
    camera.updateProjectionMatrix() // Required after changing aspect ratio

    // Handle touch events for horizontal scrolling
    const handleTouchStart = (e) => {
      if (cameraLocked) return
      touchStartRef.current = e.touches[0].clientX
    }

    const handleTouchMove = (e) => {
      if (touchStartRef.current === null || cameraLocked) return

      const touchCurrent = e.touches[0].clientX
      const diff = touchStartRef.current - touchCurrent

      // Update target scroll position based on swipe
      targetScrollPosition.current += diff * 0.01

      touchStartRef.current = touchCurrent
    }

    const handleTouchEnd = () => {
      touchStartRef.current = null
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [camera, cameraLocked, savedCameraPosition, savedCameraRotation, showDialogue, setCameraLocked])

  // Listen for camera transition event (mobile: just unlock after short delay)
  useEffect(() => {
    const onCameraTransition = () => {
      console.log('📹 [Mobile] Camera transition event received - unlocking camera');
      setTimeout(() => {
        setCameraLocked(false);
      }, 1200);
    };

    window.addEventListener('camera-transition-to-shelves', onCameraTransition);
    return () => window.removeEventListener('camera-transition-to-shelves', onCameraTransition);
  }, [setCameraLocked]);

  // Save camera state periodically for mobile (for "back to gallery" feature)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (!cameraLocked) {
        setCameraState(
          { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          { x: camera.rotation.x, y: camera.rotation.y }
        );
      }
    }, 500); // Save every 500ms

    return () => clearInterval(saveInterval);
  }, [camera, setCameraState, cameraLocked])

  useFrame(() => {
    // Don't update camera if locked
    if (cameraLocked) return

    // Smooth interpolation for scroll position
    scrollPosition.current += (targetScrollPosition.current - scrollPosition.current) * 0.1

    // Infinite scrolling: wrap around when reaching the boundaries
    // Total gallery length is 48 units (from -24 to +24)
    // Clones are at -48 and +48, so wrap when passing those boundaries
    if (targetScrollPosition.current > 24) {
      // Scrolled past the end of right shelf, wrap to beginning of left shelf
      targetScrollPosition.current -= 48
      scrollPosition.current -= 48
    } else if (targetScrollPosition.current < -24) {
      // Scrolled past the beginning of left shelf, wrap to end of right shelf
      targetScrollPosition.current += 48
      scrollPosition.current += 48
    }

    // Move camera along Z axis (parallel to shelf) while maintaining perpendicular view
    // Keep X and Y constant, only scroll Z position
    camera.position.z = scrollPosition.current

    // Always look perpendicular at the shelf (X stays at 0.5, Y at 3, Z follows scroll)
    camera.lookAt(0.5, 3, scrollPosition.current)
  })

  return null
}
