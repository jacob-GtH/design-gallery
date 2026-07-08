"use server";

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

export async function getOrCreateTag(tag: string): Promise<{
  _type: "reference";
  _ref: string;
} | null> {
  try {
    const existingTag = await client.fetch(
      `*[_type == "tag" && title == $tag][0]`,
      { tag: tag } as Record<string, any>
    );

    if (existingTag) {
      return {
        _type: "reference",
        _ref: existingTag._id as string,
      };
    }

    const newTag = await client.create({
      _type: "tag",
      title: tag,
    });

    return {
      _type: "reference",
      _ref: newTag._id as string,
    };
  } catch (err) {
    console.error("❌ فشل أثناء إنشاء وسم:", tag, err);
    return null;
  }
}
