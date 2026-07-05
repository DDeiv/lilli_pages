'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { useGLTF, Outlines } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { useFocusEffect } from './useFocusEffect'
import { useSceneStore } from '@/store/useSceneStore'
import { SLUDGE } from '@/lib/theme'
import {
  getProductSlots,
  getShelfUnits,
  getRails,
  getAisleLights,
  getFacadeExtent,
  getFloorSpec,
  getStoreShellSpec,
  getAisleSignSpecs,
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
  BasketStack,
  LightFixture,
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
      <meshStandardMaterial color="#cccccc" />
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

/** One shelf unit (base + 3 boards), reusing the original GLB geometries. */
function ShelfUnit({ nodes, position, rotation, scale }) {
  return (
    <mesh geometry={nodes.Cube?.geometry} position={position} rotation={rotation} scale={scale}>
      <meshStandardMaterial color={SLUDGE.concrete} />
      <mesh geometry={nodes.Cube002?.geometry} position={[-2.4, 0.333, 0]} scale={[1.4, 0.033, 1]}>
        <meshStandardMaterial color={SLUDGE.concreteLight} />
        <JaggedEdges />
      </mesh>
      <mesh geometry={nodes.Cube003?.geometry} position={[-2.4, -0.9, 0]} scale={[1.4, 0.033, 1]}>
        <meshStandardMaterial color={SLUDGE.concreteLight} />
        <JaggedEdges />
      </mesh>
      <mesh geometry={nodes.Cube004?.geometry} position={[-2.4, -0.333, 0]} scale={[1.4, 0.033, 1]}>
        <meshStandardMaterial color={SLUDGE.concreteLight} />
        <JaggedEdges />
      </mesh>
      <JaggedEdges />
    </mesh>
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
      {/* Counter */}
      <mesh geometry={nodes.Cube016?.geometry} position={[-6.502, 0.783, 21.541]} scale={[0.989, 1, 3.027]}>
        <meshStandardMaterial color={SLUDGE.concreteDark} />
        <JaggedEdges />
      </mesh>
      {/* Cashier figure - characters get a pop of color in a gray world */}
      <mesh geometry={nodes.Cube025?.geometry} position={[-8.937, 2.138, 21.609]} rotation={[-Math.PI, 0, -Math.PI]} scale={[-0.529, 2.226, 0.679]}>
        <meshStandardMaterial color={SLUDGE.cashierFigure} />
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
      gsap.to(leftDoor.current.position, {
        x: shouldOpen ? leftClosedX - slide : leftClosedX,
        duration: 1.1,
        ease: 'power2.inOut'
      })
      gsap.to(rightDoor.current.position, {
        x: shouldOpen ? rightClosedX + slide : rightClosedX,
        duration: 1.1,
        ease: 'power2.inOut'
      })
    }
  })

  return (
    <group position={[0, 0, STOREFRONT_Z]}>
      {/* Left wall */}
      <mesh position={[(xMin + gapL) / 2, FACADE_HEIGHT / 2, 0]} scale={[gapL - xMin, FACADE_HEIGHT, 0.4]}>
        <boxGeometry />
        <meshStandardMaterial color={SLUDGE.concrete} />
        <JaggedEdges maxDistance={60} />
      </mesh>
      {/* Right wall */}
      <mesh position={[(gapR + xMax) / 2, FACADE_HEIGHT / 2, 0]} scale={[xMax - gapR, FACADE_HEIGHT, 0.4]}>
        <boxGeometry />
        <meshStandardMaterial color={SLUDGE.concrete} />
        <JaggedEdges maxDistance={60} />
      </mesh>
      {/* Header above the door gap */}
      <mesh position={[DOOR_CENTER_X, (DOOR_GAP_HEIGHT + FACADE_HEIGHT) / 2, 0]} scale={[DOOR_GAP_WIDTH, FACADE_HEIGHT - DOOR_GAP_HEIGHT, 0.4]}>
        <boxGeometry />
        <meshStandardMaterial color={SLUDGE.concrete} />
        <JaggedEdges maxDistance={60} />
      </mesh>
      {/* Sign above the doors - one accent so the entrance reads from afar */}
      <mesh position={[DOOR_CENTER_X, FACADE_HEIGHT + 0.7, 0.3]} scale={[DOOR_GAP_WIDTH + 2, 1.4, 0.3]}>
        <boxGeometry />
        <meshStandardMaterial color={SLUDGE.productAccents[0]} />
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
      {/* Sliding door panels (slide sideways into the walls) */}
      <mesh ref={leftDoor} position={[leftClosedX, DOOR_GAP_HEIGHT / 2, 0.05]} scale={[panelW, DOOR_GAP_HEIGHT, 0.15]}>
        <boxGeometry />
        <meshStandardMaterial color={SLUDGE.doors} />
        <JaggedEdges maxDistance={60} />
      </mesh>
      <mesh ref={rightDoor} position={[rightClosedX, DOOR_GAP_HEIGHT / 2, 0.05]} scale={[panelW, DOOR_GAP_HEIGHT, 0.15]}>
        <boxGeometry />
        <meshStandardMaterial color={SLUDGE.doors} />
        <JaggedEdges maxDistance={60} />
      </mesh>
    </group>
  )
}

/**
 * Store shell: perimeter walls + ceiling. Big plain surfaces (no outlines -
 * they'd be noise at this scale; the fog does the depth work).
 */
function StoreShell({ itemCount }) {
  const s = useMemo(() => getStoreShellSpec(itemCount), [itemCount])
  const depth = s.zFront - s.zBack
  const width = s.xMax - s.xMin
  const zMid = (s.zFront + s.zBack) / 2
  return (
    <group>
      {/* Left wall */}
      <mesh position={[s.xMin, s.height / 2, zMid]}>
        <boxGeometry args={[0.4, s.height, depth]} />
        <meshStandardMaterial color={SLUDGE.concrete} />
      </mesh>
      {/* Right wall */}
      <mesh position={[s.xMax, s.height / 2, zMid]}>
        <boxGeometry args={[0.4, s.height, depth]} />
        <meshStandardMaterial color={SLUDGE.concrete} />
      </mesh>
      {/* Back wall */}
      <mesh position={[(s.xMin + s.xMax) / 2, s.height / 2, s.zBack]}>
        <boxGeometry args={[width, s.height, 0.4]} />
        <meshStandardMaterial color={SLUDGE.concrete} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[(s.xMin + s.xMax) / 2, s.height, zMid]}>
        <boxGeometry args={[width, 0.3, depth]} />
        <meshStandardMaterial color={SLUDGE.concreteDark} />
      </mesh>
    </group>
  )
}

/** Flat concrete floor under the whole store + the outside approach. */
function Floor({ itemCount }) {
  const spec = useMemo(() => getFloorSpec(itemCount), [itemCount])
  return (
    <mesh position={spec.position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={spec.size} />
      <meshStandardMaterial color={SLUDGE.floor} />
    </mesh>
  )
}

export function Model({ sceneItems = [], active = true, isMobile = false, ...props }) {
  const { nodes } = useGLTF('/models/scene2.glb')
  const itemCount = sceneItems.length

  // ONE layout for both platforms (linear store). Mobile may need more
  // segments (items only fill the left wall there), hence the flag.
  const slots = useMemo(() => getProductSlots(itemCount, isMobile), [itemCount, isMobile])
  const shelfUnits = useMemo(() => getShelfUnits(itemCount, isMobile), [itemCount, isMobile])
  const rails = useMemo(() => getRails(itemCount, isMobile), [itemCount, isMobile])
  const lights = useMemo(() => getAisleLights(itemCount, isMobile), [itemCount, isMobile])
  const aisleSigns = useMemo(() => getAisleSignSpecs(itemCount, isMobile), [itemCount, isMobile])

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
          segment gets a different pairing. On mobile, items live on the
          left wall only (itemIndexForSlot returns -1 -> plain stock). */}
      {slots.map((slot, i) => {
        const itemIdx = itemIndexForSlot(i, isMobile)
        const segment = Math.floor(i / 6)
        return (
          <ProductRow
            key={`product-${i}`}
            item={itemIdx >= 0 ? sceneItems[itemIdx] : undefined}
            position={slot.position}
            active={active}
            color={SLUDGE.productAccents[i % SLUDGE.productAccents.length]}
            propType={PROP_TYPES[(i + segment) % PROP_TYPES.length]}
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

      {/* Price rails above the left product wall of each segment */}
      {rails.map((r, i) => (
        <mesh key={`rail-${i}`} geometry={nodes.Cube021?.geometry} position={r.position} rotation={r.rotation} scale={r.scale}>
          <meshStandardMaterial color={SLUDGE.concreteDark} />
          <JaggedEdges />
        </mesh>
      ))}

      {/* Floor + walls + ceiling */}
      <Floor itemCount={itemCount} />
      <StoreShell itemCount={itemCount} />

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

      {/* Checkout dressing */}
      <CashRegister position={[-6.4, 1.79, 19.6]} rotation={[0, Math.PI / 2, 0]} />
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
