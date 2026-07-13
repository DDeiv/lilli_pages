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
│       ├── CashierDialogue.jsx      # Welcome dialogue (Windows 95 style)
│       ├── MobileShelfView.jsx      # Mobile-specific navigation
│       ├── CursorHintWrapper.jsx    # Contextual control hint (pointer-lock driven)
│       ├── ScrollBlockOverlay.jsx   # Blocks input during cashier animation
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
  - **Cursor**: Visibility tied 1:1 to pointer lock; ESC frees the cursor, clicking the canvas re-locks
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

### Cursor Policy (simplified 2026-07)
- Cursor visibility is tied 1:1 to the Pointer Lock API - no CSS class juggling.
- Pointer lock engaged = cursor natively hidden + FPS mouse look active.
- ESC (browser built-in) releases pointer lock = cursor visible.
- Clicking the canvas re-engages pointer lock (when not in dialogue/inspection).
- There is NO manual X/ESC cursor toggle anymore; the `hide-cursor` CSS class,
  `data-cursor-manual` attribute, and `CursorManager.jsx` were all removed.
- If `requestPointerLock()` is refused by the browser (e.g. within ~1.3s of a
  previous unlock), the cursor simply stays visible and the user clicks the
  canvas to resume - no stuck states.

### Inspection Mode
- **Trigger**: Raycasting from crosshair (desktop, only while pointer-locked) or tap (mobile)
- **State**: `inspectedItemId` in the Zustand store is the single source of truth;
  CameraFPS subscribes to it to lock/unlock the camera (the old `inspection-mode`
  custom event was removed). Only one item can be inspected at a time.
- **Camera**: Pinned in main scene by useFocusEffect; separate camera for inspection canvas
- **Exit**: X button, ESC/X keys, or clicking outside the inspection card
- **Cursor**: Pointer lock released on entry (cursor appears); exit attempts to re-lock

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

---

## Recent Changes (2026-07-04)

### Cursor & Input Refactor (fixes disappearing-cursor bugs)
- Removed `CursorManager.jsx` and its 7 competing hook instances (one per product
  + one in Model), each of which had its own X/ESC keydown listener and manual
  cursor state fighting the others.
- Removed `hide-cursor` CSS class and `data-cursor-manual` attribute entirely.
  Cursor visibility now follows the real pointer lock state (pointer lock
  natively hides the cursor).
- Inspection exit no longer force-hides the cursor before knowing whether
  pointer lock re-engaged - this was the "invisible cursor, stuck camera" bug
  (Chrome refuses re-lock within ~1.3s of an unlock).
- `CursorHintWrapper` rewritten: shows contextual controls hint driven by
  `pointerlockchange` events instead of MutationObserver on body classes.
- Pointer lock is released when the cashier dialogue appears (previously
  handled by CursorManager; users could get stuck with a locked pointer over
  the dialogue).

### Inspection Flow
- Clicking outside the inspection card now closes it (backdrop intercepts the
  click, which also stops stray clicks reaching the main canvas).
- Only one item can be inspected at a time (guarded via store `inspectedItemId`) -
  previously on mobile a second inspection could stack on top of the first.
- Desktop product clicks only register while pointer lock is engaged (real FPS
  mode check, replacing the fragile canvas-opacity + cursor-class DOM checks).
- Replaced the `inspection-mode` custom event with direct store subscription
  in CameraFPS; yaw/pitch re-synced on inspection exit.

### Bug Fixes
- **Next.js 16**: `/portfolio/[id]` now awaits `params` (was sync access -
  broken in Next 16). This broke the detail page ("boring view") navigation.
- Mobile fresh visit never showed the cashier dialogue (`else if (showDialogue)`
  could never be true since the store initializes it to false). Now any fresh
  visit without saved state starts at the cashier with the dialogue.
- Mobile periodic save passed no third argument to `setCameraState`, writing
  `scrollOffset: undefined`; desktop restore treated `undefined !== null` as
  valid and fed NaN into the curve. Now saves `null` and desktop checks
  `typeof scrollOffset === 'number'`.
- Returning from portfolio now also marks the cashier sequence as completed,
  so scrolling near the cashier can't re-trigger the dialogue animation.

### Performance / Cleanup
- Removed per-frame full-scene material traversal (ran 6x per frame).
- Removed the 500ms debug console.log intervals and most log spam.
- Camera path curve memoized (was rebuilt every render).
- Deleted unused `SludgeLifeDialogue.jsx`.

### Sanity / Higgsfield prep
- `inspectionModelUrl` now reads the `inspectionModel` field from Sanity with
  `coalesce(inspectionModel, "/models/soupsoup2.glb")` fallback, instead of
  hardcoding the same GLB for every item. Per-item models can now be assigned
  in Sanity Studio; the delivery pipeline for Higgsfield-generated GLBs
  (Sanity file upload vs /public folder) is still to be decided.

---

## Recent Changes (2026-07-04, part 2): Scene Scaling, Entry Doors, Cashier Re-Talk

### Scene scales with CMS content
- New `src/lib/sceneLayout.js` is the single source of truth for layout:
  product slots, shelf units, rails, lights, camera path, mobile bounds -
  all generated from the CMS item count.
- Every 6 items (3 left rows + 3 right rows) fills one aisle; a 7th item
  automatically spawns a new aisle (corridors every 12 units on X) and the
  camera path extends to snake through it (even aisles front-to-back, odd
  back-to-front, with crossover swings at the aisle ends).
- All base measurements were extracted from the original hand-placed scene,
  so aisle 0 renders exactly as before. Product row geometries from
  scene2.glb are cycled by shelf height for new aisles.
- Scroll sensitivity is normalized to path length (0.027 world units per
  wheel delta), so walking speed stays constant however long the path gets.
- `Model` now renders via a `ProductRow` component (hooks per component, so
  the row count can vary). Rows without a CMS item render as plain,
  non-clickable shelf stock.
- Mobile: one shelf unit per item, wrap-around scroll bounds computed from
  item count.

### Entry animation (procedural storefront)
- `Storefront` component in modelScene.jsx: facade wall + header + sign +
  two sliding door panels, all plain boxes in the same blue cel-shaded
  style (replaceable with a modeled facade later).
- Doors slide open (pocket-door style, into the walls) via GSAP when the
  camera scrolls past z=31.5, and close again if the user backs out.
  Constants in sceneLayout.js (STOREFRONT_Z, DOOR_OPEN_TRIGGER_Z, etc).
- The camera path now starts outside, passes through the door gap, then
  reaches the cashier.

### Talk to the cashier again
- The cashier (counter + figure) is now interactive: aiming at it within
  12 units while in FPS mode glows orange; clicking dispatches
  'talk-to-cashier'.
- CameraFPS handles it: saves the current view direction, locks the camera,
  releases pointer lock, turns to face the cashier, reopens the dialogue.
- On "EXPLORE 3D GALLERY" after a re-talk, the camera returns to the saved
  view direction instead of the first-time fixed 90° turn.
- Yaw animations use nearest-winding normalization so the camera never
  spins the long way around.

### Sanity schema change (ACTION NEEDED in Studio)
- `sceneIndex` changed from a string dropdown (0-5) to an open number field.
  Existing items with string values still parse, but re-save them in Studio
  to clear validation warnings. Position 6+ creates aisle 2, and so on.
- Fixed: `sceneIndex: 0` was treated as missing (falsy check) in
  sanityQueries.js - now normalized properly.

### Known bug fixed
- Clicking a shelf row that has no CMS item (or an item without an id)
  used to open a broken inspection (camera never locked because
  `inspectedItemId` was never set). Such rows are now non-clickable and
  don't show the hover glow.

---

## Recent Changes (2026-07-04, part 3): Sludge Life Style Swap

Grounded in Terri Vellmann's postmortem ("Sludge Life: Finding The Vibe",
Game Developer): cold gray concrete world, color reserved for products and
characters, toon outlines, hazy fog, VHS "digital grime" on top.

### What changed
- New `src/lib/theme.js` (SLUDGE object) - single source of truth for all
  colors (scene + UI). Tune the look there.
- Scene recolor: shelves/facade/rails/counter in concrete grays; product
  rows carry the color (6 muted-loud accents cycled per row); cashier
  figure gets a single character-color pop; entrance sign is the one
  facade accent. Geometry and sizes untouched; outlines untouched
  (intentional).
- Atmosphere: scene background + fog set to a smoggy warm gray
  (fog 9-60 units); desktop FOV widened 55 -> 68 (mobile still 75).
- `src/components/three/PostFX.jsx`: custom "grime" pass - subtle RGB
  shift, scanlines, animated grain, vignette. Built on three's own
  EffectComposer/ShaderPass (NO new npm deps - the sandbox/npm registry
  was unavailable, and it keeps the bundle lean). Tuning knobs are consts
  in the fragment shader.
- In-scene UI restyled to lo-fi dark panels (chunky black borders, mono
  font, single acid-yellow accent, subtle SVG noise, sticker-style
  "CASHIER" tag). Deliberately NOT the loud graffiti style - that was
  tried before (SludgeLifeDialogue) and rejected.

### Win95 backup
The previous Windows 95 UI is preserved in git history (commit before
this restyle). `/portfolio`, `/portfolio/[id]` and `/boring` pages still
use the Win95 style - restyle them in a later pass if desired.

### Next style passes (not done yet)
- Stickers/decals on shelves & walls: generate 2D sticker/poster/label
  textures (Higgsfield image generation is a good fit), apply as decal
  planes. Keep it sparse - accents, not graffiti-bombing.
- Portfolio pages + boring page restyle to match.
- Optional: store brand/mascot for signage and product labels.

---

## Recent Changes (2026-07-04, part 4): Higgsfield Prop Pipeline (First Asset)

- First generated prop: a Sludge Life-style soup can (Recraft V4.1 concept
  image -> Meshy image-to-3D, textured, 8k tris, symmetry on).
- `CanRow` component in modelScene.jsx renders a line of cans in place of
  one product strip (slot set by `CAN_ROW_SLOT`, currently 1 = aisle 0,
  left wall, middle row). Cans are auto-fitted into the EXACT bounding box
  of the strip they replace (`PRODUCT_STRIP_SIZE` in sceneLayout.js,
  measured from scene2.glb: 0.626 x 1.166 x 16.806) - layout never shifts.
  Each can gets a deterministic pseudo-random yaw so the row feels
  hand-placed.
- The can group is the raycast target; hover glow in useFocusEffect was
  generalized to traverse groups, so the whole can row glows orange.
- Resilience: if `/public/models/props/soup_can.glb` is missing or fails
  to load, GLBBoundary + Suspense fall back to the plain strip.
- ASSET NOT COMMITTED YET: the sandbox cannot reach Higgsfield's CDN.
  Download the GLB manually to `public/models/props/soup_can.glb`.
- The shelf-unit concept image was generated but NOT converted to 3D
  (user's call - procedural shelf kept). Image job id:
  d49897b0-f1d5-4550-a194-93fac8354458 if we convert later (20 credits).

---

## Recent Changes (2026-07-04, part 5): Can Row Removed, Preview Aisles, Mobile Rebuild

### Can row removed
- The Higgsfield can-row experiment was rejected by the user and fully
  removed (CanRow, GLBBoundary, CAN_ROW_SLOT). The generalized group-aware
  hover glow in useFocusEffect was kept. The generated can GLB is still in
  the Higgsfield account (job a2a32d46-52b3-43a1-b5bf-f8fade78da4c) if
  ever wanted.

### Preview aisles
- `MIN_AISLES = 3` in sceneLayout.js: the store renders at least 3 aisles
  regardless of CMS item count, to preview the space at scale. Set back
  to 1 when real content fills the shelves. Content-driven growth still
  applies beyond the floor.

### Mobile flow rebuilt (two phases)
- Phase 'approach': vertical swipe walks the camera along the REAL entry
  path (getEntryPathPoints - same head as the desktop path), through the
  sliding doors (Storefront now renders on mobile too), arriving at the
  cashier with a smooth quaternion turn + dialogue.
- Phase 'browse': after "EXPLORE", a GSAP timeline travels to the shelf
  line; camera locked at x=-12 facing the shelves, horizontal swipe
  scrolls with infinite wrap (bounds scale with item count).
- `mobilePhase` lives in the Zustand store (not persisted); the mobile
  instruction bar is contextual ("SWIPE UP TO WALK IN" vs browse text);
  taps only inspect during 'browse'.
- Bug fixed: CashierDialogue's 1.2s camera unlock is now desktop-only.
  On mobile it fired mid-transition (~3.5s timeline) and the frame loop
  fought GSAP - the old mobile camera jump.

---

## Recent Changes (2026-07-04, part 6): Linear Store, Floor, NTSC Shader, Mobile Wall-Browse

### Linear store layout (BREAKING layout change)
- Aisle segments now sit on ONE corridor (x=-5), one after the other
  along -Z (SEGMENT_SPACING=28). The desktop camera path is a straight
  line through the whole store - the snaking 180° turns were confusing.
- MIN_AISLES=3 still applies. Facade extent is fixed (store is narrow).
- New floor plane (theme SLUDGE.floor) covering store + outside approach,
  y=-0.02 to avoid z-fighting with shelf bases.

### Mobile = same scene as desktop
- Mobile renders the FULL desktop scene (fills the view). Items map to the
  LEFT wall only (3 stacked rows per segment - fits portrait screens);
  right-wall rows are non-clickable stock (itemIndexForSlot).
- Browse camera: x=-1 facing the left wall, FOV tweens 75 -> 82, scroll
  clamped (linear store, no wrap). Config in MOBILE_BROWSE.
- Walk-in swipe: drag DOWN = forward (ENTRY_SWIPE_DIRECTION=1 in
  sceneLayout.js; set -1 for page-scroll convention).
- FIXED the broken cashier->shelves transition: the old Euler-angle
  rotation tween after a lookAt produced garbage orientations (wrong
  Euler order + wrong target sign). Now position/orientation(quaternion
  slerp)/FOV tween together to an end state that exactly matches the
  browse frame-loop - no snap, no fight.

### NTSC/VHS shader (re: web.ntsc.rs)
- ntsc-rs is a file-processing WASM tool - NOT embeddable as a realtime
  WebGL pass (would require per-frame CPU readback). Instead GrimeShader
  now emulates its signature composite artifacts: YIQ chroma bleed
  (sharp luma, smeared chroma) + per-scanline tracking jitter, on top of
  the existing scanlines/grain/vignette. Knobs are consts in the shader.
- web.ntsc.rs remains useful for post-processing captured videos/trailers.

---

## Recent Changes (2026-07-04, part 7): Mobile Camera Fix + Site-Wide Theme

- FIXED mobile browse camera clipping into the opposite shelf: right-wall
  product strips span x -1.227..-0.601 and the camera sat at x=-1 (inside
  them). Now at x=-2.4 (MOBILE_BROWSE.cameraX).
- All non-3D pages (/portfolio, /portfolio/[id], /boring) restyled to the
  lo-fi dark Sludge theme, driven by SLUDGE.ui tokens from src/lib/theme.js
  (new token: ui.pageBg). Logic untouched; grep confirms no Win95 styles
  (c0c0c0/teal/outset/inset) remain in src/app. Win95 originals in git.

---

## Recent Changes (2026-07-04, part 8): Procedural Props, Store Completion, CRT Warp

### Procedural prop library (src/components/three/props.jsx)
- Six prop types built from primitives in the house style (flat color +
  black outlines): can, box (cereal), bottle, jar, bag, carton. No
  external assets. PROP_DIMS drives packing and inspection centering.
- Shelf rows are now PropRow: one product type repeated per row (real
  supermarket logic), deterministic yaw jitter, packed into the measured
  PRODUCT_STRIP_SIZE box so the layout never shifts. Type+accent pairing
  shifts per segment for variety. Rows remain the raycast targets.
- Perf knob: `density` prop on PropRow (currently 0.8 from ProductRow).
  If frame rate suffers (many rows visible down the straight corridor),
  lower it; next escalation would be InstancedMesh.

### Inspection previews
- sanityQueries no longer hardcodes a fallback GLB ("inspectionModelUrl"
  is null unless set in Studio). With no custom model, the viewer shows
  the row's procedural prop (InspectionProp, same type+color).
  soupsoup2.glb is no longer referenced (file still in /public).

### Store completion + branding
- StoreShell: perimeter walls + ceiling matching the facade footprint,
  scaling with segments. Big plain surfaces, no outlines (fog does depth).
- LightFixture under every ceiling point light; CashRegister on the
  counter; BasketStack by the entrance.
- Canvas-texture signage (no font downloads, useTextTexture in props.jsx):
  "DEIV'S MARKET" on the facade sign, "CHECKOUT" above the counter,
  hanging "AISLE N" signs per segment. Site <title>/metadata untouched.

### CRT warp (PostFX)
- Barrel distortion (CRT_CURVE) warps the corners with black overscan
  outside the tube + soft edge fade (CRT_EDGE_FADE). Applied before the
  chroma-bleed sampling so all artifacts follow the curved screen.

---

## Recent Changes (2026-07-04, part 9): Z-Fight Fix, Mobile Tuning, Decor Rows, Checkout

- FIXED the "two overlapping blocks" glitch on the top-left shelf: the
  price rail sat at y=4 with the same footprint as the middle shelf board
  (also y=4) - coplanar boxes z-fighting. Rail now at y=4.2, nudged 0.12
  toward the corridor. Props also get +0.05 base epsilon so they stand ON
  the boards instead of sinking into them.
- Mobile: swipe sensitivity raised (entry 0.0012 -> 0.0022, browse 0.012
  -> 0.028), and BOTH touch-scroll and camera frame updates are frozen
  while an inspection window is open (dragging the 3D viewer used to
  scroll the world underneath).
- Decorative flanking shelf rows (getDecorShelves/getDecorStrips): a
  corridor of shelving on each side of the central aisle (right flank
  mirrors the original aisle 2 at x 1.5/12.5; left flank hugs the wall at
  x=-16.9). Stocked with cheap single-mesh strips, not prop rows -
  deliberate draw-call budget choice.
- CheckoutCounter (props.jsx) replaces the plain Cube016 box: cabinet,
  counter top, conveyor inset, divider bar, bagging tray, kick plate,
  groceries on the belt. Same footprint; still part of the clickable
  cashier group.

---

## Recent Changes (2026-07-05): Sludge Life Shading Pass (screenshot ref)

- Scene-wide stepped toon shading: every meshStandardMaterial in the scene
  components was replaced with `ToonMaterial` (props.jsx) - a
  meshToonMaterial with a shared 3-band gradient ramp (shadow 55% / mid
  82% / lit 100%, NearestFilter). Faces snap to flat brightness bands
  instead of smooth Lambert falloff - the Sludge Life "shadow" treatment.
- Warm ambient light (#ffe6cf, 0.6) added so shadow bands stay tinted,
  never black. Note: toon materials ignore the HDRI Environment; lighting
  is now ambient + point lights (Environment still lights custom GLTF
  inspection models, which keep their own materials).
- Checkerboard floor (the SL classic): procedural canvas texture
  (useCheckerTexture in props.jsx), warm off-white #ddd3c6 / near-black
  #181816, tile ~1.2 world units, NearestFilter for crisp edges.
- Ramp bands + checker colors are the tuning knobs (getToonRamp /
  useCheckerTexture in props.jsx).

---

## Recent Changes (2026-07-05, part 2): Hard 2-Band Shading, Screenshot Palette, Slim Shelves

- Toon ramp reduced to TWO bands (lit 100% / shadow 65%) - no midtone,
  like Sludge Life. Depth now comes from the fog, which was strengthened
  (near 7, far 42) into a pale warm-green haze.
- Full palette rework sampled from the SL screenshot, one deliberate color
  per element (theme.js): mint-gray walls, green-gray ceiling, bun-tan
  shelf panels, cream boards, red-orange price rails, hero-orange checkout
  cabinet with cream top, pinkish outside concrete, teal doors,
  cream/brown-black checker (not pure black), mint cashier, and 6
  screenshot-family product accents. Legacy concrete* keys kept as aliases.
- ShelfUnit rebuilt: thin vertical back panel (0.36, was 1.0), boards as
  SIBLINGS (not children of the scaled panel) at the measured world
  offsets, plus a NEW bottom board (y=0.36) grounding the lowest product
  row that used to float. Board span extended to meet the slim panel.

---

## Recent Changes (2026-07-05, part 3): Rail Removed, Color Runs, Mobile 2x, Fake Products

- Price rail deleted entirely (was the ugly red bar on the top shelf).
- PropRow colors now come in RUNS of 2-4 same-colored props per row,
  deterministic per slot, starting from the row's base accent (so the
  inspection preview color always exists on the shelf). Accent palette
  expanded to 8 SL-family colors; fog/walls cooled to cut the yellow cast.
  Shelf panels stay off-white (user's own tweak, respected).
- Mobile mirrors the FULL desktop structure at 2x length:
  getAisleCount(forMobile) = 2x desktop segments. Every desktop unit
  (both walls) becomes one browsed left-wall unit on the phone, each
  faced by a decorative right-wall unit ("always two shelves facing").
  Desktop 6 units -> phone 12 units, same item capacity, order preserved.
- Walk-in swipe INVERTED again per user: drag DOWN = forward
  (ENTRY_SWIPE_DIRECTION=+1); sensitivity raised (entry 0.0038, browse
  0.042). iOS pull-to-refresh already blocked by CSS, so it's safe.
- src/lib/fakeItems.js: every shelf row without a CMS item now sells a
  deterministic FAKE product (SLUDGE CHUNKS, AIR (SALTED), EXPIRED
  TOMORROW, ...) - clickable, inspectable with the matching prop,
  `placeholder: true` hides the SHOW MORE portfolio link.
