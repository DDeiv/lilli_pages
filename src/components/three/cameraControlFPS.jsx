'use client'
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, CatmullRomCurve3, MathUtils } from "three";
import { useRef, useEffect } from "react";
import { useSceneStore } from "@/store/useSceneStore";
import gsap from "gsap";

export function CameraFPS({ active = true }) {
  const { camera, gl } = useThree();
  const cameraLocked = useRef(false);
  const storeCameraLocked = useSceneStore((state) => state.cameraLocked);
  const setCameraLocked = useSceneStore((state) => state.setCameraLocked);
  const setCameraState = useSceneStore((state) => state.setCameraState);
  const savedCameraPosition = useSceneStore((state) => state.cameraPosition);
  const savedCameraRotation = useSceneStore((state) => state.cameraRotation);
  const savedScrollOffset = useSceneStore((state) => state.scrollOffset);
  const showDialogue = useSceneStore((state) => state.showDialogue);
  const setShowDialogue = useSceneStore((state) => state.setShowDialogue);
  const setShowScrollBlock = useSceneStore((state) => state.setShowScrollBlock);

  // Define the scroll path
  const cameraPath = new CatmullRomCurve3([
    new Vector3(-4.20, 2.72, 35.00), // Position 1 (start)
    new Vector3(-5, 2, -13),          // Position 2
    new Vector3(-5, 3, 16),           // Position 3
    new Vector3(0.88, 2.00, -18.48), // Position 4
    new Vector3(7.06, 2.00, -12.93), // Position 5
    new Vector3(7.00, 1.94, 11.67)   // Position 6 (end)
  ]);

  // Custom scroll state (replaces ScrollControls)
  const scrollOffset = useRef(0); // 0 to 1
  const scrollFrozen = useRef(false);
  const scrollSpeed = useRef(0.0003); // Adjust for scroll sensitivity (lower = less sensitive)

  // FPS rotation
  const yaw = useRef(0);
  const pitch = useRef(0);
  const sensitivity = useRef(0.002);

  // Pointer lock state
  const isLocked = useRef(false);

  // Flags
  const hasRestoredOnce = useRef(false);
  const hasReachedCashier = useRef(false);
  const cashierAnimationCompleted = useRef(false); // Prevent re-triggering

  // Sync cameraLocked ref with store state
  useEffect(() => {
    cameraLocked.current = storeCameraLocked;
    console.log('🔄 Camera lock state synced:', storeCameraLocked);
  }, [storeCameraLocked]);

  // Custom scroll wheel handler
  useEffect(() => {
    const onWheel = (e) => {
      // Don't scroll if frozen or camera is locked or NOT ACTIVE
      if (scrollFrozen.current || cameraLocked.current || storeCameraLocked || !active) {
        return;
      }

      // Update scroll offset
      scrollOffset.current += e.deltaY * scrollSpeed.current;
      // Clamp between 0 and 1
      scrollOffset.current = Math.max(0, Math.min(1, scrollOffset.current));
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [storeCameraLocked, active]);

  // Initial setup
  useEffect(() => {
    if (!active) return;
    if (hasRestoredOnce.current) return;
    hasRestoredOnce.current = true;

    // Check if page was reloaded
    const isReload = performance.getEntriesByType("navigation")[0]?.type === 'reload';

    if (isReload) {
      console.log('🔄 Page reloaded - Resetting camera state to start');
      // Reset store state to ensure we start fresh
      useSceneStore.getState().reset();

      // Standard start logic
      console.log('🎬 Initial camera setup - starting far from cashier');
      const startPosition = cameraPath.getPoint(0);
      camera.position.copy(startPosition);
      scrollOffset.current = 0;

      camera.lookAt(-7, 3, 21.6);
      camera.rotation.order = 'YXZ';
      yaw.current = camera.rotation.y;
      pitch.current = camera.rotation.x;
      console.log('👁️ Camera looking at cashier');

      setCameraLocked(false);
      console.log('🔓 Camera unlocked - user can scroll towards cashier');
      return;
    }

    const isReturningFromPortfolio = savedCameraPosition && savedCameraRotation && savedScrollOffset !== null;

    if (isReturningFromPortfolio) {
      console.log('🔄 Restoring saved camera position (returning from portfolio)');
      camera.position.set(savedCameraPosition.x, savedCameraPosition.y, savedCameraPosition.z);
      camera.rotation.order = 'YXZ';
      yaw.current = savedCameraRotation.y;
      pitch.current = savedCameraRotation.x;
      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;

      // IMPORTANT: Restore scroll offset to prevent camera from jumping back to path start
      scrollOffset.current = savedScrollOffset;
      console.log(`📜 Restored scroll offset: ${savedScrollOffset.toFixed(3)}`);

      console.log('🔓 Unlocking camera for restored state');
      setCameraLocked(false);
      cameraLocked.current = false;

      const isManuallyVisible = document.body.getAttribute('data-cursor-manual') === 'true';
      const inspectedItemId = useSceneStore.getState().inspectedItemId;

      if (!isManuallyVisible && !inspectedItemId) {
        document.body.classList.add('hide-cursor');
        console.log('🚫 Cursor hidden - click canvas to re-engage pointer lock');
      } else if (inspectedItemId) {
        console.log('👁️ Restoring with inspection active - keeping cursor visible');
      }
    } else {
      console.log('🎬 Initial camera setup - starting far from cashier');
      const startPosition = cameraPath.getPoint(0);
      camera.position.copy(startPosition);
      scrollOffset.current = 0;

      camera.lookAt(-7, 3, 21.6);
      camera.rotation.order = 'YXZ';
      yaw.current = camera.rotation.y;
      pitch.current = camera.rotation.x;
      console.log('👁️ Camera looking at cashier');

      setCameraLocked(false);
      console.log('🔓 Camera unlocked - user can scroll towards cashier');
    }
  }, [camera, savedCameraPosition, savedCameraRotation, savedScrollOffset, setCameraLocked, active]);

  // Handle pointer lock
  useEffect(() => {
    if (!active) return;
    const canvas = gl.domElement;

    const onLockChange = () => {
      const wasLocked = isLocked.current;
      isLocked.current = document.pointerLockElement === canvas;

      if (isLocked.current && !wasLocked) {
        console.log('✅ Pointer lock ENGAGED');
      } else if (!isLocked.current && wasLocked) {
        console.log('❌ Pointer lock RELEASED');
      }
    };

    const onCanvasClick = (e) => {
      if (!active) return;
      const isManuallyVisible = document.body.getAttribute('data-cursor-manual') === 'true';
      const isAlreadyLocked = document.pointerLockElement === canvas;

      if (e.target === canvas && !storeCameraLocked && !cameraLocked.current && !isManuallyVisible) {
        if (!isAlreadyLocked) {
          canvas.requestPointerLock()
            .then(() => {
              console.log('✅ Pointer lock ENGAGED from canvas click');
              document.body.removeAttribute('data-cursor-manual');
              document.body.classList.add('hide-cursor');
            })
            .catch((err) => console.log('❌ Pointer lock failed:', err));
        }
      }
    };

    canvas.addEventListener('click', onCanvasClick);
    document.addEventListener('pointerlockchange', onLockChange);

    return () => {
      canvas.removeEventListener('click', onCanvasClick);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  }, [gl, storeCameraLocked, active]);

  // Handle mouse movement for FPS rotation
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!active || !isLocked.current || cameraLocked.current || storeCameraLocked) return;

      const dx = e.movementX || 0;
      const dy = e.movementY || 0;

      yaw.current -= dx * sensitivity.current;
      pitch.current -= dy * sensitivity.current;
      pitch.current = MathUtils.clamp(pitch.current, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [storeCameraLocked, active]);

  // Save camera state periodically
  useEffect(() => {
    if (!active) return;
    const saveInterval = setInterval(() => {
      if (!cameraLocked.current && !storeCameraLocked) {
        setCameraState(
          { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          { x: pitch.current, y: yaw.current },
          scrollOffset.current
        );
      }
    }, 500);

    return () => clearInterval(saveInterval);
  }, [camera, setCameraState, storeCameraLocked, active]);

  // DEBUG: Log camera position and scroll value
  useEffect(() => {
    if (!active) return;
    const debugInterval = setInterval(() => {
      const pos = camera.position;
      const yawDeg = ((yaw.current * 180) / Math.PI).toFixed(1);
      const pitchDeg = ((pitch.current * 180) / Math.PI).toFixed(1);

      console.log(
        `📷 Camera: pos(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}) ` +
        `rot(yaw: ${yawDeg}°, pitch: ${pitchDeg}°) ` +
        `scroll: ${scrollOffset.current.toFixed(3)} frozen: ${scrollFrozen.current}`
      );
    }, 500);

    return () => clearInterval(debugInterval);
  }, [camera, active]);

  // Listen for inspection mode
  useEffect(() => {
    if (!active) return;
    const onInspectionMode = (e) => {
      const wasLocked = cameraLocked.current;
      cameraLocked.current = e.detail.locked;

      console.log('🔍 Inspection mode changed:', e.detail.locked ? 'LOCKED' : 'UNLOCKED');

      if (!wasLocked && e.detail.locked) {
        console.log('🔒 Entering inspection mode, releasing pointer lock');
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
        document.body.classList.remove('hide-cursor');
      }

      if (wasLocked && !e.detail.locked) {
        console.log('🔓 Exiting inspection mode');
        camera.rotation.order = 'YXZ';
        yaw.current = camera.rotation.y;
        pitch.current = camera.rotation.x;
      }
    };

    window.addEventListener('inspection-mode', onInspectionMode);
    return () => window.removeEventListener('inspection-mode', onInspectionMode);
  }, [camera, active]);

  // Listen for camera transition event
  useEffect(() => {
    if (!active) return;
    const onCameraTransition = () => {
      console.log('📹 Camera transition event received - rotating 90° left');

      const targetYaw = yaw.current - Math.PI / 2;

      gsap.to(yaw, {
        current: targetYaw,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          console.log('✅ Camera rotation complete');
          // Unfreeze scroll after rotation
          scrollFrozen.current = false;
          console.log('🔓 Scroll unfrozen - camera movement re-enabled');
        }
      });
    };

    window.addEventListener('camera-transition-to-shelves', onCameraTransition);
    return () => window.removeEventListener('camera-transition-to-shelves', onCameraTransition);
  }, [active]);

  // Listen for reset cashier reached event
  useEffect(() => {
    if (!active) return;
    const onResetCashier = () => {
      console.log('🔄 Resetting cashier reached flag');
      hasReachedCashier.current = false;
      // Scroll will be unfrozen after rotation animation completes
    };

    window.addEventListener('reset-cashier-reached', onResetCashier);
    return () => window.removeEventListener('reset-cashier-reached', onResetCashier);
  }, [active]);

  // Render loop
  useFrame(() => {
    if (!active) return;
    // Always apply rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    camera.rotation.z = 0;

    // Skip position updates if camera is locked
    if (cameraLocked.current || storeCameraLocked) return;

    // After reaching cashier and scroll is frozen, don't update position
    if (hasReachedCashier.current && scrollFrozen.current) return;

    // Update camera position based on scroll offset
    const position = cameraPath.getPoint(scrollOffset.current);
    camera.position.copy(position);

    // Detect when user scrolls to cashier position (only trigger once)
    const targetPos = new Vector3(-4.41, 2.50, 21.57);
    const distance = camera.position.distanceTo(targetPos);

    if (distance < 0.5 && !hasReachedCashier.current && !cashierAnimationCompleted.current) {
      hasReachedCashier.current = true;
      cashierAnimationCompleted.current = true; // Mark as completed forever
      // FREEZE scroll immediately
      scrollFrozen.current = true;
      console.log(`📍 User reached cashier position - FREEZING scroll at ${scrollOffset.current.toFixed(3)}`);

      setShowScrollBlock(true);
      console.log('🚫 Scroll block overlay shown');

      setCameraLocked(true);
      cameraLocked.current = true;

      const tempCamera = camera.clone();
      tempCamera.lookAt(-7, 3, 21.6);
      tempCamera.rotation.order = 'YXZ';
      const targetYaw = tempCamera.rotation.y;
      const targetPitch = tempCamera.rotation.x;

      console.log('🎬 Animating smooth turn to cashier...');
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
          console.log('✅ Smooth turn to cashier complete');
          console.log('💬 Showing cashier dialogue');
          setShowDialogue(true);
          console.log('🔒 Camera locked at cashier - waiting for user dialogue choice');
        }
      });
    }
  });

  return null;
}
