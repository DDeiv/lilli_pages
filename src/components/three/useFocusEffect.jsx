import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useCallback, useEffect } from 'react'
import { Raycaster, Vector2, Color, Scene, PerspectiveCamera, DirectionalLight, AmbientLight, Vector3, Euler } from 'three'
import { useInspectionOverlay } from './InspectionOverlay'
import { useCursorManager } from './CursorManager'
import { useIsMobile } from '../../hooks/useIsMobile'

import { useSceneStore } from '@/store/useSceneStore'

// Custom hook: FPS-style inspection mode with pre-created inspection meshes
export function useFocusEffect(targetRef, inspectionMeshRef, objectInfo = {}, active = true) {
  const { camera, scene } = useThree()
  const isMobile = useIsMobile()
  const raycaster = useRef(new Raycaster())
  const [isHovered, setIsHovered] = useState(false)
  const [isolated, setIsolated] = useState(false)

  const setInspectedItemId = useSceneStore((state) => state.setInspectedItemId)
  const inspectedItemId = useSceneStore((state) => state.inspectedItemId)

  const inspectionScene = useRef(null)
  const inspectionCamera = useRef(null)
  const inspectionObject = useRef(null)
  const directionalLight = useRef(null)
  const ambientLight = useRef(null)

  const cameraLocked = useRef(false)
  const savedCameraPosition = useRef(new Vector3())
  const savedCameraRotation = useRef(new Euler())

  // Store hover colors to avoid recreating them every frame
  const hoverColorOrange = useRef(new Color('orange'))
  const hoverColorBlack = useRef(new Color('black'))
  const previousHoverState = useRef(false)

  // Use cursor manager for cursor visibility control
  useCursorManager(isolated)

  if (!inspectionScene.current) {
    inspectionScene.current = new Scene()
    inspectionScene.current.background = null
    inspectionCamera.current = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
    inspectionCamera.current.position.set(0, 0, 4)

    directionalLight.current = new DirectionalLight(0xffffff, 3)
    directionalLight.current.position.set(3, 4, 3)
    inspectionScene.current.add(directionalLight.current)

    ambientLight.current = new AmbientLight(0xffffff, 1.5)
    inspectionScene.current.add(ambientLight.current)
  }

  // Restore inspection state if returning from portfolio
  useEffect(() => {
    // Only restore if we are active (on home page)
    if (active && inspectedItemId && objectInfo?.id === inspectedItemId && !isolated && inspectionMeshRef?.current) {
      console.log(`🔄 Restoring inspection for item: ${inspectedItemId}`);

      // Use stored camera state directly to avoid race conditions with CameraFPS restoration
      const { cameraPosition, cameraRotation } = useSceneStore.getState();

      if (cameraPosition) {
        savedCameraPosition.current.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      } else {
        savedCameraPosition.current.copy(camera.position);
      }

      if (cameraRotation) {
        savedCameraRotation.current.set(
          cameraRotation.x,
          cameraRotation.y,
          0,
          'YXZ'
        );
      } else {
        savedCameraRotation.current.set(
          camera.rotation.x,
          camera.rotation.y,
          camera.rotation.z,
          camera.rotation.order
        );
      }

      // Setup inspection
      inspectionObject.current = inspectionMeshRef.current
      inspectionCamera.current.position.set(0, 0, 3)
      inspectionObject.current.visible = true
      inspectionScene.current.add(inspectionObject.current)

      setIsolated(true)
    }
  }, [inspectedItemId, objectInfo, inspectionMeshRef, camera, isolated, active])

  useEffect(() => {
    if (isolated) {
      cameraLocked.current = true
      // Dispatch event to notify camera controls to lock
      window.dispatchEvent(new CustomEvent('inspection-mode', { detail: { locked: true } }))
    } else {
      cameraLocked.current = false
      // Dispatch event to notify camera controls to unlock
      window.dispatchEvent(new CustomEvent('inspection-mode', { detail: { locked: false } }))
    }
  }, [isolated, camera])

  useEffect(() => {
    // Track touch start for distinguishing tap vs scroll
    const touchStartData = { x: 0, y: 0, time: 0 };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        touchStartData.x = e.touches[0].clientX;
        touchStartData.y = e.touches[0].clientY;
        touchStartData.time = Date.now();
      }
    };

    const handleInteraction = (event) => {
      // Check if we are on the home page (active) by checking if the canvas wrapper is visible
      // This is a bit of a hack, but since we don't pass 'active' prop here, we check the DOM
      const canvasWrapper = document.querySelector('canvas')?.parentElement;
      const isVisible = canvasWrapper && window.getComputedStyle(canvasWrapper).opacity !== '0';

      // Ignore interactions originating from the inspection UI overlay or cashier dialogue
      if (event.target.closest('#inspection-ui-overlay') || event.target.closest('#cashier-dialogue-overlay')) {
        return;
      }

      // Also check if cursor is manually visible (e.g. user pressed X)
      // If cursor is visible, we shouldn't be clicking on 3D objects
      const isCursorVisible = document.body.getAttribute('data-cursor-manual') === 'true' ||
        !document.body.classList.contains('hide-cursor');

      // Only allow interaction if:
      // 1. We are on the home page (canvas visible)
      // 2. Cursor is HIDDEN (meaning we are in FPS mode) OR we are on mobile (where cursor concept is different)
      // 3. Not already in inspection mode
      if (!isVisible || (isCursorVisible && !isMobile) || isolated) {
        return;
      }

      if (targetRef.current && inspectionMeshRef?.current) {
        let raycastPoint = new Vector2(0, 0)
        let isValidInteraction = true;

        // On mobile, use tap position; on desktop, use center crosshair
        if (isMobile && (event.type === 'touchend' || event.type === 'touchstart')) {
          const touch = event.changedTouches?.[0] || event.touches?.[0]

          // Check if this was a tap or a scroll
          if (event.type === 'touchend') {
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            const touchEndTime = Date.now();

            const moveX = Math.abs(touchEndX - touchStartData.x);
            const moveY = Math.abs(touchEndY - touchStartData.y);
            const duration = touchEndTime - touchStartData.time;

            // If moved more than 10px or took longer than 300ms, it's a scroll/drag, not a tap
            if (moveX > 10 || moveY > 10 || duration > 300) {
              isValidInteraction = false;
              console.log('👆 Swipe detected, ignoring tap on object');
            }
          }

          if (touch && isValidInteraction) {
            // Convert touch position to normalized device coordinates (-1 to +1)
            raycastPoint.x = (touch.clientX / window.innerWidth) * 2 - 1
            raycastPoint.y = -(touch.clientY / window.innerHeight) * 2 + 1
          } else {
            return; // Invalid interaction (swipe)
          }
        }
        // Desktop uses center crosshair (0, 0)

        raycaster.current.setFromCamera(raycastPoint, camera)
        const intersects = raycaster.current.intersectObject(targetRef.current, true)
        if (intersects.length > 0) {
          // IMPORTANT: Save camera state BEFORE changing any state
          savedCameraPosition.current.copy(camera.position)
          savedCameraRotation.current.set(
            camera.rotation.x,
            camera.rotation.y,
            camera.rotation.z,
            camera.rotation.order
          )

          // Use the pre-created inspection mesh instead of cloning
          inspectionObject.current = inspectionMeshRef.current

          // Position camera at a fixed distance for consistent viewing
          inspectionCamera.current.position.set(0, 0, 3)

          // Make the inspection mesh visible
          inspectionObject.current.visible = true

          inspectionScene.current.add(inspectionObject.current)
          setIsolated(true)

          // Save to store
          if (objectInfo?.id) {
            setInspectedItemId(objectInfo.id)
          }
        }
      }
    }

    // Listen for both click (desktop) and touch (mobile) events
    window.addEventListener('click', handleInteraction)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleInteraction, { passive: true })

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleInteraction)
    }
  }, [targetRef, inspectionMeshRef, isolated, camera, isMobile, objectInfo, setInspectedItemId])

  const exitIsolation = useCallback(() => {
    if (inspectionObject.current) {
      inspectionScene.current.remove(inspectionObject.current)
      inspectionObject.current.visible = false
      inspectionObject.current = null
    }
    setIsolated(false)
    setInspectedItemId(null)
  }, [setInspectedItemId])

  useFrame(() => {
    if (!targetRef?.current) return

    if (isolated) {
      // Lock camera in place
      camera.position.copy(savedCameraPosition.current)
      // Properly restore rotation with order
      camera.rotation.set(
        savedCameraRotation.current.x,
        savedCameraRotation.current.y,
        savedCameraRotation.current.z,
        savedCameraRotation.current.order
      )

      // Just render the main scene normally - inspection scene renders in separate canvas
      // No need to modify opacity or render inspection scene here
    } else {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => {
              mat.transparent = false
              mat.opacity = 1
            })
          } else {
            obj.material.transparent = false
            obj.material.opacity = 1
          }
        }
      })

      // Only do hover effect on desktop (not mobile)
      if (!isMobile) {
        const center = new Vector2(0, 0)
        raycaster.current.setFromCamera(center, camera)
        const intersects = raycaster.current.intersectObject(targetRef.current, true)
        const hovering = intersects.length > 0

        // Only update if hover state changed to prevent flickering
        if (hovering !== previousHoverState.current) {
          setIsHovered(hovering)
          previousHoverState.current = hovering

          if (targetRef.current.material && !targetRef.current.material._isCloned) {
            targetRef.current.material = targetRef.current.material.clone()
            targetRef.current.material._isCloned = true
          }

          if (targetRef.current.material) {
            if (hovering) {
              targetRef.current.material.emissive.copy(hoverColorOrange.current)
              targetRef.current.material.emissiveIntensity = 0.7
            } else {
              targetRef.current.material.emissive.copy(hoverColorBlack.current)
              targetRef.current.material.emissiveIntensity = 0
            }
          }
        }
      }
    }
  })


  // Use the separate overlay hook to render the UI
  // Only show overlay if isolated AND active (on home page)
  useInspectionOverlay({
    isolated: isolated && active,
    objectInfo,
    exitIsolation,
    inspectionScene,
    inspectionCamera,
    inspectionObject
  })

  return { isHovered, isolated, cameraLocked, exitIsolation }
}