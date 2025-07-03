// lib/actions.ts
import {client} from './client'
import {IDesign} from '../../../interfaces/Design'

export async function fetchDesigns(): Promise<IDesign[]> {
  try {
    const query = `*[_type == "design"] | order(_createdAt desc) {
      _id,
      title,
      "designer": designer->name,
      "imageUrl": mainImage.asset->url,
      tags[]->{title},
      likes,
      _createdAt
    }[0...12]`

    const result = await client.fetch(query)

    return result.map((item: any) => ({
      id: item._id,
      title: item.title,
      designer: item.designer || 'مصمم مجهول',
      imageUrl: item.imageUrl,
      tags: item.tags || [],
      likes: item.likes || 0,
      createdAt: new Date(item._createdAt),
    }))
  } catch (error) {
    console.error('Failed to fetch designs:', error)
    return []
  }
}
