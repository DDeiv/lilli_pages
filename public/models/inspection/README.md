# Inspection 3D Models

This folder is ready for your **custom 3D models** when you want to add them!

## Current Setup: Procedural Shapes ✅

**Good news**: The 5 basic shapes work immediately without any files!

They're **procedurally generated** using Three.js:
- ✅ Cube - Works now!
- ✅ Sphere - Works now!
- ✅ Cylinder - Works now!
- ✅ Cone - Works now!
- ✅ Torus - Works now!

**Benefits:**
- Instant loading (no files needed)
- Zero 404 errors
- Customizable via scale in Sanity
- Perfect for testing/prototyping

## How It Works

When you select "Cube", "Sphere", etc. in Sanity Studio, the code generates the shape on-the-fly using Three.js geometry primitives. No external files needed!

## Adding Your Custom Models (Later)

When you're ready to add your own models:

### Step 1: Add Your .glb Files Here
Place your custom models in this folder:
```
/public/models/inspection/
├── my-model.glb
├── another-model.glb
└── etc.
```

### Step 2: Update Sanity Schema
Edit `/lilli-sanity-studio/schemaTypes/portfolioItem.js`:
```javascript
{
  name: 'inspectionModel',
  options: {
    list: [
      // Basic shapes (procedural - always work)
      {title: 'Cube', value: '/models/inspection/cube.glb'},
      {title: 'Sphere', value: '/models/inspection/sphere.glb'},
      // ... other basics

      // Your custom models:
      {title: 'My Model', value: '/models/inspection/my-model.glb'},
    ]
  }
}
```

### Step 3: Update Code to Load Custom GLB
Edit `/src/components/three/modelScene.jsx` to load custom models:
- Detect custom paths (not matching cube/sphere/etc)
- Use `useGLTF(modelUrl)` to load the actual GLB file
- Render the loaded model instead of procedural shape

## Where to Get Custom Models

- **Create in Blender** - Export as GLB
- **Download free models**:
  - [Poly Pizza](https://poly.pizza/)
  - [Sketchfab](https://sketchfab.com/)
  - [Three.js Examples](https://threejs.org/examples/)
- **Commission an artist** on Fiverr or similar

## Technical Details

### Procedural Shapes (Current)
- Generated in code using Three.js primitives
- Instant loading, zero file size
- Gray color (#cccccc) with black edges
- Scale adjustable in Sanity (0.1 - 5.0)

### Custom GLB Files (When You Add Them)
- Format: GLB (recommended) or GLTF
- Max size: Keep under 5MB for good performance
- Textures: Embedded in GLB file
- Will load from this folder when path doesn't match basic shapes

## Current Model List in Sanity

Available in the "Inspection 3D Model" dropdown:
1. **Cube** → BoxGeometry (1x1x1)
2. **Sphere** → SphereGeometry (r=0.6, 32 segments)
3. **Cylinder** → CylinderGeometry (r=0.5, h=1, 32 segments)
4. **Cone** → ConeGeometry (r=0.6, h=1.2, 32 segments)
5. **Torus** → TorusGeometry (R=0.5, r=0.2, 16/100 segments)

All render with cartoon-style black edges (cel-shading).

## No Files Needed!

This folder is currently empty (except this README) and that's OK! The basic shapes work without files. Only add files here when you want to use your own custom 3D models.
