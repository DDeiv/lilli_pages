'use client'

import React, { useRef } from 'react'
import { useGLTF, Edges } from '@react-three/drei'
import { useCursorManager } from './CursorManager'
import { useFocusEffect } from './useFocusEffect'

// Helper component to load and display model for inspection
// Uses procedural Three.js geometries - no external files needed!
function InspectionMesh({ modelUrl, scale = 1, meshRef }) {
  // If no model URL, return empty mesh
  if (!modelUrl) {
    return (
      <mesh ref={meshRef} visible={false} position={[0, 0, 0]}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    );
  }

  // Determine which geometry to use based on path
  // Using procedural geometries means no external files needed - works instantly!
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
  } else {
    // For custom GLB files (when you add them later)
    // For now, fallback to cube
    console.log(`Custom model selected: ${modelUrl} - using cube placeholder`);
    geometryComponent = <boxGeometry args={[0.5, 0.5, 0.5]} />;
  }

  // Render the procedural shape
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
      <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
    </mesh>
  );
}

export function Model({ sceneItems = [], active = true, isMobile = false, ...props }) {
  const { nodes } = useGLTF('/models/scene2.glb')

  // Initialize cursor manager (needed for camera controls)
  useCursorManager(false)

  // ... (refs remain same) ...
  const product1Ref = useRef()
  const product2Ref = useRef()
  const product3Ref = useRef()
  const product4Ref = useRef()
  const product5Ref = useRef()
  const product6Ref = useRef()

  const product1InspectionRef = useRef()
  const product2InspectionRef = useRef()
  const product3InspectionRef = useRef()
  const product4InspectionRef = useRef()
  const product5InspectionRef = useRef()
  const product6InspectionRef = useRef()

  // ... (useFocusEffect calls remain same) ...
  useFocusEffect(product1Ref, product1InspectionRef, sceneItems[0], active)
  useFocusEffect(product2Ref, product2InspectionRef, sceneItems[1], active)
  useFocusEffect(product3Ref, product3InspectionRef, sceneItems[2], active)
  useFocusEffect(product4Ref, product4InspectionRef, sceneItems[3], active)
  useFocusEffect(product5Ref, product5InspectionRef, sceneItems[4], active)
  useFocusEffect(product6Ref, product6InspectionRef, sceneItems[5], active)

  // Mobile Layout Configuration
  // Align products in a single row along Z axis, each with its own shelf unit
  // X = -5 (centered relative to camera at -12 looking at -5)
  // Y = 3 (eye level)
  // Z = spaced out every 8 units (wider spacing for distinct shelf units)

  const shelfSpacing = 8;
  const startZ = -20; // Start earlier to center the collection

  const mobilePositions = {
    // Products
    prod1: [-5, 3, startZ],
    prod2: [-5, 3, startZ + shelfSpacing],
    prod3: [-5, 3, startZ + shelfSpacing * 2],
    prod4: [-5, 3, startZ + shelfSpacing * 3],
    prod5: [-5, 3, startZ + shelfSpacing * 4],
    prod6: [-5, 3, startZ + shelfSpacing * 5],

    // Shelves (one per product)
    shelf1: [-5.5, 3, startZ],
    shelf2: [-5.5, 3, startZ + shelfSpacing],
    shelf3: [-5.5, 3, startZ + shelfSpacing * 2],
    shelf4: [-5.5, 3, startZ + shelfSpacing * 3],
    shelf5: [-5.5, 3, startZ + shelfSpacing * 4],
    shelf6: [-5.5, 3, startZ + shelfSpacing * 5],

    // Scale for individual shelf unit
    shelfScale: [0.5, 3, 6]
  };

  return (
    <group {...props} dispose={null}>
      {/* Point Lights from scene2.glb */}
      <pointLight intensity={100} decay={2} position={[-5.45, 7.63, 22.528]} rotation={[-Math.PI / 2, 0, 0]} />
      <pointLight intensity={100} decay={2} position={[-5.027, 7.597, 5.715]} rotation={[-Math.PI / 2, 0, 0]} />
      <pointLight intensity={100} decay={2} position={[-5.027, 7.597, -5.618]} rotation={[-Math.PI / 2, 0, 0]} />
      <pointLight intensity={100} decay={2} position={[6.889, 7.597, -5.618]} rotation={[-Math.PI / 2, 0, 0]} />
      <pointLight intensity={100} decay={2} position={[6.889, 7.597, 5.715]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Products - Conditional Positioning */}
      {/* Product 1 */}
      <mesh
        ref={product1Ref}
        geometry={nodes.produc_1?.geometry}
        position={isMobile ? mobilePositions.prod1 : [-9.187, 4.656, 0.176]}
        rotation={[0, 0, -Math.PI]}
        scale={[-0.313, 0.583, 8.403]}
      >
        <meshStandardMaterial color="#0066ff" />
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      {/* Product 2 */}
      <mesh
        ref={product2Ref}
        geometry={nodes.product_2?.geometry}
        position={isMobile ? mobilePositions.prod2 : [-9.187, 2.708, 0.176]}
        rotation={[0, 0, -Math.PI]}
        scale={[-0.313, 0.583, 8.403]}
      >
        <meshStandardMaterial color="#0066ff" />
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      {/* Product 3 */}
      <mesh
        ref={product3Ref}
        geometry={nodes.product_3?.geometry}
        position={isMobile ? mobilePositions.prod3 : [-9.187, 0.997, 0.176]}
        rotation={[0, 0, -Math.PI]}
        scale={[-0.313, 0.583, 8.403]}
      >
        <meshStandardMaterial color="#0066ff" />
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      {/* Product 4 */}
      <mesh
        ref={product4Ref}
        geometry={nodes.product_4?.geometry}
        position={isMobile ? mobilePositions.prod4 : [-0.914, 4.734, 0.496]}
        rotation={[0, 0, -Math.PI]}
        scale={[-0.313, 0.583, 8.403]}
      >
        <meshStandardMaterial color="#0066ff" />
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      {/* Product 5 */}
      <mesh
        ref={product5Ref}
        geometry={nodes.peoduct_5?.geometry}
        position={isMobile ? mobilePositions.prod5 : [-0.859, 2.708, 0.496]}
        rotation={[0, 0, -Math.PI]}
        scale={[-0.313, 0.583, 8.403]}
      >
        <meshStandardMaterial color="#0066ff" />
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      {/* Product 6 */}
      <mesh
        ref={product6Ref}
        geometry={nodes.product_6?.geometry}
        position={isMobile ? mobilePositions.prod6 : [-0.914, 0.997, 0.496]}
        rotation={[0, 0, -Math.PI]}
        scale={[-0.313, 0.583, 8.403]}
      >
        <meshStandardMaterial color="#0066ff" />
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      <mesh geometry={nodes.Cube016?.geometry} position={[-6.502, 0.783, 21.541]} scale={[0.989, 1, 3.027]}>
        <meshStandardMaterial color="#0066ff" />
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      {/* Inspection Meshes */}
      <InspectionMesh modelUrl={sceneItems[0]?.inspectionModelUrl} scale={sceneItems[0]?.inspectionScale || 1} meshRef={product1InspectionRef} />
      <InspectionMesh modelUrl={sceneItems[1]?.inspectionModelUrl} scale={sceneItems[1]?.inspectionScale || 1} meshRef={product2InspectionRef} />
      <InspectionMesh modelUrl={sceneItems[2]?.inspectionModelUrl} scale={sceneItems[2]?.inspectionScale || 1} meshRef={product3InspectionRef} />
      <InspectionMesh modelUrl={sceneItems[3]?.inspectionModelUrl} scale={sceneItems[3]?.inspectionScale || 1} meshRef={product4InspectionRef} />
      <InspectionMesh modelUrl={sceneItems[4]?.inspectionModelUrl} scale={sceneItems[4]?.inspectionScale || 1} meshRef={product5InspectionRef} />
      <InspectionMesh modelUrl={sceneItems[5]?.inspectionModelUrl} scale={sceneItems[5]?.inspectionScale || 1} meshRef={product6InspectionRef} />

      {/* Shelves - Conditional Rendering */}
      {isMobile ? (
        // Mobile: Individual shelves for each product
        <>
          <mesh geometry={nodes.Cube?.geometry} position={mobilePositions.shelf1} rotation={[-Math.PI, 0, -Math.PI]} scale={mobilePositions.shelfScale}>
            <meshStandardMaterial color="#0066ff" />
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>
          <mesh geometry={nodes.Cube?.geometry} position={mobilePositions.shelf2} rotation={[-Math.PI, 0, -Math.PI]} scale={mobilePositions.shelfScale}>
            <meshStandardMaterial color="#0066ff" />
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>
          <mesh geometry={nodes.Cube?.geometry} position={mobilePositions.shelf3} rotation={[-Math.PI, 0, -Math.PI]} scale={mobilePositions.shelfScale}>
            <meshStandardMaterial color="#0066ff" />
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>
          <mesh geometry={nodes.Cube?.geometry} position={mobilePositions.shelf4} rotation={[-Math.PI, 0, -Math.PI]} scale={mobilePositions.shelfScale}>
            <meshStandardMaterial color="#0066ff" />
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>
          <mesh geometry={nodes.Cube?.geometry} position={mobilePositions.shelf5} rotation={[-Math.PI, 0, -Math.PI]} scale={mobilePositions.shelfScale}>
            <meshStandardMaterial color="#0066ff" />
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>
          <mesh geometry={nodes.Cube?.geometry} position={mobilePositions.shelf6} rotation={[-Math.PI, 0, -Math.PI]} scale={mobilePositions.shelfScale}>
            <meshStandardMaterial color="#0066ff" />
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>
        </>
      ) : (
        // Desktop: Original shelves
        <>
          <mesh geometry={nodes.Cube?.geometry} position={[-10.433, 3, 0]} rotation={[-Math.PI, 0, -Math.PI]} scale={[0.5, 3, 12]}>
            <meshStandardMaterial color="#0066ff" />
            <mesh geometry={nodes.Cube002?.geometry} position={[-2.4, 0.333, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <mesh geometry={nodes.Cube003?.geometry} position={[-2.4, -0.9, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <mesh geometry={nodes.Cube004?.geometry} position={[-2.4, -0.333, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>

          <mesh geometry={nodes.Cube007?.geometry} position={[0.5, 3, 0]} scale={[0.5, 3, 12]}>
            <meshStandardMaterial color="#0066ff" />
            <mesh geometry={nodes.Cube001?.geometry} position={[-2.4, -0.333, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <mesh geometry={nodes.Cube005?.geometry} position={[-2.4, -0.9, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <mesh geometry={nodes.Cube006?.geometry} position={[-2.4, 0.333, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>

          <mesh geometry={nodes.Cube008?.geometry} position={[12.416, 3, 0]} scale={[0.5, 3, 12]}>
            <meshStandardMaterial color="#0066ff" />
            <mesh geometry={nodes.Cube009?.geometry} position={[-2.4, 0.333, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <mesh geometry={nodes.Cube010?.geometry} position={[-2.4, -0.9, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <mesh geometry={nodes.Cube014?.geometry} position={[-2.4, -0.333, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>

          <mesh geometry={nodes.Cube015?.geometry} position={[1.483, 3, 0]} rotation={[-Math.PI, 0, -Math.PI]} scale={[0.5, 3, 12]}>
            <meshStandardMaterial color="#0066ff" />
            <mesh geometry={nodes.Cube011?.geometry} position={[-2.4, -0.333, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <mesh geometry={nodes.Cube012?.geometry} position={[-2.4, -0.9, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <mesh geometry={nodes.Cube013?.geometry} position={[-2.4, 0.333, 0]} scale={[1.4, 0.033, 1]}>
              <meshStandardMaterial color="#0066ff" />
              <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
            </mesh>
            <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
          </mesh>
        </>
      )}

      <mesh geometry={nodes.Cube021?.geometry} position={[-9.233, 4, 0]} rotation={[-Math.PI, 0, -Math.PI]} scale={[0.7, 0.1, 12]}>
        <meshStandardMaterial color="#0066ff" />
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      <mesh geometry={nodes.Cube025?.geometry} position={[-8.937, 2.138, 21.609]} rotation={[-Math.PI, 0, -Math.PI]} scale={[-0.529, 2.226, 0.679]}>
        <meshStandardMaterial color="#0066ff" />
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>
    </group>
  )
}

// Preload main scene model
useGLTF.preload('/models/scene2.glb')

// Note: Inspection models are now loaded dynamically from Sanity CMS
// No preloading needed - models load on-demand when portfolio items are clicked
