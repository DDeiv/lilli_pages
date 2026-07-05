'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect, useMemo } from 'react'
import { Vector3, CatmullRomCurve3 } from 'three'
import { useSceneStore } from '@/store/useSceneStore'
import {
  getEntryPathPoints,
  getMobileBrowseBounds,
  MOBILE_BROWSE,
  ENTRY_SWIPE_DIRECTION,
  CASHIER_LOOK_AT,
} from '@/lib/sceneLayout'
import gsap from 'gsap'

/**
 * Mobile camera flow, in two phases:
 *
 * 1. "approach": vertical swipe walks the camera along the real entry path
 *    (outside -> sliding doors -> cashier). Swipe direction is set by
 *    ENTRY_SWIPE_DIRECTION in sceneLayout.js (drag down = forward).
 * 2. "browse": camera locked in the corridor facing the LEFT product wall
 *    (3 stacked rows per segment - a real shelf on a portrait screen),
 *    horizontal swipe scrolls along it, clamped at both ends (the store
 *    is linear now, wrap-around would teleport visibly).
 *
 * The whole desktop scene renders on mobile too; only the left wall is
 * interactive (see itemIndexForSlot in sceneLayout).
 */
export function MobileShelfView({ active = true, itemCount = 0 }) {
  const { camera } = useThree()

  const cameraLocked = useSceneStore((state) => state.cameraLocked)
  const setCameraLocked = useSceneStore((state) => state.setCameraLocked)
  const setCameraState = useSceneStore((state) => state.setCameraState)
  const savedCameraPosition = useSceneStore((state) => state.cameraPosition)
  const savedCameraRotation = useSceneStore((state) => state.cameraRotation)
  const showDialogue = useSceneStore((state) => state.showDialogue)
  const setShowDialogue = useSceneStore((state) => state.setShowDialogue)
  const setMobilePhase = useSceneStore((state) => state.setMobilePhase)

  // 'approach' | 'browse' (ref mirror of store.mobilePhase for the frame loop)
  const phase = useRef('approach')

  // ---- approach phase state ----
  const entryCurve = useMemo(
    () => new CatmullRomCurve3(getEntryPathPoints().map((p) => new Vector3(...p))),
    []
  )
  const entryT = useRef(0)
  const targetEntryT = useRef(0)
  const reachedCashier = useRef(false)

  // ---- browse phase state ----
  const bounds = useMemo(() => getMobileBrowseBounds(itemCount), [itemCount])
  const scrollZ = useRef(MOBILE_BROWSE.startZ)
  const targetScrollZ = useRef(MOBILE_BROWSE.startZ)

  // ---- touch tracking ----
  const touchStart = useRef(null)
  const isInitialized = useRef(false)
  // Reload must be handled only once per page load (the navigation entry
  // stays type 'reload' forever, and init re-runs when returning from
  // portfolio pages)
  const reloadHandled = useRef(false)

  useEffect(() => {
    if (!active) {
      isInitialized.current = false
    }
  }, [active])

  const enterBrowsePhase = () => {
    phase.current = 'browse'
    setMobilePhase('browse')
  }

  const startFreshVisit = () => {
    camera.fov = 75
    camera.updateProjectionMatrix()
    const start = entryCurve.getPoint(0)
    camera.position.copy(start)
    camera.lookAt(...entryCurve.getPoint(0.05).toArray())
    entryT.current = 0
    targetEntryT.current = 0
    reachedCashier.current = false
    phase.current = 'approach'
    setMobilePhase('approach')
    setCameraLocked(false)
    isInitialized.current = true
  }

  // Initialization / restore
  useEffect(() => {
    if (!active) return
    if (isInitialized.current) return

    // Page reload: wipe the session state and start at the entrance
    // (mirrors the desktop CameraFPS behavior - mobile was missing this,
    // so reloading restored the old browse position instead of resetting)
    const isReload = performance.getEntriesByType('navigation')[0]?.type === 'reload'
    if (isReload && !reloadHandled.current) {
      reloadHandled.current = true
      useSceneStore.getState().reset()
      startFreshVisit()
      return
    }

    if (savedCameraPosition && savedCameraRotation && !showDialogue) {
      // Returning from portfolio while exploring: restore browse state
      camera.fov = MOBILE_BROWSE.fov
      camera.updateProjectionMatrix()
      camera.position.set(savedCameraPosition.x, savedCameraPosition.y, savedCameraPosition.z)

      scrollZ.current = savedCameraPosition.z
      targetScrollZ.current = savedCameraPosition.z
      camera.lookAt(MOBILE_BROWSE.lookX, MOBILE_BROWSE.lookY, scrollZ.current)

      enterBrowsePhase()
      reachedCashier.current = true
      setCameraLocked(false)
      isInitialized.current = true
    } else if (showDialogue) {
      // Returning mid-dialogue: stand at the cashier
      camera.fov = 75
      camera.updateProjectionMatrix()
      camera.position.set(-4.41, 2.5, 21.57)
      camera.lookAt(...CASHIER_LOOK_AT)
      reachedCashier.current = true
      setCameraLocked(true)
      isInitialized.current = true
    } else {
      // Fresh visit: start outside, facing the doors; swipe to walk in
      startFreshVisit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, camera, entryCurve, savedCameraPosition, savedCameraRotation, showDialogue, setCameraLocked, setMobilePhase])

  // Touch controls (both phases)
  useEffect(() => {
    if (!active) return

    const handleTouchStart = (e) => {
      if (cameraLocked) return
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const handleTouchMove = (e) => {
      if (touchStart.current === null || cameraLocked) return
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY

      if (phase.current === 'approach') {
        // Vertical swipe walks the entry path (direction is a layout constant)
        const diff = (y - touchStart.current.y) * ENTRY_SWIPE_DIRECTION
        targetEntryT.current = Math.max(0, Math.min(1, targetEntryT.current + diff * 0.0012))
      } else {
        // Horizontal swipe pans along the wall. Facing -X, view-right = -Z:
        // dragging the finger left pulls the next shelves in from the right.
        const diff = touchStart.current.x - x
        targetScrollZ.current = Math.max(
          bounds.min,
          Math.min(bounds.max, targetScrollZ.current - diff * 0.012)
        )
      }

      touchStart.current = { x, y }
    }

    const handleTouchEnd = () => {
      touchStart.current = null
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [active, cameraLocked, bounds])

  // Reaching the cashier at the end of the walk-in
  const onReachCashier = () => {
    reachedCashier.current = true
    setCameraLocked(true)

    // Smoothly turn to face the cashier (quaternion slerp), then show dialogue
    const q0 = camera.quaternion.clone()
    camera.lookAt(...CASHIER_LOOK_AT)
    const q1 = camera.quaternion.clone()
    camera.quaternion.copy(q0)

    const o = { t: 0 }
    gsap.to(o, {
      t: 1,
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: () => camera.quaternion.slerpQuaternions(q0, q1, o.t),
      onComplete: () => setShowDialogue(true),
    })
  }

  // "EXPLORE 3D GALLERY": travel from the cashier to the browse position.
  // Everything (position, orientation, FOV) is tweened together and the
  // end state EXACTLY matches what the browse frame-loop computes, so
  // there is no snap when control unlocks. Orientation uses quaternion
  // slerp - Euler-angle tweens after a lookAt were the cause of the
  // broken view during this transition.
  useEffect(() => {
    if (!active) return
    const onCameraTransition = () => {
      const b = MOBILE_BROWSE
      const startZ = b.startZ

      scrollZ.current = startZ
      targetScrollZ.current = startZ

      // Compute the exact final orientation from the final position
      const probe = camera.clone()
      probe.position.set(b.cameraX, b.cameraY, startZ)
      probe.lookAt(b.lookX, b.lookY, startZ)
      const q0 = camera.quaternion.clone()
      const q1 = probe.quaternion.clone()

      const o = { t: 0 }
      const tl = gsap.timeline({
        onComplete: () => {
          enterBrowsePhase()
          setCameraLocked(false)
        }
      })

      tl.to(camera.position, {
        x: b.cameraX, y: b.cameraY, z: startZ,
        duration: 2.4,
        ease: 'power2.inOut'
      })
      tl.to(o, {
        t: 1,
        duration: 2.4,
        ease: 'power2.inOut',
        onUpdate: () => camera.quaternion.slerpQuaternions(q0, q1, o.t)
      }, '<')
      tl.to(camera, {
        fov: b.fov,
        duration: 2.4,
        ease: 'power2.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      }, '<')
    }

    window.addEventListener('camera-transition-to-shelves', onCameraTransition)
    return () => window.removeEventListener('camera-transition-to-shelves', onCameraTransition)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, camera, setCameraLocked])

  // Save camera state periodically (browse phase only)
  useEffect(() => {
    if (!active) return
    const saveInterval = setInterval(() => {
      if (!cameraLocked && phase.current === 'browse') {
        setCameraState(
          { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          { x: camera.rotation.x, y: camera.rotation.y },
          null // mobile doesn't use the desktop scroll path
        )
      }
    }, 500)

    return () => clearInterval(saveInterval)
  }, [camera, setCameraState, cameraLocked, active])

  useFrame(() => {
    if (!active || cameraLocked) return

    if (phase.current === 'approach') {
      entryT.current += (targetEntryT.current - entryT.current) * 0.08
      const pos = entryCurve.getPoint(entryT.current)
      camera.position.copy(pos)

      // Look ahead along the path
      const lookAhead = entryCurve.getPoint(Math.min(entryT.current + 0.04, 1))
      camera.lookAt(lookAhead)

      if (entryT.current > 0.985 && !reachedCashier.current) {
        onReachCashier()
      }
      return
    }

    // ---- browse phase: locked to the wall, pan along Z ----
    scrollZ.current += (targetScrollZ.current - scrollZ.current) * 0.1

    camera.position.x = MOBILE_BROWSE.cameraX
    camera.position.y = MOBILE_BROWSE.cameraY
    camera.position.z = scrollZ.current
    camera.lookAt(MOBILE_BROWSE.lookX, MOBILE_BROWSE.lookY, scrollZ.current)
  })

  return null
}
