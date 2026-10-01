"use server";

import { client } from "@/lib/sanity.client";

export async function getOrCreateTag(tag: string): Promise<{
  _type: "reference";
  _ref: string;
} | null> {
  try {
    const existingTag = await client.fetch(
      `*[_type == "tag" && title == $tag][0]`,
      { tag } as Record<string, string>
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