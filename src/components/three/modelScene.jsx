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

export function Model({ sceneItems = [], ...props }) {
  const { nodes } = useGLTF('/models/scene2.glb')

  // Initialize cursor manager (needed for camera controls)
  useCursorManager(false)

  // Create refs for the clickable products
  // Array index mapping: portfolioItems[0] → product1Ref, etc.
  const product1Ref = useRef()
  const product2Ref = useRef()
  const product3Ref = useRef()
  const product4Ref = useRef()
  const product5Ref = useRef()
  const product6Ref = useRef()

  // Create refs for inspection meshes (hidden by default, shown when product is clicked)
  const product1InspectionRef = useRef()
  const product2InspectionRef = useRef()
  const product3InspectionRef = useRef()
  const product4InspectionRef = useRef()
  const product5InspectionRef = useRef()
  const product6InspectionRef = useRef()

  // Setup focus effects for each product using data from portfolioItems
  // NOTE: Array index maps to product number (index 0 → product 1, etc.)
  useFocusEffect(
    product1Ref,
    product1InspectionRef,
    sceneItems[0] // Index 0 → Product 1
  )

  useFocusEffect(
    product2Ref,
    product2InspectionRef,
    sceneItems[1] // Index 1 → Product 2
  )

  useFocusEffect(
    product3Ref,
    product3InspectionRef,
    sceneItems[2] // Index 2 → Product 3
  )

  useFocusEffect(
    product4Ref,
    product4InspectionRef,
    sceneItems[3] // Index 3 → Product 4
  )

  useFocusEffect(
    product5Ref,
    product5InspectionRef,
    sceneItems[4] // Index 4 → Product 5
  )

  useFocusEffect(
    product6Ref,
    product6InspectionRef,
    sceneItems[5] // Index 5 → Product 6
  )

  return (
    <group {...props} dispose={null}>
      {/* Point Lights from scene2.glb */}
      <pointLight intensity={100} decay={2} position={[-5.45, 7.63, 22.528]} rotation={[-Math.PI / 2, 0, 0]} />
      <pointLight intensity={100} decay={2} position={[-5.027, 7.597, 5.715]} rotation={[-Math.PI / 2, 0, 0]} />
      <pointLight intensity={100} decay={2} position={[-5.027, 7.597, -5.618]} rotation={[-Math.PI / 2, 0, 0]} />
      <pointLight intensity={100} decay={2} position={[6.889, 7.597, -5.618]} rotation={[-Math.PI / 2, 0, 0]} />
      <pointLight intensity={100} decay={2} position={[6.889, 7.597, 5.715]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Products from scene2.glb - Now Clickable */}
      <mesh ref={product5Ref} geometry={nodes.peoduct_5?.geometry} material={nodes.peoduct_5?.material} position={[-0.859, 2.708, 0.496]} rotation={[0, 0, -Math.PI]} scale={[-0.313, 0.583, 8.403]}>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>
      <mesh ref={product2Ref} geometry={nodes.product_2?.geometry} material={nodes.product_2?.material} position={[-9.187, 2.708, 0.176]} rotation={[0, 0, -Math.PI]} scale={[-0.313, 0.583, 8.403]}>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>
      <mesh ref={product1Ref} geometry={nodes.produc_1?.geometry} material={nodes.produc_1?.material} position={[-9.187, 4.656, 0.176]} rotation={[0, 0, -Math.PI]} scale={[-0.313, 0.583, 8.403]}>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>
      <mesh ref={product3Ref} geometry={nodes.product_3?.geometry} material={nodes.product_3?.material} position={[-9.187, 0.997, 0.176]} rotation={[0, 0, -Math.PI]} scale={[-0.313, 0.583, 8.403]}>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>
      <mesh ref={product6Ref} geometry={nodes.product_6?.geometry} material={nodes.product_6?.material} position={[-0.914, 0.997, 0.496]} rotation={[0, 0, -Math.PI]} scale={[-0.313, 0.583, 8.403]}>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>
      <mesh ref={product4Ref} geometry={nodes.product_4?.geometry} material={nodes.product_4?.material} position={[-0.914, 4.734, 0.496]} rotation={[0, 0, -Math.PI]} scale={[-0.313, 0.583, 8.403]}>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>
      <mesh geometry={nodes.Cube016?.geometry} material={nodes.Cube016?.material} position={[-6.502, 0.783, 21.541]} scale={[0.989, 1, 3.027]}>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      {/* Inspection Meshes - Hidden by default, shown when product is clicked */}
      {/* Dynamically loaded from Sanity CMS custom GLB models */}
      <InspectionMesh
        modelUrl={sceneItems[0]?.inspectionModelUrl}
        scale={sceneItems[0]?.inspectionScale || 1}
        meshRef={product1InspectionRef}
      />
      <InspectionMesh
        modelUrl={sceneItems[1]?.inspectionModelUrl}
        scale={sceneItems[1]?.inspectionScale || 1}
        meshRef={product2InspectionRef}
      />
      <InspectionMesh
        modelUrl={sceneItems[2]?.inspectionModelUrl}
        scale={sceneItems[2]?.inspectionScale || 1}
        meshRef={product3InspectionRef}
      />
      <InspectionMesh
        modelUrl={sceneItems[3]?.inspectionModelUrl}
        scale={sceneItems[3]?.inspectionScale || 1}
        meshRef={product4InspectionRef}
      />
      <InspectionMesh
        modelUrl={sceneItems[4]?.inspectionModelUrl}
        scale={sceneItems[4]?.inspectionScale || 1}
        meshRef={product5InspectionRef}
      />
      <InspectionMesh
        modelUrl={sceneItems[5]?.inspectionModelUrl}
        scale={sceneItems[5]?.inspectionScale || 1}
        meshRef={product6InspectionRef}
      />

      {/* Shelves from scene2.glb */}
      <mesh geometry={nodes.Cube?.geometry} material={nodes.Cube?.material} position={[-10.433, 3, 0]} rotation={[-Math.PI, 0, -Math.PI]} scale={[0.5, 3, 12]}>
        <mesh geometry={nodes.Cube002?.geometry} material={nodes.Cube002?.material} position={[-2.4, 0.333, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <mesh geometry={nodes.Cube003?.geometry} material={nodes.Cube003?.material} position={[-2.4, -0.9, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <mesh geometry={nodes.Cube004?.geometry} material={nodes.Cube004?.material} position={[-2.4, -0.333, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      <mesh geometry={nodes.Cube007?.geometry} material={nodes.Cube007?.material} position={[0.5, 3, 0]} scale={[0.5, 3, 12]}>
        <mesh geometry={nodes.Cube001?.geometry} material={nodes.Cube001?.material} position={[-2.4, -0.333, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <mesh geometry={nodes.Cube005?.geometry} material={nodes.Cube005?.material} position={[-2.4, -0.9, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <mesh geometry={nodes.Cube006?.geometry} material={nodes.Cube006?.material} position={[-2.4, 0.333, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      <mesh geometry={nodes.Cube008?.geometry} material={nodes.Cube008?.material} position={[12.416, 3, 0]} scale={[0.5, 3, 12]}>
        <mesh geometry={nodes.Cube009?.geometry} material={nodes.Cube009?.material} position={[-2.4, 0.333, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <mesh geometry={nodes.Cube010?.geometry} material={nodes.Cube010?.material} position={[-2.4, -0.9, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <mesh geometry={nodes.Cube014?.geometry} material={nodes.Cube014?.material} position={[-2.4, -0.333, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      <mesh geometry={nodes.Cube015?.geometry} material={nodes.Cube015?.material} position={[1.483, 3, 0]} rotation={[-Math.PI, 0, -Math.PI]} scale={[0.5, 3, 12]}>
        <mesh geometry={nodes.Cube011?.geometry} material={nodes.Cube011?.material} position={[-2.4, -0.333, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <mesh geometry={nodes.Cube012?.geometry} material={nodes.Cube012?.material} position={[-2.4, -0.9, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <mesh geometry={nodes.Cube013?.geometry} material={nodes.Cube013?.material} position={[-2.4, 0.333, 0]} scale={[1.4, 0.033, 1]}>
          <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
        </mesh>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      <mesh geometry={nodes.Cube021?.geometry} material={nodes.Cube021?.material} position={[-9.233, 4, 0]} rotation={[-Math.PI, 0, -Math.PI]} scale={[0.7, 0.1, 12]}>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>

      <mesh geometry={nodes.Cube025?.geometry} material={nodes.Cube025?.material} position={[-8.937, 2.138, 21.609]} rotation={[0, 0, -Math.PI]} scale={[-0.529, 2.226, 0.679]}>
        <Edges lineWidth={1} scale={1.0} threshold={15} color="black" />
      </mesh>
    </group>
  )
}

// Preload main scene model
useGLTF.preload('/models/scene2.glb')

// Note: Inspection models are now loaded dynamically from Sanity CMS
// No preloading needed - models load on-demand when portfolio items are clicked
