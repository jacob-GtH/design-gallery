// lib/actions.ts
import { client } from "sanity/design-cms/lib/client";
import { IDesign } from "@/interfaces/Design";

interface SanityDesign {
  _id: string;
  title: string;
  designer: { name: string } | null;
  imageUrl: string;
  tags: { title: string }[];
  likes: number;
  _createdAt: string;
}

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
    }[0...12]`;

    const result: SanityDesign[] = await client.fetch(query);

    return result.map((item: SanityDesign) => ({
      id: item._id,
      title: item.title,
      designer: item.designer?.name || "مصمم مجهول",
      imageUrl: item.imageUrl,
      tags: item.tags?.map(tag => tag.title) || [],
      likes: item.likes || 0,
      createdAt: item._createdAt,
      backgroundColor: "#f9fafb", // Add default background color
      media: [], // Add default media
    }));
  } catch (error: unknown) {
    console.error("Failed to fetch designs:", error);
    return [];
  }
}
