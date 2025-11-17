import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'l6y4tq53',
  dataset: 'production',
  useCdn: false, // Disabled for development - get fresh data immediately
  apiVersion: '2024-01-01',
})

// Helper to generate image URLs from Sanity image assets
const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
