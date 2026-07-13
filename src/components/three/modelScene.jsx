'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { useGLTF, Outlines } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { useFocusEffect } from './useFocusEffect'
import { useSceneStore } from '@/store/useSceneStore'
import { SLUDGE } from '@/lib/theme'
import { makeFakeItem } from '@/lib/fakeItems'
import {
  getProductSlots,
  getShelfUnits,
  getAisleLights,
  getFacadeExtent,
  getFloorSpecs,
  getStoreShellSpec,
  getAisleSignSpecs,
  getQuickReturnSigns,
  getDecorShelves,
  getDecorStrips,
  itemIndexForSlot,
  STOREFRONT_Z,
  DOOR_CENTER_X,
  DOOR_GAP_WIDTH,
  DOOR_GAP_HEIGHT,
  FACADE_HEIGHT,
  DOOR_OPEN_TRIGGER_Z,
  CASHIER_INTERACT_DISTANCE,
} from '@/lib/sceneLayout'
import {
  PropRow,
  InspectionProp,
  TextSign,
  CashRegister,
  CheckoutCounter,
  BasketStack,
  LightFixture,
  ToonMaterial,
  useCheckerTexture,
  useTextTexture,
  PROP_TYPES,
} from './props'

// Sludge Life lines - Constant screen thickness, hiding far models
function JaggedEdges({ threshold = 15, color = "#222", lineWidth = 2, maxDistance = 25, ...props }) {
  const groupRef = useRef()

  useFrame(({ camera }) => {
    if (!groupRef.current) return
    const parentMesh = groupRef.current.parent
    if (parentMesh) {
      const distance = camera.position.distanceTo(parentMesh.getWorldPosition(new THREE.Vector3()))

      parentMesh.children.forEach(child => {
        if (child.type === "Group" && child.children[0]?.isMesh) {
          if (child.children[0].material.uniforms && child.children[0].material.uniforms.thickness) {
            child.visible = distance < maxDistance
          }
        }
      })
    }
  })

  return (
    <>
      <group ref={groupRef} visible={false} />
      <Outlines
        thickness={lineWidth}
        color={color}
        angle={threshold * Math.PI / 180}
        {...props}
      />
    </>
  )
}

function ExternalGLTF({ meshRef, modelUrl, scale }) {
  const { scene } = useGLTF(modelUrl)

  const { normalizedScale, centeredPosition } = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    // Fit the model dynamically within an imaginary 1.5-unit box
    const factor = maxDim > 0 ? 1.5 / maxDim : 1;
    const center = box.getCenter(new THREE.Vector3())

    return {
      normalizedScale: factor,
      centeredPosition: [-center.x * factor, -center.y * factor, -center.z * factor]
    }
  }, [scene])

  return (
    <group
      ref={meshRef}
      visible={false}
      position={[0, 0, 0]}
      rotation={[0.3, 0, 0]}
      scale={scale}
    >
      <primitive
        object={scene.clone()}
        scale={normalizedScale}
        position={centeredPosition}
      >
        <JaggedEdges />
      </primitive>
    </group>
  )
}

// Helper component to load and display model for inspection
function InspectionMesh({ modelUrl, scale = 1, meshRef, fallbackProp }) {
  // No CMS model set: show the row's procedural prop in the viewer
  if (!modelUrl) {
    return (
      <InspectionProp
        type={fallbackProp?.type}
        color={fallbackProp?.color}
        scale={scale}
        meshRef={meshRef}
      />
    );
  }

  let geometryComponent = null;

  if (modelUrl.includes('cube.glb')) {
    geometryComponent = <boxGeometry args={[1, 1, 1]} />;
  } else if (modelUrl.includes('sphere.glb')) {
    geometryComponent = <sphereGeometry args={[0.6, 32, 32]} />;
  } else if (modelUrl.includes('cylinder.glb')) {
    geometryComponent = <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
  } else if (modelUrl.includes('cone.glb')) {
    geometryComponent = <coneGeometry args={[0.6, 1.2, 32]} />;
  } else if (modelUrl.includes('torus.glb')) {
    geometryComponent = <torusGeometry args={[0.5, 0.2, 16, 100]} />;
  } else if (modelUrl.endsWith('.glb')) {
    return <ExternalGLTF meshRef={meshRef} modelUrl={modelUrl} scale={scale} />
  } else {
    geometryComponent = <boxGeometry args={[0.5, 0.5, 0.5]} />;
  }

  return (
    <mesh
      ref={meshRef}
      visible={false}
      position={[0, 0, 0]}
      rotation={[0.3, 0, 0]}
      scale={scale}
    >
      {geometryComponent}
      <ToonMaterial color="#cccccc" />
      <JaggedEdges />
    </mesh>
  );
}

/**
 * One product row on a shelf: a line of repeated procedural props (one
 * product type per row, like a real supermarket) filling the measured
 * bounding box of the original solid strip. The prop group is the raycast
 * target; the hover glow traverses it. Rows without a CMS item are
 * non-clickable stock. The inspection preview reuses the same prop unless
 * the item has a custom model in Sanity.
 */
function ProductRow({ item, position, active, color, propType, slotIndex }) {
  const meshRef = useRef()
  const inspectionRef = useRef()

  useFocusEffect(meshRef, inspectionRef, item, active)

  return (
    <>
      <PropRow
        groupRef={meshRef}
        position={position}
        type={propType}
        color={color}
        seed={slotIndex}
        density={0.8} // perf knob: lower = fewer props per row (fewer draw calls)
      />
      <InspectionMesh
        modelUrl={item?.inspectionModelUrl}
        scale={item?.inspectionScale || 1}
        meshRef={inspectionRef}
        fallbackProp={{ type: propType, color }}
      />
    </>
  )
}

/**
 * One shelf unit: THIN vertical back panel + 4 boards (a new bottom one
 * grounds the lowest product row). Boards are siblings, not children of
 * the scaled panel, so the panel can be slimmed without moving them.
 * Board positions keep the measured world offsets (products at ±1.246
 * from the unit center still land on the boards).
 */
function ShelfUnit({ nodes, position, rotation }) {
  const g = nodes.Cube?.geometry
  const boardYs = [-2.64, -1, 1, 2.7] // world y: 0.36, 2, 4, 5.7
  return (
    <group position={position} rotation={rotation}>
      {/* slim vertical back panel (was 1.0 thick, now 0.36) */}
      <mesh geometry={g} scale={[0.18, 3, 12]}>
        <ToonMaterial color={SLUDGE.shelf} />
        <JaggedEdges />
      </mesh>
      {boardYs.map((y, i) => (
        <mesh key={i} geometry={g} position={[-1.04, y, 0]} scale={[0.86, 0.1, 12]}>
          <ToonMaterial color={SLUDGE.shelfBoard} />
          <JaggedEdges />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Cashier counter + figure. Aiming at it (within range, in FPS mode)
 * glows orange; clicking re-opens the dialogue via 'talk-to-cashier'.
 */
function CashierInteractive({ nodes, active }) {
  const groupRef = useRef()
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const centerVec = useRef(new THREE.Vector2(0, 0))
  const hovered = useRef(false)

  const canInteract = () => {
    const store = useSceneStore.getState()
    return active &&
      !store.showDialogue &&
      !store.inspectedItemId &&
      !store.cameraLocked &&
      !!document.pointerLockElement
  }

  const aimHit = () => {
    if (!groupRef.current) return false
    raycaster.current.setFromCamera(centerVec.current, camera)
    const hits = raycaster.current.intersectObject(groupRef.current, true)
    return hits.length > 0 && hits[0].distance < CASHIER_INTERACT_DISTANCE
  }

  // Hover glow
  useFrame(() => {
    const hit = canInteract() && aimHit()
    if (hit !== hovered.current) {
      hovered.current = hit
      groupRef.current?.traverse((obj) => {
        if (obj.isMesh && obj.material?.emissive) {
          obj.material.emissive.set(hit ? 'orange' : 'black')
          obj.material.emissiveIntensity = hit ? 0.7 : 0
        }
      })
    }
  })

  // Click to talk
  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest('#inspection-ui-overlay') || e.target.closest('#cashier-dialogue-overlay')) return
      if (!canInteract() || !aimHit()) return
      window.dispatchEvent(new CustomEvent('talk-to-cashier'))
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, camera])

  return (
    <group ref={groupRef}>
      {/* Checkout counter (procedural: cabinet, belt, divider, bagging tray) */}
      <CheckoutCounter position={[-6.502, 0, 21.541]} />
      {/* Cashier figure - characters get a pop of color in a gray world */}
      <mesh geometry={nodes.Cube025?.geometry} position={[-8.937, 2.138, 21.609]} rotation={[-Math.PI, 0, -Math.PI]} scale={[-0.529, 2.226, 0.679]}>
        <ToonMaterial color={SLUDGE.cashierFigure} />
        <JaggedEdges />
      </mesh>
    </group>
  )
}

/**
 * Procedural storefront: facade wall + sliding doors, same blue cel-shaded
 * style as the rest of the scene. Doors slide into the walls (pocket doors)
 * when the camera approaches, and close again if it backs out.
 * Placeholder-friendly: replace with a modeled facade later if desired.
 */
function Storefront() {
  const leftDoor = useRef()
  const rightDoor = useRef()
  const isOpen = useRef(false)

  const { xMin, xMax } = getFacadeExtent()
  const gapL = DOOR_CENTER_X - DOOR_GAP_WIDTH / 2
  const gapR = DOOR_CENTER_X + DOOR_GAP_WIDTH / 2
  const panelW = DOOR_GAP_WIDTH / 2
  const leftClosedX = gapL + panelW / 2
  const rightClosedX = gapR - panelW / 2
  const slide = panelW + 0.3

  useFrame(({ camera }) => {
    if (!leftDoor.current || !rightDoor.current) return
    const shouldOpen = camera.position.z < DOOR_OPEN_TRIGGER_Z
    if (shouldOpen !== isOpen.current) {
      isOpen.current = shouldOpen
      const { setDoorsOpen } = useSceneStore.getState()
      if (!shouldOpen) {
        // Closing: the threshold blocks again immediately
        setDoorsOpen(false)
      }
      gsap.to(leftDoor.current.position, {
        x: shouldOpen ? leftClosedX - slide : leftClosedX,
        duration: 1.1,
        ease: 'power2.inOut'
      })
      gsap.to(rightDoor.current.position, {
        x: shouldOpen ? rightClosedX + slide : rightClosedX,
        duration: 1.1,
        ease: 'power2.inOut',
        onComplete: () => {
          // Opening: the threshold unblocks once they're fully open
          if (shouldOpen) setDoorsOpen(true)
        }
      })
    }
  })

  return (
    <group position={[0, 0, STOREFRONT_Z]}>
      {/* Left wall */}
      <mesh position={[(xMin + gapL) / 2, FACADE_HEIGHT / 2, 0]} scale={[gapL - xMin, FACADE_HEIGHT, 0.4]}>
        <boxGeometry />
        <ToonMaterial color={SLUDGE.wall} />
        <JaggedEdges maxDistance={60} />
      </mesh>
      {/* Right wall */}
      <mesh position={[(gapR + xMax) / 2, FACADE_HEIGHT / 2, 0]} scale={[xMax - gapR, FACADE_HEIGHT, 0.4]}>
        <boxGeometry />
        <ToonMaterial color={SLUDGE.wall} />
        <JaggedEdges maxDistance={60} />
      </mesh>
      {/* Header above the door gap */}
      <mesh position={[DOOR_CENTER_X, (DOOR_GAP_HEIGHT + FACADE_HEIGHT) / 2, 0]} scale={[DOOR_GAP_WIDTH, FACADE_HEIGHT - DOOR_GAP_HEIGHT, 0.4]}>
        <boxGeometry />
        <ToonMaterial color={SLUDGE.wall} />
        <JaggedEdges maxDistance={60} />
      </mesh>
      {/* Sign above the doors - one accent so the entrance reads from afar */}
      <mesh position={[DOOR_CENTER_X, FACADE_HEIGHT + 0.7, 0.3]} scale={[DOOR_GAP_WIDTH + 2, 1.4, 0.3]}>
        <boxGeometry />
        <ToonMaterial color={SLUDGE.productAccents[0]} />
        <JaggedEdges maxDistance={60} />
      </mesh>
      {/* Store name on the sign face */}
      <TextSign
        text="DEIV'S MARKET"
        position={[DOOR_CENTER_X, FACADE_HEIGHT + 0.7, 0.46]}
        size={[DOOR_GAP_WIDTH + 1.7, 1.15]}
        bg={SLUDGE.productAccents[0]}
        fg="#141410"
      />
      {/* Sliding door panels: glass-ish (slide sideways into the walls) */}
      <mesh ref={leftDoor} position={[leftClosedX, DOOR_GAP_HEIGHT / 2, 0.05]} scale={[panelW, DOOR_GAP_HEIGHT, 0.15]}>
        <boxGeometry />
        <ToonMaterial color={SLUDGE.doors} transparent opacity={0.55} />
        <JaggedEdges maxDistance={60} />
      </mesh>
      <mesh ref={rightDoor} position={[rightClosedX, DOOR_GAP_HEIGHT / 2, 0.05]} scale={[panelW, DOOR_GAP_HEIGHT, 0.15]}>
        <boxGeometry />
        <ToonMaterial color={SLUDGE.doors} transparent opacity={0.55} />
        <JaggedEdges maxDistance={60} />
      </mesh>
    </group>
  )
}

/**
 * Clickable "<< BACK TO FRONT" sign: dispatches 'quick-return', which
 * glides the camera back to the corridor entry (desktop: crosshair click
 * while pointer-locked; mobile: tap while browsing). Glows on aim.
 */
function QuickReturnSign({ spec, isMobile, active }) {
  const ref = useRef()
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const centerVec = useRef(new THREE.Vector2(0, 0))
  const hovered = useRef(false)
  const texture = useTextTexture('<< BACK TO FRONT', { bg: SLUDGE.ui.panel, fg: SLUDGE.ui.accent, width: 512, height: 128, font: 'bold 52px "Courier New", monospace' })

  const canInteract = () => {
    const store = useSceneStore.getState()
    if (!active || store.showDialogue || store.inspectedItemId || store.cameraLocked) return false
    if (isMobile) return store.mobilePhase === 'browse'
    return !!document.pointerLockElement
  }

  const hitTest = (ndc) => {
    if (!ref.current) return false
    raycaster.current.setFromCamera(ndc, camera)
    const hits = raycaster.current.intersectObject(ref.current, false)
    return hits.length > 0 && hits[0].distance < 30
  }

  // Aim glow (desktop)
  useFrame(() => {
    if (isMobile || !ref.current) return
    const hit = canInteract() && hitTest(centerVec.current)
    if (hit !== hovered.current) {
      hovered.current = hit
      if (ref.current.material?.emissive) {
        ref.current.material.emissive.set(hit ? SLUDGE.ui.accent : '#000000')
        ref.current.material.emissiveIntensity = hit ? 0.35 : 0
      }
    }
  })

  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest('#inspection-ui-overlay') || e.target.closest('#cashier-dialogue-overlay')) return
      if (!canInteract()) return
      const ndc = new THREE.Vector2(0, 0)
      if (isMobile) {
        ndc.x = (e.clientX / window.innerWidth) * 2 - 1
        ndc.y = -(e.clientY / window.innerHeight) * 2 + 1
      }
      if (hitTest(ndc)) {
        window.dispatchEvent(new CustomEvent('quick-return'))
      }
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, active, camera])

  return (
    <mesh ref={ref} position={spec.position} rotation={spec.rotation}>
      <planeGeometry args={spec.size} />
      <ToonMaterial map={texture} />
    </mesh>
  )
}

/**
 * Store shell: perimeter walls + ceiling. Big plain surfaces (no outlines -
 * they'd be noise at this scale; the fog does the depth work).
 */
function StoreShell({ itemCount, isMobile }) {
  const s = useMemo(() => getStoreShellSpec(itemCount, isMobile), [itemCount, isMobile])
  const depth = s.zFront - s.zBack
  const width = s.xMax - s.xMin
  const zMid = (s.zFront + s.zBack) / 2
  return (
    <group>
      {/* Left wall */}
      <mesh position={[s.xMin, s.height / 2, zMid]}>
        <boxGeometry args={[0.4, s.height, depth]} />
        <ToonMaterial color={SLUDGE.wall} />
      </mesh>
      {/* Right wall */}
      <mesh position={[s.xMax, s.height / 2, zMid]}>
        <boxGeometry args={[0.4, s.height, depth]} />
        <ToonMaterial color={SLUDGE.wall} />
      </mesh>
      {/* Back wall */}
      <mesh position={[(s.xMin + s.xMax) / 2, s.height / 2, s.zBack]}>
        <boxGeometry args={[width, s.height, 0.4]} />
        <ToonMaterial color={SLUDGE.wall} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[(s.xMin + s.xMax) / 2, s.height, zMid]}>
        <boxGeometry args={[width, 0.3, depth]} />
        <ToonMaterial color={SLUDGE.ceiling} />
      </mesh>
    </group>
  )
}

/**
 * Floors: checkerboard INSIDE the market (the Sludge Life classic),
 * plain warm concrete outside the doors.
 */
function Floor({ itemCount, isMobile }) {
  const specs = useMemo(() => getFloorSpecs(itemCount, isMobile), [itemCount, isMobile])
  // One checker cell = 2 tiles; tile ~0.7 world units
  const checker = useCheckerTexture(specs.inside.size[0] / 1.4, specs.inside.size[1] / 1.4)
  return (
    <group>
      <mesh position={specs.inside.position} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={specs.inside.size} />
        <ToonMaterial map={checker} color="#ffffff" />
      </mesh>
      <mesh position={specs.outside.position} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={specs.outside.size} />
        <ToonMaterial color={SLUDGE.floor} />
      </mesh>
    </group>
  )
}

export function Model({ sceneItems = [], active = true, isMobile = false, ...props }) {
  const { nodes } = useGLTF('/models/scene2.glb')
  const itemCount = sceneItems.length

  // ONE layout for both platforms (linear store). Mobile may need more
  // segments (items only fill the left wall there), hence the flag.
  const slots = useMemo(() => getProductSlots(itemCount, isMobile), [itemCount, isMobile])
  const shelfUnits = useMemo(() => getShelfUnits(itemCount, isMobile), [itemCount, isMobile])
  const lights = useMemo(() => getAisleLights(itemCount, isMobile), [itemCount, isMobile])
  const aisleSigns = useMemo(() => getAisleSignSpecs(itemCount, isMobile), [itemCount, isMobile])
  const returnSigns = useMemo(() => getQuickReturnSigns(itemCount, isMobile), [itemCount, isMobile])
  const decorShelves = useMemo(() => getDecorShelves(itemCount, isMobile), [itemCount, isMobile])
  const decorStrips = useMemo(() => getDecorStrips(itemCount, isMobile), [itemCount, isMobile])

  return (
    <group {...props} dispose={null}>
      {/* Ceiling lights (two per segment + cashier) with visible fixtures */}
      {lights.map((p, i) => (
        <group key={`light-${i}`}>
          <pointLight intensity={100} decay={2} position={p} />
          <LightFixture position={[p[0], p[1] + 0.25, p[2]]} />
        </group>
      ))}

      {/* Product rows: repeated procedural props, one product type per row.
          Type and accent color cycle with an offset per segment so every
          segment gets a different pairing. Rows without a CMS item sell
          deterministic FAKE products (funny names, inspectable, no
          portfolio link) - every shelf in the store is stocked. */}
      {slots.map((slot, i) => {
        const itemIdx = itemIndexForSlot(i, isMobile)
        const segment = Math.floor(i / 6)
        const propType = PROP_TYPES[(i + segment) % PROP_TYPES.length]
        const realItem = itemIdx >= 0 ? sceneItems[itemIdx] : undefined
        return (
          <ProductRow
            key={`product-${i}`}
            item={realItem ?? makeFakeItem(i, propType)}
            position={slot.position}
            active={active}
            color={SLUDGE.productAccents[i % SLUDGE.productAccents.length]}
            propType={propType}
            slotIndex={i}
          />
        )
      })}

      {/* Shelves */}
      {shelfUnits.map((u, i) => (
        <ShelfUnit
          key={`shelf-${i}`}
          nodes={nodes}
          position={u.position}
          rotation={u.rotation}
          scale={u.scale}
        />
      ))}

      {/* Decorative flanking shelf rows (set dressing, not clickable):
          cheap solid strips instead of prop rows to keep draw calls down */}
      {decorShelves.map((u, i) => (
        <ShelfUnit
          key={`decor-shelf-${i}`}
          nodes={nodes}
          position={u.position}
          rotation={u.rotation}
          scale={u.scale}
        />
      ))}
      {decorStrips.map((s, i) => (
        <mesh
          key={`decor-strip-${i}`}
          geometry={nodes.produc_1?.geometry}
          position={s.position}
          rotation={s.rotation}
          scale={s.scale}
        >
          <ToonMaterial color={SLUDGE.productAccents[s.colorIndex]} />
          <JaggedEdges />
        </mesh>
      ))}

      {/* Floor + walls + ceiling (back wall sits after THIS platform's last row) */}
      <Floor itemCount={itemCount} isMobile={isMobile} />
      <StoreShell itemCount={itemCount} isMobile={isMobile} />

      {/* Hanging aisle signs */}
      {aisleSigns.map((sign, i) => (
        <TextSign
          key={`aisle-sign-${i}`}
          text={sign.label}
          position={sign.position}
          size={[3.4, 0.9]}
          bg={SLUDGE.ui.panel}
          fg={SLUDGE.ui.accent}
        />
      ))}

      {/* Clickable "back to front" signs in the segment gaps */}
      {returnSigns.map((spec, i) => (
        <QuickReturnSign key={`return-sign-${i}`} spec={spec} isMobile={isMobile} active={active} />
      ))}

      {/* Checkout dressing */}
      <CashRegister position={[-6.4, 1.82, 19.9]} rotation={[0, Math.PI / 2, 0]} />
      <TextSign
        text="CHECKOUT"
        position={[-6.5, 5.4, 21.5]}
        rotation={[0, Math.PI / 2, 0]}
        size={[3.2, 0.85]}
        bg={SLUDGE.ui.panel}
        fg={SLUDGE.ui.accent}
      />
      <BasketStack position={[-8.5, 0, 36.5]} />

      {/* Cashier (clickable: re-opens the dialogue) */}
      <CashierInteractive nodes={nodes} active={active} />

      {/* Storefront with sliding entry doors (desktop AND the mobile walk-in enter through it) */}
      <Storefront />
    </group>
  )
}

// Preload main scene model
useGLTF.preload('/models/scene2.glb')

// Note: Inspection models are loaded dynamically from Sanity CMS
