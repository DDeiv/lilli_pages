import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useCallback, useEffect } from 'react'
import { Raycaster, Vector2, Color, Scene, PerspectiveCamera, DirectionalLight, AmbientLight, Vector3, Euler } from 'three'
import { useInspectionOverlay } from './InspectionOverlay'
import { useCursorManager } from './CursorManager'
import { useIsMobile } from '../../hooks/useIsMobile'

// Custom hook: FPS-style inspection mode with pre-created inspection meshes
export function useFocusEffect(targetRef, inspectionMeshRef, objectInfo = {}) {
  const { camera, scene } = useThree()
  const isMobile = useIsMobile()
  const raycaster = useRef(new Raycaster())
  const [isHovered, setIsHovered] = useState(false)
  const [isolated, setIsolated] = useState(false)

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
    const handleInteraction = (event) => {
      if (targetRef.current && inspectionMeshRef?.current && !isolated) {
        let raycastPoint = new Vector2(0, 0)

        // On mobile, use tap position; on desktop, use center crosshair
        if (isMobile && (event.type === 'touchend' || event.type === 'touchstart')) {
          const touch = event.changedTouches?.[0] || event.touches?.[0]
          if (touch) {
            // Convert touch position to normalized device coordinates (-1 to +1)
            raycastPoint.x = (touch.clientX / window.innerWidth) * 2 - 1
            raycastPoint.y = -(touch.clientY / window.innerHeight) * 2 + 1
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
        }
      }
    }

    // Listen for both click (desktop) and touch (mobile) events
    window.addEventListener('click', handleInteraction)
    window.addEventListener('touchend', handleInteraction, { passive: true })

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchend', handleInteraction)
    }
  }, [targetRef, inspectionMeshRef, isolated, camera])

  const exitIsolation = useCallback(() => {
    if (inspectionObject.current) {
      inspectionScene.current.remove(inspectionObject.current)
      inspectionObject.current.visible = false
      inspectionObject.current = null
    }
    setIsolated(false)
  }, [])

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
  useInspectionOverlay({
    isolated,
    objectInfo,
    exitIsolation,
    inspectionScene,
    inspectionCamera,
    inspectionObject
  })

  return { isHovered, isolated, cameraLocked, exitIsolation }
}