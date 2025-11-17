'use client'
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { Vector3, CatmullRomCurve3, MathUtils, Euler } from "three";
import { useRef, useEffect } from "react";
import { useSceneStore } from "@/store/useSceneStore";
import gsap from "gsap";

export function CameraFPS() {
  const { camera, gl } = useThree();
  const scroll = useScroll();
  const cameraLocked = useRef(false);
  const storeCameraLocked = useSceneStore((state) => state.cameraLocked);
  const setCameraLocked = useSceneStore((state) => state.setCameraLocked);
  const setCameraState = useSceneStore((state) => state.setCameraState);
  const savedCameraPosition = useSceneStore((state) => state.cameraPosition);
  const savedCameraRotation = useSceneStore((state) => state.cameraRotation);
  const showDialogue = useSceneStore((state) => state.showDialogue);
  const setShowDialogue = useSceneStore((state) => state.setShowDialogue);
  const setShowScrollBlock = useSceneStore((state) => state.setShowScrollBlock);

  // Define the scroll path: Position 1 → Position 3 → Position 2 → Position 4 → Position 5 → Position 6
  const cameraPath = new CatmullRomCurve3([
    new Vector3(-4.20, 2.72, 35.00), // Position 1 (start position - far from cashier)
    new Vector3(-5, 2, -13),          // Position 2
    new Vector3(-5, 3, 16),           // Position 3 (middle position)
    new Vector3(0.88, 2.00, -18.48), // Position 4
    new Vector3(7.06, 2.00, -12.93), // Position 5
    new Vector3(7.00, 1.94, 11.67)   // Position 6 (end position)
  ]);

  // Pure FPS rotation (no limits on yaw, clamped pitch)
  const yaw = useRef(0);   // Left/right - unlimited rotation
  const pitch = useRef(0); // Up/down - clamped to prevent flipping

  // Mouse sensitivity
  const sensitivity = useRef(0.002);

  // Pointer lock state
  const isLocked = useRef(false);

  // Flag to prevent infinite restoration loop
  const hasRestoredOnce = useRef(false);

  // Flag to track when user reaches cashier position
  const hasReachedCashier = useRef(false);

  // Sync cameraLocked ref with store state
  useEffect(() => {
    cameraLocked.current = storeCameraLocked;
    console.log('🔄 Camera lock state synced:', storeCameraLocked);
  }, [storeCameraLocked]);

  // Initial setup - position camera at position 1 or restore saved position
  useEffect(() => {
    // Guard: only run setup once
    if (hasRestoredOnce.current) return;
    hasRestoredOnce.current = true;

    // Only restore if there's saved state AND cashier was already reached
    // (This means user went to portfolio and is coming back)
    const isReturningFromPortfolio = savedCameraPosition && savedCameraRotation && hasReachedCashier.current;

    if (isReturningFromPortfolio) {
      // Restore saved camera state when returning from portfolio
      console.log('🔄 Restoring saved camera position (returning from portfolio)');
      camera.position.set(
        savedCameraPosition.x,
        savedCameraPosition.y,
        savedCameraPosition.z
      );
      camera.rotation.order = 'YXZ';
      yaw.current = savedCameraRotation.y;
      pitch.current = savedCameraRotation.x;
      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;

      // Unlock camera when restoring (user was already exploring)
      console.log('🔓 Unlocking camera for restored state');
      setCameraLocked(false);
      cameraLocked.current = false;

      // Hide cursor - user will click canvas to re-engage pointer lock
      const isManuallyVisible = document.body.getAttribute('data-cursor-manual') === 'true';
      if (!isManuallyVisible) {
        document.body.classList.add('hide-cursor');
        console.log('🚫 Cursor hidden - click canvas to re-engage pointer lock');
      }
    } else {
      // First time setup - start far from cashier, looking at her
      console.log('🎬 Initial camera setup - starting far from cashier');
      camera.position.set(-4.20, 2.72, 35.00);

      // Look at cashier from the start
      camera.lookAt(-7, 3, 21.6);
      camera.rotation.order = 'YXZ';
      yaw.current = camera.rotation.y;
      pitch.current = camera.rotation.x;
      console.log('👁️ Camera looking at cashier');

      // Camera is FREE - user can look around and scroll!
      setCameraLocked(false);
      console.log('🔓 Camera unlocked - user can scroll towards cashier');
    }
  }, [camera, savedCameraPosition, savedCameraRotation, showDialogue, setCameraLocked, setShowDialogue, gl]);

  // Handle pointer lock
  useEffect(() => {
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
      console.log('🖱️ Canvas clicked!');
      console.log('  → Target is canvas?', e.target === canvas);
      console.log('  → storeCameraLocked:', storeCameraLocked);
      console.log('  → cameraLocked.current:', cameraLocked.current);

      const isManuallyVisible = document.body.getAttribute('data-cursor-manual') === 'true';
      console.log('  → isManuallyVisible:', isManuallyVisible);

      const isAlreadyLocked = document.pointerLockElement === canvas;
      console.log('  → Already locked?', isAlreadyLocked);

      // Request pointer lock if not already locked and camera is free
      if (e.target === canvas && !storeCameraLocked && !cameraLocked.current && !isManuallyVisible) {
        if (!isAlreadyLocked) {
          console.log('✅ All conditions met - requesting pointer lock');
          canvas.requestPointerLock()
            .then(() => {
              console.log('✅ Pointer lock ENGAGED from canvas click');
              document.body.removeAttribute('data-cursor-manual');
              document.body.classList.add('hide-cursor');
            })
            .catch((err) => console.log('❌ Pointer lock failed:', err));
        } else {
          console.log('⏭️ Pointer lock already active');
        }
      } else {
        console.log('❌ Conditions not met for pointer lock');
      }
    };

    canvas.addEventListener('click', onCanvasClick);
    document.addEventListener('pointerlockchange', onLockChange);

    return () => {
      canvas.removeEventListener('click', onCanvasClick);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  }, [gl, storeCameraLocked]);

  // Handle mouse movement for FPS rotation
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isLocked.current || cameraLocked.current || storeCameraLocked) return;

      const dx = e.movementX || 0;
      const dy = e.movementY || 0;

      // Unlimited yaw (360° horizontal rotation)
      yaw.current -= dx * sensitivity.current;

      // Clamped pitch (vertical rotation limited to ~85° up/down)
      pitch.current -= dy * sensitivity.current;
      pitch.current = MathUtils.clamp(pitch.current, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [storeCameraLocked]);

  // Save camera state periodically (for "back to gallery" feature)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (!cameraLocked.current && !storeCameraLocked) {
        setCameraState(
          { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          { x: pitch.current, y: yaw.current }
        );
      }
    }, 500); // Save every 500ms

    return () => clearInterval(saveInterval);
  }, [camera, setCameraState, storeCameraLocked]);

  // Listen for inspection mode
  useEffect(() => {
    const canvas = gl.domElement;

    const onInspectionMode = (e) => {
      const wasLocked = cameraLocked.current;
      cameraLocked.current = e.detail.locked;

      console.log('🔍 Inspection mode changed:', e.detail.locked ? 'LOCKED' : 'UNLOCKED');

      // When entering inspection mode (locked: true)
      if (!wasLocked && e.detail.locked) {
        console.log('🔒 Entering inspection mode, releasing pointer lock');

        // Exit pointer lock to show cursor
        if (document.pointerLockElement) {
          document.exitPointerLock();
          console.log('✅ Pointer lock released for inspection');
        }

        // Make sure cursor is visible
        document.body.classList.remove('hide-cursor');
        console.log('👁️ Cursor shown for inspection');
      }

      // When exiting inspection mode (locked: false)
      if (wasLocked && !e.detail.locked) {
        console.log('🔓 Exiting inspection mode, re-syncing camera controls');

        // Sync yaw/pitch with current camera rotation
        camera.rotation.order = 'YXZ';
        yaw.current = camera.rotation.y;
        pitch.current = camera.rotation.x;

        console.log('🚫 Click canvas to re-engage pointer lock and continue exploring');
      }
    };

    window.addEventListener('inspection-mode', onInspectionMode);
    return () => window.removeEventListener('inspection-mode', onInspectionMode);
  }, [gl, camera]);


  // Listen for camera transition event - rotate 90 degrees left
  useEffect(() => {
    const onCameraTransition = () => {
      console.log('📹 Camera transition event received - rotating 90° left');

      // Rotate 90 degrees to the left (subtract Math.PI / 2 from current yaw)
      const targetYaw = yaw.current - Math.PI / 2;

      // Animate camera rotation
      gsap.to(yaw, {
        current: targetYaw,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          console.log('✅ Camera rotation complete');
        }
      });
    };

    window.addEventListener('camera-transition-to-shelves', onCameraTransition);
    return () => window.removeEventListener('camera-transition-to-shelves', onCameraTransition);
  }, [camera]);

  // Listen for reset cashier reached event (when user clicks dialogue option)
  useEffect(() => {
    const onResetCashier = () => {
      console.log('🔄 Resetting cashier reached flag - scroll path re-enabled');
      hasReachedCashier.current = false;
    };

    window.addEventListener('reset-cashier-reached', onResetCashier);
    return () => window.removeEventListener('reset-cashier-reached', onResetCashier);
  }, []);

  // Render loop - apply rotation and movement
  useFrame((state, delta) => {
    // Always apply rotation (even when locked, for animations to work)
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    camera.rotation.z = 0;

    // Skip position updates if camera is locked (during dialogue/animations)
    if (cameraLocked.current || storeCameraLocked) return;

    // After reaching cashier, camera stays in place (no more scroll path following)
    if (hasReachedCashier.current) return;

    // User-controlled scroll: Update position along scroll path (only before reaching cashier)
    const t = scroll.range(0, 1);
    const position = cameraPath.getPoint(t);
    camera.position.copy(position);

    // Detect when user scrolls to cashier dialogue position (-4.41, 2.50, 21.57)
    // Check distance from target position
    const targetPos = new Vector3(-4.41, 2.50, 21.57);
    const distance = camera.position.distanceTo(targetPos);

    if (distance < 0.5 && !hasReachedCashier.current) {
      hasReachedCashier.current = true;
      console.log('📍 User reached cashier position (-4.41, 2.50, 21.57)');

      // SHOW scroll block overlay immediately
      setShowScrollBlock(true);
      console.log('🚫 Scroll block overlay shown');

      // LOCK camera rotation
      setCameraLocked(true);
      cameraLocked.current = true;

      // Calculate target rotation to look at cashier
      const tempCamera = camera.clone();
      tempCamera.lookAt(-7, 3, 21.6);
      tempCamera.rotation.order = 'YXZ';
      const targetYaw = tempCamera.rotation.y;
      const targetPitch = tempCamera.rotation.x;

      // Smoothly animate rotation to look at cashier
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
          // Show dialogue after rotation completes
          console.log('💬 Showing cashier dialogue');
          setShowDialogue(true);
          console.log('🔒 Camera locked at cashier - waiting for user dialogue choice');
        }
      });
    }
  });

  return null;
}
