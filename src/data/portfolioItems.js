/**
 * Portfolio Items Data - Now powered by Sanity CMS
 *
 * This file now imports data from Sanity CMS instead of using hardcoded data.
 * Items are displayed in two ways:
 * 1. In the 3D gallery scene (if showInScene is true in Sanity)
 * 2. On the /portfolio page (all items from Sanity)
 *
 * Array Index Mapping to 3D Scene:
 * - sceneIndex in Sanity determines which 3D product mesh it maps to
 * - sceneIndex 0 → product1Ref (Product 1 on shelf)
 * - sceneIndex 1 → product2Ref (Product 2 on shelf)
 * - sceneIndex 2 → product3Ref (Product 3 on shelf)
 * - etc.
 *
 * IMPORTANT: Only items with showInScene:true and sceneIndex 0-5 will appear in 3D scene
 *
 * TO ADD CONTENT:
 * 1. Open Sanity Studio at http://localhost:3333
 * 2. Click "Portfolio Item" in the sidebar
 * 3. Click "Create" to add a new item
 * 4. Fill in all fields:
 *    - ID: Click "Generate" to create URL slug
 *    - Name: Project name
 *    - Type: e.g., "Web Application", "Design", etc.
 *    - Description: Short description (max 200 chars)
 *    - Detailed Description: Full description for detail page
 *    - Show in 3D Scene: Toggle ON if you want it on shelves
 *    - Scene Position: Set 0-5 for shelf position (only if Show in 3D Scene is ON)
 *    - Link: Optional external URL
 *    - Gallery: Upload images with captions
 * 5. Click "Publish"
 */

// Import Sanity query functions
export { getAllItems, getItemById, getSceneItems, getItemBySceneIndex } from '@/lib/sanityQueries'
