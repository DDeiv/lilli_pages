import { client } from './sanity'

// GROQ query to get all portfolio items
const portfolioItemsQuery = `*[_type == "portfolioItem"] | order(sceneIndex asc) {
  "id": id.current,
  name,
  type,
  description,
  detailedDescription,
  showInScene,
  sceneIndex,
  link,
  "inspectionModelUrl": inspectionModel,
  inspectionScale,
  "gallery": gallery[]{
    "url": image.asset->url,
    caption,
    alt,
    "type": "image"
  }
}`

// Get all portfolio items
export async function getAllItems() {
  try {
    const items = await client.fetch(portfolioItemsQuery)
    // Parse sceneIndex from string to number
    return items.map(item => ({
      ...item,
      sceneIndex: item.sceneIndex ? parseInt(item.sceneIndex) : null
    }))
  } catch (error) {
    console.error('Error fetching all items:', error)
    return []
  }
}

// Get a single item by ID
export async function getItemById(id) {
  try {
    const query = `*[_type == "portfolioItem" && id.current == $id][0] {
      "id": id.current,
      name,
      type,
      description,
      detailedDescription,
      showInScene,
      sceneIndex,
      link,
      "inspectionModelUrl": inspectionModel,
      inspectionScale,
      "gallery": gallery[]{
        "url": image.asset->url,
        caption,
        alt,
        "type": "image"
      }
    }`
    const item = await client.fetch(query, { id })
    // Parse sceneIndex from string to number
    if (item && item.sceneIndex) {
      item.sceneIndex = parseInt(item.sceneIndex)
    }
    return item
  } catch (error) {
    console.error('Error fetching item by ID:', error)
    return null
  }
}

// Get only items that should appear in the 3D scene
export async function getSceneItems() {
  try {
    const query = `*[_type == "portfolioItem" && showInScene == true] | order(sceneIndex asc) {
      "id": id.current,
      name,
      type,
      description,
      detailedDescription,
      showInScene,
      sceneIndex,
      link,
      "inspectionModelUrl": inspectionModel,
      inspectionScale
    }`
    const items = await client.fetch(query)
    // Parse sceneIndex from string to number
    return items.map(item => ({
      ...item,
      sceneIndex: item.sceneIndex ? parseInt(item.sceneIndex) : null
    }))
  } catch (error) {
    console.error('Error fetching scene items:', error)
    return []
  }
}

// Get item by scene index (for mapping to 3D products)
export async function getItemBySceneIndex(index) {
  try {
    const items = await getSceneItems()
    return items[index] || null
  } catch (error) {
    console.error('Error fetching item by scene index:', error)
    return null
  }
}
