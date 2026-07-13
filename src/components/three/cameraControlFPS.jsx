'use client'
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, CatmullRomCurve3, MathUtils } from "three";
import { useRef, useEffect, useMemo } from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { getCameraPathPoints, CASHIER_CAMERA_POS, CASHIER_LOOK_AT, ENTRY_LOOK_AT, DOOR_BLOCK_Z } from "@/lib/sceneLayout";
import gsap from "gsap";

// Bring `target` yaw into the same winding as `from` so GSAP takes the short way around
function nearestYaw(from, target) {
  return target + Math.round((from - target) / (Math.PI * 2)) * Math.PI * 2;
}

/**
 * Desktop FPS-style camera:
 * - Scroll moves the camera along a predefined path (CatmullRomCurve3)
 * - Mouse look via the Pointer Lock API
 *
 * Cursor policy (simplified):
 * - The cursor is visible whenever pointer lock is NOT engaged (browser default).
 * - Pointer lock natively hides the cursor - no CSS class juggling needed.
 * - ESC (browser built-in) releases pointer lock; clicking the canvas re-engages it.
 */
export function CameraFPS({ active = true, itemCount = 0 }) {
  const { camera, gl } = useThree();

  // "Locked" = camera must not move (dialogue sequence, cashier animation, inspection)
  const cameraLocked = useRef(false);
  const storeCameraLocked = useSceneStore((state) => state.cameraLocked);
  const inspecting = useSceneStore((state) => !!state.inspectedItemId);
  const setCameraLocked = useSceneStore((state) => state.setCameraLocked);
  const setCameraState = useSceneStore((state) => state.setCameraState);
  const savedCameraPosition = useSceneStore((state) => state.cameraPosition);
  const savedCameraRotation = useSceneStore((state) => state.cameraRotation);
  const savedScrollOffset = useSceneStore((state) => state.scrollOffset);
  const setShowDialogue = useSceneStore((state) => state.setShowDialogue);
  const setShowScrollBlock = useSceneStore((state) => state.setShowScrollBlock);

  // Scroll path generated from CMS item count: entrance -> doors -> cashier
  // -> snake through every aisle. Grows automatically with content.
  const cameraPath = useMemo(() => new CatmullRomCurve3(
    getCameraPathPoints(itemCount).map((p) => new Vector3(...p))
  ), [itemCount]);

  // Custom scroll state (direct - momentum was tried on desktop and
  // reverted; the immediate feel was better here. Mobile has momentum.)
  const scrollOffset = useRef(0); // 0 to 1
  const scrollFrozen = useRef(false);
  // Normalize scroll sensitivity to path length so walking speed stays
  // constant regardless of how many aisles the store has.
  // (0.027 world-units per wheel delta ~= the original feel.)
  const scrollSpeed = useRef(0.0003);
  useEffect(() => {
    const length = cameraPath.getLength();
    scrollSpeed.current = length > 0 ? 0.027 / length : 0.0003;
  }, [cameraPath]);

  // Scroll offset of the door threshold: movement stops here until the
  // sliding doors have finished opening (like real doors).
  const doorBlockT = useMemo(() => {
    const samples = 400;
    for (let i = 0; i <= samples; i++) {
      if (cameraPath.getPoint(i / samples).z < DOOR_BLOCK_Z) {
        return Math.max(0, (i - 1) / samples);
      }
    }
    return 0;
  }, [cameraPath]);


  // FPS rotation
  const yaw = useRef(0);
  const pitch = useRef(0);
  const sensitivity = useRef(0.002);

  // Pointer lock state
  const isLocked = useRef(false);

  // Flags
  const hasRestoredOnce = useRef(false);
  const hasReachedCashier = useRef(false);
  const cashierAnimationCompleted = useRef(false);
  const wasInspecting = useRef(false);
  // Where the user was looking before re-talking to the cashier
  // (null = first-time dialogue, which uses the fixed 90° turn instead)
  const resumeView = useRef(null);

  // Single source of truth for the movement lock:
  // locked while the store says so (dialogue/cashier) OR while inspecting an item.
  useEffect(() => {
    cameraLocked.current = storeCameraLocked || inspecting;

    if (inspecting && !wasInspecting.current) {
      // Entering inspection: release pointer lock so the cursor reappears
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
    if (!inspecting && wasInspecting.current) {
      // Exiting inspection: re-sync yaw/pitch with the restored camera rotation
      camera.rotation.order = 'YXZ';
      yaw.current = camera.rotation.y;
      pitch.current = camera.rotation.x;
    }
    wasInspecting.current = inspecting;
  }, [storeCameraLocked, inspecting, camera]);

  // Custom scroll wheel handler
  useEffect(() => {
    const onWheel = (e) => {
      if (scrollFrozen.current || cameraLocked.current || !active) return;

      const prev = scrollOffset.current;
      let next = Math.max(0, Math.min(1, prev + e.deltaY * scrollSpeed.current));

      // Closed doors block the threshold (only when approaching from
      // outside - a session restored inside the store is never yanked back)
      if (!useSceneStore.getState().doorsOpen && prev <= doorBlockT && next > doorBlockT) {
        next = doorBlockT;
      }

      scrollOffset.current = next;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [active, doorBlockT]);

  // Initial setup / restore when returning from portfolio pages
  useEffect(() => {
    if (!active) return;
    if (hasRestoredOnce.current) return;
    hasRestoredOnce.current = true;

    const startFresh = () => {
      const startPosition = cameraPath.getPoint(0);
      camera.position.copy(startPosition);
      scrollOffset.current = 0;

      // Face the supermarket entrance (doors straight ahead)
      camera.lookAt(...ENTRY_LOOK_AT);
      camera.rotation.order = 'YXZ';
      yaw.current = camera.rotation.y;
      pitch.current = camera.rotation.x;

      setCameraLocked(false);
    };

    // Full page reload: reset everything and start at the beginning of the path
    const isReload = performance.getEntriesByType("navigation")[0]?.type === 'reload';
    if (isReload) {
      useSceneStore.getState().reset();
      startFresh();
      return;
    }

    const isReturningFromPortfolio =
      savedCameraPosition &&
      savedCameraRotation &&
      typeof savedScrollOffset === 'number';

    if (isReturningFromPortfolio) {
      camera.position.set(savedCameraPosition.x, savedCameraPosition.y, savedCameraPosition.z);
      camera.rotation.order = 'YXZ';
      yaw.current = savedCameraRotation.y;
      pitch.current = savedCameraRotation.x;
      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;

      // Restore scroll offset so the camera doesn't jump back to the path start
      scrollOffset.current = savedScrollOffset;

      // User already passed the cashier if they made it to the portfolio pages
      hasReachedCashier.current = true;
      cashierAnimationCompleted.current = true;

      setCameraLocked(false);
      cameraLocked.current = false;
    } else {
      startFresh();
    }
  }, [camera, cameraPath, savedCameraPosition, savedCameraRotation, savedScrollOffset, setCameraLocked, active]);

  // Pointer lock engagement
  useEffect(() => {
    if (!active) return;
    const canvas = gl.domElement;

    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    const onCanvasClick = (e) => {
      if (!active) return;
      if (e.target !== canvas) return;
      if (cameraLocked.current) return; // dialogue, cashier animation, or inspection
      if (document.pointerLockElement === canvas) return;

      canvas.requestPointerLock().catch(() => {
        // Browser refused (e.g. too soon after a previous unlock).
        // Cursor simply stays visible; the user can click again.
      });
    };

    canvas.addEventListener('click', onCanvasClick);
    document.addEventListener('pointerlockchange', onLockChange);

    return () => {
      canvas.removeEventListener('click', onCanvasClick);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  }, [gl, active]);

  // Mouse movement for FPS rotation (only while pointer-locked and unlocked camera)
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!active || !isLocked.current || cameraLocked.current) return;

      const dx = e.movementX || 0;
      const dy = e.movementY || 0;

      yaw.current -= dx * sensitivity.current;
      pitch.current -= dy * sensitivity.current;
      pitch.current = MathUtils.clamp(pitch.current, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [active]);

  // Save camera state periodically (for "back to gallery" restoration)
  useEffect(() => {
    if (!active) return;
    const saveInterval = setInterval(() => {
      if (!cameraLocked.current) {
        setCameraState(
          { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          { x: pitch.current, y: yaw.current },
          scrollOffset.current
        );
      }
    }, 500);

    return () => clearInterval(saveInterval);
  }, [camera, setCameraState, active]);

  // Listen for camera transition event (after "EXPLORE 3D GALLERY" is clicked)
  useEffect(() => {
    if (!active) return;
    const onCameraTransition = () => {
      if (resumeView.current) {
        // Re-talk: restore the exact view the user had before turning to the cashier
        const { yaw: savedYaw, pitch: savedPitch } = resumeView.current;
        resumeView.current = null;
        gsap.to(yaw, {
          current: nearestYaw(yaw.current, savedYaw),
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            scrollFrozen.current = false;
          }
        });
        gsap.to(pitch, { current: savedPitch, duration: 1, ease: "power2.inOut" });
      } else {
        // First-time dialogue: turn 90° left to face down the first aisle
        gsap.to(yaw, {
          current: yaw.current - Math.PI / 2,
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            scrollFrozen.current = false;
          }
        });
      }
    };

    window.addEventListener('camera-transition-to-shelves', onCameraTransition);
    return () => window.removeEventListener('camera-transition-to-shelves', onCameraTransition);
  }, [active]);

  // Listen for "talk to cashier again" (clicking the cashier while exploring)
  useEffect(() => {
    if (!active) return;
    const onTalkToCashier = () => {
      if (cameraLocked.current) return;

      // Remember where the user was looking so EXPLORE can restore it
      resumeView.current = { yaw: yaw.current, pitch: pitch.current };

      setCameraLocked(true);
      cameraLocked.current = true;

      if (document.pointerLockElement) {
        document.exitPointerLock();
      }

      // Turn to face the cashier from wherever the user is standing
      const tempCamera = camera.clone();
      tempCamera.lookAt(...CASHIER_LOOK_AT);
      tempCamera.rotation.order = 'YXZ';

      gsap.to(yaw, {
        current: nearestYaw(yaw.current, tempCamera.rotation.y),
        duration: 1,
        ease: "power2.inOut"
      });
      gsap.to(pitch, {
        current: tempCamera.rotation.x,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          setShowDialogue(true);
        }
      });
    };

    window.addEventListener('talk-to-cashier', onTalkToCashier);
    return () => window.removeEventListener('talk-to-cashier', onTalkToCashier);
  }, [active, camera, setCameraLocked, setShowDialogue]);

  // Listen for reset cashier reached event
  useEffect(() => {
    if (!active) return;
    const onResetCashier = () => {
      hasReachedCashier.current = false;
      // Scroll unfreezes after the rotation animation completes
    };

    window.addEventListener('reset-cashier-reached', onResetCashier);
    return () => window.removeEventListener('reset-cashier-reached', onResetCashier);
  }, [active]);

  // Render loop
  useFrame(() => {
    if (!active) return;

    // While inspecting, useFocusEffect pins the camera - don't fight it
    if (!inspecting) {
      camera.rotation.order = 'YXZ';
      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;
      camera.rotation.z = 0;
    }

    // Skip position updates if camera is locked
    if (cameraLocked.current) return;

    // After reaching cashier and scroll is frozen, don't update position
    if (hasReachedCashier.current && scrollFrozen.current) return;

    // Update camera position based on scroll offset
    const position = cameraPath.getPoint(scrollOffset.current);
    camera.position.copy(position);

    // Detect when user scrolls to the cashier position (only triggers once)
    const targetPos = new Vector3(...CASHIER_CAMERA_POS);
    const distance = camera.position.distanceTo(targetPos);

    if (distance < 0.5 && !hasReachedCashier.current && !cashierAnimationCompleted.current) {
      hasReachedCashier.current = true;
      cashierAnimationCompleted.current = true;
      scrollFrozen.current = true;

      setShowScrollBlock(true);
      setCameraLocked(true);
      cameraLocked.current = true;

      // Release pointer lock so the cursor is available for the dialogue buttons
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }

      const tempCamera = camera.clone();
      tempCamera.lookAt(...CASHIER_LOOK_AT);
      tempCamera.rotation.order = 'YXZ';
      const targetYaw = nearestYaw(yaw.current, tempCamera.rotation.y);
      const targetPitch = tempCamera.rotation.x;

      gsap.to(yaw, {
        current: targetYaw,
        duration: 1.5,
        ease: "power2.inOut"
      });
      gsap.to(pitch, {
        current: targetPitch,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          setShowDialogue(true);
        }
      });
    }
  });

  return null;
}
