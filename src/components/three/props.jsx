'use client'

/**
 * Procedural supermarket props - cans, boxes, bottles, jars, bags, cartons -
 * assembled from primitives in the flat-color + black-outline style.
 * No external assets: perfect style consistency, zero downloads.
 *
 * Every prop has its origin at the BASE CENTER (so it stands on a shelf),
 * a height ~1 unit, and takes a `color` (the row accent).
 *
 * PROP_DIMS drives both row packing (PropRow) and inspection centering.
 */

import React, { useMemo } from 'react'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { SLUDGE } from '@/lib/theme'
import { PRODUCT_STRIP_SIZE } from '@/lib/sceneLayout'

// Same outline treatment as the rest of the scene
function Lines(props) {
  return <Outlines thickness={2} color="#222" angle={(15 * Math.PI) / 180} {...props} />
}

/**
 * Stepped toon shading (the Sludge Life shadow treatment): instead of a
 * smooth Lambert falloff, faces snap to 3 discrete brightness bands.
 * Shared ramp texture, lazily created client-side.
 */
let toonRamp = null
function getToonRamp() {
  if (!toonRamp) {
    // TWO bands only, like Sludge Life: a face is either lit or in shadow.
    // No midtone - depth comes from the fog, not the shading.
    const data = new Uint8Array([165, 165, 165, 255, 255, 255, 255, 255])
    toonRamp = new THREE.DataTexture(data, 2, 1, THREE.RGBAFormat)
    toonRamp.minFilter = THREE.NearestFilter
    toonRamp.magFilter = THREE.NearestFilter
    toonRamp.needsUpdate = true
  }
  return toonRamp
}

/** Drop-in replacement for meshStandardMaterial with stepped shading. */
export function ToonMaterial(props) {
  return <meshToonMaterial gradientMap={getToonRamp()} {...props} />
}

/**
 * The classic checkerboard floor tile texture (procedural, crisp edges).
 * `repeat` = how many 2-tile cells across each axis.
 */
export function useCheckerTexture(repeatX, repeatY) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = SLUDGE.checkerLight
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = SLUDGE.checkerDark
    ctx.fillRect(0, 0, 64, 64)
    ctx.fillRect(64, 64, 64, 64)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
    texture.repeat.set(repeatX, repeatY)
    return texture
  }, [repeatX, repeatY])
}

const GRAY_LIGHT = '#efe4cd' // caps, lids, labels - warm cream
const GRAY_DARK = '#4a423a'  // dark details - warm brown-black

export const PROP_TYPES = ['can', 'box', 'bottle', 'jar', 'bag', 'carton']

export const PROP_DIMS = {
  can:    { h: 0.95, w: 0.50 },
  box:    { h: 1.10, w: 0.70, d: 0.34 },
  bottle: { h: 1.12, w: 0.42 },
  jar:    { h: 0.70, w: 0.54 },
  bag:    { h: 0.95, w: 0.72, d: 0.30 },
  carton: { h: 1.05, w: 0.44, d: 0.44 },
}

function Can({ color }) {
  return (
    <group>
      {/* body */}
      <mesh position={[0, 0.475, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.95, 14]} />
        <ToonMaterial color={GRAY_LIGHT} />
        <Lines />
      </mesh>
      {/* label band */}
      <mesh position={[0, 0.475, 0]}>
        <cylinderGeometry args={[0.255, 0.255, 0.55, 14]} />
        <ToonMaterial color={color} />
        <Lines />
      </mesh>
    </group>
  )
}

function Box({ color }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 1.1, 0.34]} />
        <ToonMaterial color={color} />
        <Lines />
      </mesh>
      {/* label panel on the face */}
      <mesh position={[0, 0.62, 0.176]}>
        <boxGeometry args={[0.5, 0.5, 0.02]} />
        <ToonMaterial color={GRAY_LIGHT} />
        <Lines />
      </mesh>
    </group>
  )
}

function Bottle({ color }) {
  return (
    <group>
      {/* body */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.72, 12]} />
        <ToonMaterial color={color} />
        <Lines />
      </mesh>
      {/* neck */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.09, 0.16, 0.28, 12]} />
        <ToonMaterial color={color} />
        <Lines />
      </mesh>
      {/* cap */}
      <mesh position={[0, 1.06, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.12, 10]} />
        <ToonMaterial color={GRAY_DARK} />
        <Lines />
      </mesh>
    </group>
  )
}

function Jar({ color }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.6, 12]} />
        <ToonMaterial color={color} />
        <Lines />
      </mesh>
      {/* lid */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 12]} />
        <ToonMaterial color={GRAY_LIGHT} />
        <Lines />
      </mesh>
    </group>
  )
}

function Bag({ color }) {
  return (
    <group rotation={[0, 0, 0.03]}>
      {/* slouchy body: two stacked boxes, top one narrower */}
      <mesh position={[0, 0.375, 0]}>
        <boxGeometry args={[0.72, 0.75, 0.3]} />
        <ToonMaterial color={color} />
        <Lines />
      </mesh>
      <mesh position={[0.02, 0.85, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.62, 0.22, 0.24]} />
        <ToonMaterial color={color} />
        <Lines />
      </mesh>
    </group>
  )
}

function Carton({ color }) {
  return (
    <group>
      {/* body */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.44, 0.84, 0.44]} />
        <ToonMaterial color={GRAY_LIGHT} />
        <Lines />
      </mesh>
      {/* colored band */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.45, 0.34, 0.45]} />
        <ToonMaterial color={color} />
        <Lines />
      </mesh>
      {/* gable roof (rotated box reads as the fold) */}
      <mesh position={[0, 0.93, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.32, 0.32, 0.42]} />
        <ToonMaterial color={GRAY_LIGHT} />
        <Lines />
      </mesh>
    </group>
  )
}

const PROP_COMPONENTS = { can: Can, box: Box, bottle: Bottle, jar: Jar, bag: Bag, carton: Carton }

/** A single prop, origin at base center. */
export function Prop({ type = 'can', color = '#d9b23c', ...rest }) {
  const Comp = PROP_COMPONENTS[type] || Can
  return (
    <group {...rest}>
      <Comp color={color} />
    </group>
  )
}

/**
 * A prop centered for the inspection viewer (origin at prop center,
 * scaled to a comfortable viewing size).
 */
export function InspectionProp({ type = 'can', color = '#d9b23c', meshRef, scale = 1 }) {
  const dims = PROP_DIMS[type] || PROP_DIMS.can
  const s = (1.6 / dims.h) * scale // ~1.6 units tall in the viewer
  return (
    <group ref={meshRef} visible={false} rotation={[0.25, 0, 0]}>
      <group scale={s} position={[0, -(dims.h * s) / 2 / s, 0]}>
        <Prop type={type} color={color} />
      </group>
    </group>
  )
}

// Deterministic pseudo-random from a seed (stable across renders)
function seeded(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * A shelf row of repeated props, filling exactly the bounding box of the
 * old solid strip (PRODUCT_STRIP_SIZE) - the layout never shifts.
 * Supermarket logic: one row = one product, repeated, tiny yaw jitter so
 * it feels stocked by a human. The group is the raycast target.
 */
export function PropRow({ groupRef, position, type = 'can', color = '#d9b23c', seed = 0, density = 1 }) {
  const dims = PROP_DIMS[type] || PROP_DIMS.can

  const layout = useMemo(() => {
    // Fit prop height into the strip box
    const s = (PRODUCT_STRIP_SIZE.y * 0.96) / dims.h
    const width = dims.w * s
    const step = (width * 1.3) / density
    const usable = PRODUCT_STRIP_SIZE.z - width
    const count = Math.max(1, Math.floor(usable / step) + 1)
    const startZ = -((count - 1) * step) / 2
    // +0.05: shelf boards are 0.2 thick around the strip's bottom edge -
    // without the epsilon the props sink into the board (z-fighting)
    const baseY = -PRODUCT_STRIP_SIZE.y / 2 + 0.05
    return { s, step, count, startZ, baseY }
  }, [dims, density])

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: layout.count }).map((_, i) => (
        <group
          key={i}
          position={[0, layout.baseY, layout.startZ + i * layout.step]}
          rotation={[0, (seeded(seed * 31 + i) - 0.5) * 0.5, 0]}
          scale={layout.s}
        >
          <Prop type={type} color={color} />
        </group>
      ))}
    </group>
  )
}

/**
 * Canvas-texture text (no font downloads). Used for signage.
 * Must only render client-side (inside the R3F canvas it always is).
 */
export function useTextTexture(text, { bg = SLUDGE.ui.accent, fg = '#141410', width = 1024, height = 192, font = 'bold 120px "Courier New", monospace' } = {}) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = fg
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2 + 6)
    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    return texture
  }, [text, bg, fg, width, height, font])
}

/** A flat sign plane with canvas text. */
export function TextSign({ text, position, rotation = [0, 0, 0], size = [7.4, 1.2], bg, fg }) {
  const texture = useTextTexture(text, { bg, fg })
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <ToonMaterial map={texture} />
    </mesh>
  )
}

/** Simple cash register for the checkout counter. */
export function CashRegister({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* base */}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.62, 0.28, 0.5]} />
        <ToonMaterial color={GRAY_DARK} />
        <Lines />
      </mesh>
      {/* screen */}
      <mesh position={[0, 0.5, -0.1]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.5, 0.42, 0.06]} />
        <ToonMaterial color={GRAY_DARK} />
        <Lines />
      </mesh>
      <mesh position={[0, 0.5, -0.065]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.42, 0.32, 0.02]} />
        <ToonMaterial color="#8fd4c2" emissive="#8fd4c2" emissiveIntensity={0.35} />
      </mesh>
      {/* keypad */}
      <mesh position={[0, 0.31, 0.14]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.44, 0.2, 0.04]} />
        <ToonMaterial color={GRAY_LIGHT} />
        <Lines />
      </mesh>
    </group>
  )
}

/**
 * Realistic checkout counter: cabinet, counter top, conveyor belt inset,
 * divider bar, bagging tray, kick plate, and a couple of groceries on the
 * belt. Same ~2x6 footprint as the plain box it replaces (top at y~1.81).
 * Origin at floor level, centered.
 */
export function CheckoutCounter({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* cabinet - hero orange, like the screenshot's stand */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.9, 1.7, 6]} />
        <ToonMaterial color={SLUDGE.counter} />
        <Lines />
      </mesh>
      {/* kick plate */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.6, 0.16, 5.7]} />
        <ToonMaterial color="#2c2c2a" />
      </mesh>
      {/* counter top (slightly proud of the cabinet) */}
      <mesh position={[0, 1.76, 0]}>
        <boxGeometry args={[2.1, 0.12, 6.2]} />
        <ToonMaterial color={SLUDGE.counterTop} />
        <Lines />
      </mesh>
      {/* conveyor belt inset */}
      <mesh position={[0, 1.84, 0.9]}>
        <boxGeometry args={[1.5, 0.06, 3.4]} />
        <ToonMaterial color={GRAY_DARK} />
        <Lines />
      </mesh>
      {/* divider bar */}
      <mesh position={[0, 1.92, -0.9]}>
        <boxGeometry args={[1.4, 0.08, 0.12]} />
        <ToonMaterial color={SLUDGE.productAccents[0]} />
        <Lines />
      </mesh>
      {/* bagging tray */}
      <mesh position={[0, 1.83, -2.4]}>
        <boxGeometry args={[1.7, 0.1, 1.2]} />
        <ToonMaterial color={GRAY_LIGHT} />
        <Lines />
      </mesh>
      {/* groceries waiting on the belt */}
      <group position={[0.15, 1.88, 1.5]} rotation={[0, 0.4, 0]} scale={0.75}>
        <Prop type="box" color={SLUDGE.productAccents[2]} />
      </group>
      <group position={[-0.2, 1.88, 0.5]} rotation={[0, 1.2, 0]} scale={0.75}>
        <Prop type="can" color={SLUDGE.productAccents[1]} />
      </group>
    </group>
  )
}

/** A stack of shopping baskets near the entrance. */
export function BasketStack({ position }) {
  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, 0.11 + i * 0.16, 0]} rotation={[0, (seeded(i * 17) - 0.5) * 0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.22, 0.62]} />
            <ToonMaterial color={i % 2 === 0 ? SLUDGE.productAccents[1] : SLUDGE.productAccents[0]} />
            <Lines />
          </mesh>
          {/* handle */}
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[0.7, 0.05, 0.06]} />
            <ToonMaterial color={GRAY_DARK} />
            <Lines />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Ceiling light fixture: a slim emissive tube under each point light. */
export function LightFixture({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.35, 0.12, 3.2]} />
        <ToonMaterial color={GRAY_LIGHT} emissive="#fff6d8" emissiveIntensity={0.9} />
      </mesh>
      {/* hanging rods */}
      <mesh position={[0, 0.35, -1.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
        <ToonMaterial color={GRAY_DARK} />
      </mesh>
      <mesh position={[0, 0.35, 1.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
        <ToonMaterial color={GRAY_DARK} />
      </mesh>
    </group>
  )
}
