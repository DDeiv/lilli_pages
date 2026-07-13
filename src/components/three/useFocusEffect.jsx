import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useCallback, useEffect } from 'react'
import { Raycaster, Vector2, Color, Scene, PerspectiveCamera, DirectionalLight, AmbientLight, Vector3, Euler } from 'three'
import { useInspectionOverlay } from './InspectionOverlay'
import { useIsMobile } from '../../hooks/useIsMobile'

import { useSceneStore } from '@/store/useSceneStore'
import { SHELF_INTERACT_MAX_Z } from '@/lib/sceneLayout'

/**
 * FPS-style inspection mode for a single product mesh.
 *
 * Interaction rules:
 * - Desktop: only clickable while pointer lock is engaged (crosshair aiming).
 * - Mobile: tap the product directly.
 * - Only ONE item can be inspected at a time (guarded via the store).
 * - The store's `inspectedItemId` is the single source of truth; CameraFPS
 *   subscribes to it to lock/unlock the camera.
 */
export function useFocusEffect(targetRef, inspectionMeshRef, objectInfo = {}, active = true) {
  const { camera } = useThree()
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

  const savedCameraPosition = useRef(new Vector3())
  const savedCameraRotation = useRef(new Euler())

  // Store hover colors to avoid recreating them every frame
  const hoverColorOrange = useRef(new Color('orange'))
  const hoverColorBlack = useRef(new Color('black'))
  const previousHoverState = useRef(false)

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

  // Restore inspection state if returning from a portfolio page
  useEffect(() => {
    if (active && inspectedItemId && objectInfo?.id === inspectedItemId && !isolated && inspectionMeshRef?.current) {
      // Use stored camera state directly to avoid race conditions with CameraFPS restoration
      const { cameraPosition, cameraRotation } = useSceneStore.getState();

      if (cameraPosition) {
        savedCameraPosition.current.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      } else {
        savedCameraPosition.current.copy(camera.position);
      }

      if (cameraRotation) {
        savedCameraRotation.current.set(cameraRotation.x, cameraRotation.y, 0, 'YXZ');
      } else {
        savedCameraRotation.current.set(
          camera.rotation.x,
          camera.rotation.y,
          camera.rotation.z,
          camera.rotation.order
        );
      }

      inspectionObject.current = inspectionMeshRef.current
      inspectionCamera.current.position.set(0, 0, 3)
      inspectionObject.current.visible = true
      inspectionScene.current.add(inspectionObject.current)

      setIsolated(true)
    }
  }, [inspectedItemId, objectInfo, inspectionMeshRef, camera, isolated, active])

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
      if (!active) return;

      // Ignore interactions on the inspection UI or the cashier dialogue
      if (event.target.closest('#inspection-ui-overlay') || event.target.closest('#cashier-dialogue-overlay')) {
        return;
      }

      // Rows without a CMS item are plain shelf stock - not clickable.
      // (Opening an inspection without an item id would leave the store
      // without `inspectedItemId`, so the camera would never lock = buggy.)
      if (!objectInfo?.id) return;

      const store = useSceneStore.getState();

      // Only one inspection at a time; no inspecting during the dialogue
      if (isolated || store.inspectedItemId || store.showDialogue) return;

      // Items stay locked until the user has talked to the cashier...
      if (!store.cashierTalked) return;

      // ...and (desktop) only unlock past the cashier line. Mobile is
      // already gated by mobilePhase below (browse starts past the line).
      if (!isMobile && camera.position.z > SHELF_INTERACT_MAX_Z) return;

      // Desktop: only allow crosshair clicks while pointer lock is engaged (FPS mode)
      if (!isMobile && !document.pointerLockElement) return;

      // Mobile: taps only work while browsing the shelf line (not during the walk-in)
      if (isMobile && store.mobilePhase !== 'browse') return;

      if (targetRef.current && inspectionMeshRef?.current) {
        let raycastPoint = new Vector2(0, 0)
        let isValidInteraction = true;

        // On mobile, use tap position; on desktop, use center crosshair
        if (isMobile && (event.type === 'touchend' || event.type === 'touchstart')) {
          const touch = event.changedTouches?.[0] || event.touches?.[0]

          // Distinguish tap from scroll/drag
          if (event.type === 'touchend') {
            const moveX = Math.abs(touch.clientX - touchStartData.x);
            const moveY = Math.abs(touch.clientY - touchStartData.y);
            const duration = Date.now() - touchStartData.time;

            if (moveX > 10 || moveY > 10 || duration > 300) {
              isValidInteraction = false;
            }
          }

          if (touch && isValidInteraction) {
            raycastPoint.x = (touch.clientX / window.innerWidth) * 2 - 1
            raycastPoint.y = -(touch.clientY / window.innerHeight) * 2 + 1
          } else {
            return; // Swipe, not a tap
          }
        }
        // Desktop uses center crosshair (0, 0)

        raycaster.current.setFromCamera(raycastPoint, camera)
        const intersects = raycaster.current.intersectObject(targetRef.current, true)
        if (intersects.length > 0) {
          // Save camera state BEFORE changing any state
          savedCameraPosition.current.copy(camera.position)
          savedCameraRotation.current.set(
            camera.rotation.x,
            camera.rotation.y,
            camera.rotation.z,
            camera.rotation.order
          )

          inspectionObject.current = inspectionMeshRef.current
          inspectionCamera.current.position.set(0, 0, 3)
          inspectionObject.current.visible = true
          inspectionScene.current.add(inspectionObject.current)

          setIsolated(true)

          if (objectInfo?.id) {
            setInspectedItemId(objectInfo.id)
          }
        }
      }
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleInteraction, { passive: true })

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleInteraction)
    }
  }, [targetRef, inspectionMeshRef, isolated, camera, isMobile, objectInfo, setInspectedItemId, active])

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
      // Pin the camera in place while the inspection overlay is open
      camera.position.copy(savedCameraPosition.current)
      camera.rotation.set(
        savedCameraRotation.current.x,
        savedCameraRotation.current.y,
        savedCameraRotation.current.z,
        savedCameraRotation.current.order
      )
    } else if (!isMobile && active && objectInfo?.id) {
      // Crosshair hover effect (desktop only, only for rows with a real item,
      // only once the cashier has been talked to and past the cashier line)
      const store = useSceneStore.getState()
      const unlocked = store.cashierTalked && camera.position.z <= SHELF_INTERACT_MAX_Z
      let hovering = false
      if (unlocked) {
        const center = new Vector2(0, 0)
        raycaster.current.setFromCamera(center, camera)
        const intersects = raycaster.current.intersectObject(targetRef.current, true)
        hovering = intersects.length > 0
      }

      // Only update when hover state changes to prevent flickering
      if (hovering !== previousHoverState.current) {
        setIsHovered(hovering)
        previousHoverState.current = hovering

        // Works for a single mesh AND for groups (e.g. a row of cans):
        // applies the emissive glow to every descendant mesh material.
        targetRef.current.traverse((obj) => {
          if (obj.isMesh && obj.material?.emissive) {
            if (!obj.material._isCloned) {
              obj.material = obj.material.clone()
              obj.material._isCloned = true
            }
            if (hovering) {
              obj.material.emissive.copy(hoverColorOrange.current)
              obj.material.emissiveIntensity = 0.7
            } else {
              obj.material.emissive.copy(hoverColorBlack.current)
              obj.material.emissiveIntensity = 0
            }
          }
        })
      }
    }
  })

  // Render the overlay UI (only when isolated AND on the home page)
  useInspectionOverlay({
    isolated: isolated && active,
    objectInfo,
    exitIsolation,
    inspectionScene,
    inspectionCamera,
    inspectionObject
  })

  return { isHovered, isolated, exitIsolation }
}
