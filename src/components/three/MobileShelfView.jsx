'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { useSceneStore } from '@/store/useSceneStore'
import gsap from 'gsap'

export function MobileShelfView({ active = true }) {
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
  const setShowDialogue = useSceneStore((state) => state.setShowDialogue)

  // Track if we have initialized the camera for this session
  const isInitialized = useRef(false)

  // Reset initialization when component becomes inactive
  useEffect(() => {
    if (!active) {
      isInitialized.current = false;
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;

    // Skip if already initialized to prevent loop
    if (isInitialized.current) return;

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
      isInitialized.current = true; // Mark as initialized after restoring
    } else if (showDialogue) {
      // Start at Cashier position (like desktop) ONLY if dialogue is showing
      console.log('🎬 [Mobile] Starting at Cashier position');
      camera.position.set(-4.41, 2.50, 21.57);
      camera.lookAt(-7, 3, 21.6);

      // Show dialogue
      setShowDialogue(true);
      setCameraLocked(true);

      // Initialize scroll position to start at the beginning (for when we transition)
      scrollPosition.current = -20
      targetScrollPosition.current = -20
      isInitialized.current = true; // Mark as initialized after setting cashier position
    }

    // Fit shelves vertically in mobile view
    // The shelves are about 3 units high (y=0 to y=3)
    // We need to adjust the FOV or distance to make them fit perfectly
    // Default FOV is 55
    camera.fov = 75; // Increase FOV to see full vertical shelf height
    camera.updateProjectionMatrix();

    // Handle touch events for horizontal scrolling
    const handleTouchStart = (e) => {
      if (cameraLocked || !active) return
      touchStartRef.current = e.touches[0].clientX
    }

    const handleTouchMove = (e) => {
      if (touchStartRef.current === null || cameraLocked || !active) return

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
  }, [camera, cameraLocked, savedCameraPosition, savedCameraRotation, showDialogue, setCameraLocked, active, setShowDialogue])

  // Listen for camera transition event (mobile: animate to shelves)
  useEffect(() => {
    if (!active) return;
    const onCameraTransition = () => {
      console.log('📹 [Mobile] Camera transition event received - animating to shelves');

      // 1. First, animate moving BACKWARDS from cashier (simulating walking away)
      const tl = gsap.timeline({
        onComplete: () => {
          console.log('✅ [Mobile] Transition complete - unlocking controls');
          setCameraLocked(false);
        }
      });

      // Current position (Cashier): -4.41, 2.50, 21.57
      // Target position (Shelves Start): -12, 3, -24 (Moved back to see full shelf)

      // Step 1: Move back and turn slightly
      tl.to(camera.position, {
        x: -6,
        y: 2.5,
        z: 15,
        duration: 1.5,
        ease: "power2.inOut"
      });

      // Step 2: Rapid move to shelf start position (simulating a cut or fast travel)
      tl.to(camera.position, {
        x: -12, // Moved further back from -8
        y: 2.5, // Match new lower camera height
        z: -20, // Start at the first shelf unit
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          // During movement, keep looking at a point ahead
          // We need to manually update rotation because we're not using controls
          // But since we're just moving position, we can let the lookAt logic handle it at the end
        }
      }, "-=0.5");

      // Animate rotation separately to ensure smooth turn
      // We need to animate the quaternion or Euler angles
      const startRotation = camera.rotation.clone();
      const targetRotation = { y: Math.PI / 2 }; // Facing right (towards shelves)

      // We'll use a dummy object to animate rotation
      const rotationObj = { y: startRotation.y };

      tl.to(rotationObj, {
        y: Math.PI / 2,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.rotation.y = rotationObj.y;
          camera.rotation.x = 0; // Level out pitch
          camera.rotation.z = 0;
        }
      }, "<"); // Run in parallel with position move

    };

    window.addEventListener('camera-transition-to-shelves', onCameraTransition);
    return () => window.removeEventListener('camera-transition-to-shelves', onCameraTransition);
  }, [setCameraLocked, active, camera]);

  // Save camera state periodically for mobile (for "back to gallery" feature)
  useEffect(() => {
    if (!active) return;
    const saveInterval = setInterval(() => {
      if (!cameraLocked) {
        setCameraState(
          { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          { x: camera.rotation.x, y: camera.rotation.y }
        );
      }
    }, 500); // Save every 500ms

    return () => clearInterval(saveInterval);
  }, [camera, setCameraState, cameraLocked, active])

  useFrame(() => {
    if (!active) return;
    // Don't update camera if locked
    if (cameraLocked) return

    // Smooth interpolation for scroll position
    scrollPosition.current += (targetScrollPosition.current - scrollPosition.current) * 0.1

    // Infinite scrolling: wrap around when reaching the boundaries
    // Total gallery length is approx 40 units (5 shelves * 8 spacing)
    // Range from -20 to +20
    if (targetScrollPosition.current > 20) {
      // Scrolled past the end of right shelf, wrap to beginning of left shelf
      targetScrollPosition.current -= 40
      scrollPosition.current -= 40
    } else if (targetScrollPosition.current < -20) {
      // Scrolled past the beginning of left shelf, wrap to end of right shelf
      targetScrollPosition.current += 40
      scrollPosition.current += 40
    }

    // Move camera along Z axis (parallel to shelf) while maintaining perpendicular view
    // Keep X and Y constant, only scroll Z position
    camera.position.x = -12; // Enforce optimized distance
    camera.position.y = 2.5;   // Lower camera slightly to view from side/below, not top
    camera.position.z = scrollPosition.current

    // Always look perpendicular at the shelf (X stays at 0.5, Y at 3, Z follows scroll)
    camera.lookAt(0.5, 3, scrollPosition.current)
  })

  return null
}
