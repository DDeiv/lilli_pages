# Lilli Portfolio - Interactive 3D Gallery

## Project Overview

An interactive portfolio website with a unique shop/gallery metaphor, featuring an immersive 3D experience built with Next.js and React Three Fiber. The site offers two viewing modes: an interactive 3D gallery with FPS-style navigation and a traditional portfolio page powered by Sanity CMS.

### Key Concept
The portfolio presents work as products on shelves in a 3D store environment. Users can explore by navigating through the space, examining items up close in inspection mode, and viewing detailed project pages. A Windows 95-inspired UI provides a retro aesthetic that contrasts with the modern 3D technology. Content is managed through Sanity CMS for easy updates.

---

## Technical Stack

### Core Technologies
- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library
- **React Three Fiber 9.3.0** - React renderer for Three.js
- **Three.js 0.180.0** - 3D graphics library
- **Tailwind CSS 4** - Styling

### Content Management
- **Sanity CMS 4.15.0** - Headless CMS for portfolio content
- **@sanity/client** - Client for fetching data
- **@sanity/image-url** - Image URL builder
- **next-sanity** - Next.js integration

### 3D & Animation Libraries
- **@react-three/drei 10.7.6** - Useful helpers for R3F (ScrollControls, Environment, Edges, useGLTF)
- **GSAP 3.13.0** - Animation library

### State Management
- **Zustand 5.0.8** - Lightweight state management with persist middleware

---

## Project Structure

```
src/
├── app/
│   ├── layout.js                    # Root layout
│   ├── page.js                      # Home page (3D gallery)
│   ├── portfolio/
│   │   ├── page.js                  # Portfolio list page (all items)
│   │   └── [id]/
│   │       ├── page.js              # Portfolio detail page
│   │       └── ImageGallery.jsx     # Client component for gallery
│   └── boring/
│       └── page.js                  # Lightweight alternative page
├── components/
│   └── three/
│       ├── mainCanvas.jsx           # Main 3D canvas wrapper
│       ├── modelScene.jsx           # 3D scene with shelves and products
│       ├── cameraControlFPS.jsx     # FPS-style camera controls
│       ├── CursorManager.jsx        # Cursor state management hook
│       ├── CashierDialogue.jsx      # Welcome dialogue (Windows 95 style)
│       ├── MobileShelfView.jsx      # Mobile-specific navigation
│       ├── CursorHintWrapper.jsx    # Desktop cursor hints
│       ├── useFocusEffect.jsx       # Hook for clickable objects & inspection
│       └── InspectionOverlay.jsx    # Product inspection UI overlay
├── data/
│   └── portfolioItems.js            # Re-exports Sanity query functions
├── lib/
│   ├── sanity.js                    # Sanity client configuration
│   └── sanityQueries.js             # GROQ queries for fetching data
├── hooks/
│   └── useIsMobile.js               # Mobile detection hook
└── store/
    └── useSceneStore.js             # Zustand store with session persistence

public/
├── models/
│   └── scene2.glb                   # 3D model (shelves + products)
└── images/
    └── path.jpg                     # Environment map for lighting

../lilli-sanity-studio/              # Separate Sanity Studio project
├── sanity.config.js                 # Studio configuration
├── schemaTypes/
│   ├── index.js                     # Schema exports
│   └── portfolioItem.js             # Portfolio item schema
└── package.json                     # Studio dependencies
```

---

## Sanity CMS Integration

### Studio Setup
- **Location**: `/lilli-sanity-studio/` (separate project)
- **Project ID**: `l6y4tq53`
- **Dataset**: `production`
- **Studio URL**: http://localhost:3333 (when running)
- **Free Tier**: Unlimited documents, 10GB bandwidth/month, 5GB assets

### Portfolio Item Schema
Located at `/lilli-sanity-studio/schemaTypes/portfolioItem.js`:

**Fields**:
- `id` (slug) - URL identifier
- `name` (string) - Project name
- `type` (string) - Project type (e.g., "Web Application")
- `description` (text) - Short description (max 200 chars)
- `detailedDescription` (text) - Full description for detail page
- `showInScene` (boolean) - Display in 3D gallery
- `sceneIndex` (number 0-5) - Position on shelf (if showInScene true)
- `link` (url) - Optional external project URL
- `gallery` (array) - Image gallery with caption and alt text

### Data Fetching
- **Client**: `/src/lib/sanity.js` - Sanity client configuration
- **Queries**: `/src/lib/sanityQueries.js` - GROQ queries
- **Functions**:
  - `getAllItems()` - Fetch all portfolio items
  - `getItemById(id)` - Fetch single item by ID
  - `getSceneItems()` - Fetch only items with `showInScene: true`
  - `getItemBySceneIndex(index)` - Get item by array position

### Array Index Mapping to 3D Scene
Items with `showInScene: true` are ordered by `sceneIndex` (0-5) and mapped to 3D products:
- `sceneIndex: 0` → product1Ref (top left shelf)
- `sceneIndex: 1` → product2Ref (middle left shelf)
- `sceneIndex: 2` → product3Ref (bottom left shelf)
- `sceneIndex: 3` → product4Ref (top right shelf)
- `sceneIndex: 4` → product5Ref (middle right shelf)
- `sceneIndex: 5` → product6Ref (bottom right shelf)

### Adding Content to Sanity
1. Start Sanity Studio: `npm run dev` in `/lilli-sanity-studio/`
2. Open http://localhost:3333
3. Click "Portfolio Item" → "Create"
4. Fill in fields and click "Publish"
5. Content automatically appears on website

---

## Key Features & Components

### 1. Welcome Experience (CashierDialogue)
- **Location**: `src/components/three/CashierDialogue.jsx`
- **Purpose**: Initial dialogue window that appears at cashier location
- **Design**: Windows 95-style dialog box with gradient background
- **Options**:
  - **Explore 3D Gallery**: Unlocks FPS camera, engages pointer lock
  - **View All Projects**: Navigates to `/portfolio` page
- **Behavior**:
  - Only shows on first visit (at cashier)
  - Won't show when returning from portfolio (state persisted in sessionStorage)

### 2. 3D Scene with Clickable Products (modelScene.jsx)
- **Location**: `src/components/three/modelScene.jsx`
- **Data Source**: Fetches from Sanity via `getSceneItems()`
- **3D Assets**: Loads `scene2.glb` containing shelves and products
- **Rendering**: Uses `<Edges>` for cartoon-style black outlines
- **Products**: 6 clickable product meshes mapped to Sanity data
- **Inspection Meshes**: 6 hidden colored cubes for inspection view
- **Lighting**: 5 point lights for scene illumination
- **Interactivity**: Products glow orange on hover (desktop), clickable via crosshair

### 3. Product Inspection System (useFocusEffect + InspectionOverlay)
- **Hook**: `src/components/three/useFocusEffect.jsx`
- **Overlay**: `src/components/three/InspectionOverlay.jsx`
- **Purpose**: Click products to view detailed information
- **Features**:
  - **Desktop**: Aim crosshair, click to inspect, orange hover glow
  - **Mobile**: Tap product to inspect
  - **Inspection Mode**:
    - Separate 3D canvas with colored cube
    - Drag to rotate with inertia physics
    - Auto-rotation when idle
    - Camera locked in main scene
    - Cursor automatically shown
    - Windows 95-style info panel
  - **Navigation**: "SHOW MORE" links to `/portfolio/[id]` detail page
  - **Exit**: Click X button to return

### 4. Portfolio Pages

#### List Page (/portfolio)
- **Location**: `src/app/portfolio/page.js`
- **Purpose**: Display all portfolio items (scene + non-scene)
- **Data**: Fetches all items from Sanity via `getAllItems()`
- **Features**:
  - Grid layout with Windows 95 cards
  - "3D" badge for items in scene
  - Links to detail pages
  - Back button to 3D gallery

#### Detail Page (/portfolio/[id])
- **Location**: `src/app/portfolio/[id]/page.js`
- **Purpose**: Show full project details with gallery
- **Data**: Fetches single item via `getItemById(id)`
- **Features**:
  - Image gallery with navigation (via ImageGallery component)
  - Full project description
  - External link display
  - "IN 3D GALLERY" badge
  - Navigation back to portfolio list or 3D gallery

### 5. Camera Controls

#### Desktop (cameraControlFPS.jsx)
- **Location**: `src/components/three/cameraControlFPS.jsx`
- **Behavior**: FPS-style mouse look with scroll-based movement + pointer lock API
- **Features**:
  - **Scroll Movement**: Camera follows predefined path (CatmullRomCurve3) based on scroll position
  - **Mouse Look**: Unlimited yaw, clamped pitch (±80°) via pointer lock
  - **Cashier Trigger**: When camera reaches cashier (distance < 2.5m):
    - Pre-blocks scroll at 4.0m distance to prevent overshoot
    - Freezes camera position and disables ScrollControls damping
    - Locks camera and animates to face cashier (1.5s GSAP animation)
    - Shows dialogue after animation completes
  - **Dialogue Interaction**: After clicking "Explore 3D Gallery":
    - Rotates camera 90° left (1s animation)
    - Restores scroll position to exact value at cashier
    - Re-enables scroll with original damping restored
    - Unlocks camera for continued exploration
  - **Scroll Blocking**: Wheel/touchmove events prevented during dialogue sequence
  - **Manual Cursor Toggle**: Press X/ESC to show/hide cursor
  - **State Persistence**: Camera position/rotation saved to sessionStorage
  - **Return Behavior**: Restores exact position when navigating back from portfolio

#### Mobile (MobileShelfView.jsx)
- **Location**: `src/components/three/MobileShelfView.jsx`
- **Behavior**: Swipe left/right to browse shelves
- **State Persistence**: Also saves/restores camera position
- **Instructions**: "SWIPE LEFT/RIGHT TO BROWSE • TAP OBJECTS TO INSPECT"

### 6. State Management (useSceneStore)
- **Location**: `src/store/useSceneStore.js`
- **Technology**: Zustand with persist middleware
- **Storage**: sessionStorage (clears on browser close)

#### State Variables:
```javascript
{
  cameraLocked: true,          // Full camera movement lock
  showDialogue: true,          // Dialogue visibility
  cameraPosition: null,        // Saved camera position {x, y, z}
  cameraRotation: null,        // Saved camera rotation {x, y}
}
```

**Persistence Strategy**:
- Only `cameraPosition` and `cameraRotation` are persisted
- Dialogue state NOT persisted (shows fresh each session)
- Enables "back to gallery" to return to same viewpoint

---

## Design Aesthetic

### Windows 95 Theme
- **UI Elements**: Dialog boxes, buttons, title bars
- **Colors**: Gradient grays (`#e5e5e5` to `#d0d0d0`), blue title bars (`#000080` to `#1084d0`)
- **Borders**:
  - Containers: 6px outset #d0d0d0
  - Text areas: 3px inset #808080
  - Buttons: 2px outset/inset toggle
- **Shadows**: Multi-layer box-shadows for authentic 3D effect
- **Font**: `Courier New, monospace`
- **Buttons**: No press effects (removed for cleaner UX)

### 3D Visual Style
- **Edges**: Black outlines on all meshes (cel-shaded look)
- **Lighting**: Warm point lights
- **Models**: Low-poly aesthetic

---

## User Flow

```
1. User lands on site → 3D scene loads at cashier
   ↓
2. CashierDialogue appears (camera locked)
   ↓
3. User chooses:
   a) "Explore 3D Gallery" → FPS unlocked, pointer lock engaged
   b) "View All Projects" → Navigate to /portfolio
   ↓
4a. Desktop: Mouse look FPS, crosshair aiming
4b. Mobile: Swipe navigation
   ↓
5. Browse products on shelves
   ↓
6. Click product → Inspection overlay
   - Colored cube rotates
   - Product info displayed
   - "SHOW MORE" button
   ↓
7a. Click "SHOW MORE" → /portfolio/[id] detail page
7b. Click X → Return to 3D scene (same position)
   ↓
8. From /portfolio pages, "Back to 3D Gallery" → Returns to saved position
```

---

## Development Notes

### Manual Cursor Toggle
- **Trigger**: Press X or ESC keys (when not in dialogue/inspection)
- **Flag**: `data-cursor-manual="true"` attribute on body element
- **Behavior**:
  - Prevents automatic pointer lock re-engagement
  - Preserved until user clicks canvas or toggles again
  - Inspection mode and camera restoration respect flag

### Inspection Mode
- **Trigger**: Raycasting from crosshair (desktop) or tap (mobile)
- **Event**: `inspection-mode` custom event with `{locked: boolean}`
- **Camera**: Locks in main scene, separate camera for inspection canvas
- **Exit**: X button only (keyboard exit removed to prevent conflicts)
- **Cursor**: Automatically shown when entering, hidden when exiting (unless manual flag set)

### Camera State Restoration
- **When**: Navigating back from `/portfolio` pages to `/` (home)
- **Storage**: sessionStorage with key `gallery-state`
- **Data**: Position {x, y, z} and rotation {x, y}
- **Save Frequency**: Every 500ms while exploring
- **Restoration**: Automatic on mount if saved state exists and dialogue is hidden

### Async Data Fetching
- **Pages**: All portfolio pages are async server components
- **Gallery**: ImageGallery is client component (uses useState)
- **3D Scene**: Data fetched in page.js, passed as props to MainCanvas → Model
- **Error Handling**: Returns empty arrays on fetch errors, graceful degradation

### Mobile Detection
- **Hook**: `useIsMobile()` at `src/hooks/useIsMobile.js`
- **Usage**: Conditionally renders MobileShelfView vs CameraFPS
- **Mounting**: Uses `mounted` state to prevent hydration mismatches

---

## Scripts

### Next.js App (lilli-prova)
```bash
cd "/Users/deiv/Desktop/lavoro/Lilli portfolio/web pages/lilli-prova"
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm start        # Run production server
```

### Sanity Studio (lilli-sanity-studio)
```bash
cd "/Users/deiv/Desktop/lavoro/Lilli portfolio/web pages/lilli-sanity-studio"
npm run dev      # Start studio at localhost:3333
npm run build    # Build studio for deployment
```

---

## Common Tasks

### Adding Content to Portfolio

**Via Sanity Studio** (Recommended):
1. Open http://localhost:3333
2. Click "Portfolio Item" → "Create"
3. Fill in all fields:
   - Generate slug from name
   - Add description (max 200 chars for 3D scene)
   - Toggle "Show in 3D Scene" if you want it on shelves
   - Set Scene Position (0-5) for shelf placement
   - Upload gallery images with captions
4. Click "Publish"
5. Refresh your Next.js app to see changes

### Updating an Existing Product
1. Open Sanity Studio (localhost:3333)
2. Click the item in the list
3. Make changes
4. Click "Publish"

### Changing Scene Index (Shelf Position)
1. Open item in Sanity Studio
2. Toggle "Show in 3D Scene" to ON
3. Set "Scene Position" to 0-5:
   - 0 = Top left shelf
   - 1 = Middle left shelf
   - 2 = Bottom left shelf
   - 3 = Top right shelf
   - 4 = Middle right shelf
   - 5 = Bottom right shelf
4. Publish changes

### Modifying Dialogue
- Edit `CashierDialogue.jsx` for text or button labels
- Update handlers for custom navigation behavior
- Styling follows Windows 95 aesthetic

---

## Deployment

### Vercel Deployment (Recommended)

**Next.js App**:
1. Push code to Git repository
2. Import project to Vercel
3. Add environment variable if needed
4. Deploy

**Sanity Studio**:
1. Run `npm run build` in lilli-sanity-studio folder
2. Run `npx sanity deploy` to host on Sanity's CDN
3. Studio will be available at `https://your-project.sanity.studio`

### Environment Variables
Currently none required for basic setup. If adding authentication or features:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Already hardcoded (`l6y4tq53`)
- `NEXT_PUBLIC_SANITY_DATASET` - Already hardcoded (`production`)

---

## Known Issues / Quirks

- Gallery images show placeholder text (need actual image rendering)
- Cursor hint always visible on desktop (could be auto-hidden after timeout)
- Mobile instructions always visible at bottom
- Inspection cubes are placeholder colors (can be customized per project)
- No loading states for Sanity data fetches

---

## File Naming Conventions

- Components: PascalCase (e.g., `CashierDialogue.jsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useIsMobile.js`)
- Stores: camelCase with 'use' prefix (e.g., `useSceneStore.js`)
- Pages: lowercase (Next.js convention)
- JSX for React components, JS for utilities/hooks

---

## Contact & Deployment

- **Repository**: (Add git remote URL here)
- **Deployment**: Optimized for Vercel (Next.js native platform)
- **Sanity Project**: https://www.sanity.io/organizations/oj4eV3OqP/project/l6y4tq53
- **Portfolio Owner**: Lilli

---

*Last Updated: 2025-11-13*
*This document is maintained by Claude Code to help preserve context across sessions.*

---

## Recent Changes (2025-11-13)

### ✅ Sanity CMS Integration
- Integrated Sanity CMS for content management
- Created portfolio item schema with all fields
- Set up Sanity Studio at localhost:3333
- Connected Next.js app to fetch from Sanity
- Created GROQ queries for data fetching
- Migrated from static portfolioItems array to CMS

### ✅ Portfolio Pages & Navigation
- Created `/portfolio` list page showing all items
- Created `/portfolio/[id]` dynamic detail pages
- Added ImageGallery client component for gallery navigation
- Updated InspectionOverlay to link to detail pages
- Changed "Visit Website" button to navigate to `/portfolio`
- Added "Back to Gallery" navigation that preserves camera position

### ✅ Camera State Persistence
- Implemented sessionStorage persistence for camera position/rotation
- Camera saves state every 500ms while exploring
- Returns to exact position when navigating back from portfolio pages
- Dialogue only shows on fresh visits at cashier location
- Fixed restoration logic to prevent unwanted dialogue appearances

### ✅ Cursor Management Improvements
- Added manual cursor toggle with X/ESC keys
- Implemented `data-cursor-manual` flag to prevent auto-hide
- Fixed cursor flickering issues in inspection mode
- Prevented pointer lock from overriding manual cursor visibility
- Camera controls now respect manual cursor state

### ✅ Component Architecture Updates
- Converted portfolio pages to async server components
- Split gallery into separate client component (ImageGallery.jsx)
- Model component now receives sceneItems as prop
- MainCanvas passes Sanity data down to 3D scene
- Improved data flow from server → client boundary

### ✅ Bug Fixes
- Fixed dialogue appearing when returning from portfolio pages
- Fixed camera FPS not locking on second inspection click
- Fixed cursor remaining invisible after inspection exit
- Fixed pointer lock conflicts with manual cursor toggle
- Removed hasExplored flag (was causing dialogue issues)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Sanity CMS Studio                       │
│                   (localhost:3333)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Portfolio Items                                      │  │
│  │  - id, name, type, description                        │  │
│  │  - showInScene, sceneIndex (0-5)                      │  │
│  │  - gallery images, external links                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ GROQ Queries
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js App (localhost:3000)                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Server Components (Async)                          │  │
│  │  - app/page.js → fetch scene items                  │  │
│  │  - app/portfolio/page.js → fetch all items          │  │
│  │  - app/portfolio/[id]/page.js → fetch by ID         │  │
│  └────────────┬────────────────────────────────────────┘  │
│               │ Pass data as props                         │
│               ▼                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Client Components                                   │  │
│  │  - MainCanvas → Model (receives sceneItems)         │  │
│  │  - ImageGallery (useState for navigation)           │  │
│  │  - CashierDialogue, InspectionOverlay               │  │
│  │  - CameraFPS, MobileShelfView                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  State Management (Zustand + sessionStorage)        │  │
│  │  - cameraLocked, showDialogue                        │  │
│  │  - cameraPosition, cameraRotation (persisted)       │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```
