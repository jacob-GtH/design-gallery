"use server";

import { cookies } from "next/headers";
import { client } from "@/lib/sanity.client";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function getOrCreateTag(rawTag: string): Promise<{
  _type: "reference";
  _ref: string;
} | null> {
  // Server Actions تُستدعى كنقاط HTTP عامة: لا بد من التحقق من الجلسة هنا أيضاً
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    console.error("❌ محاولة إنشاء وسم بدون صلاحية");
    return null;
  }

  const tag = typeof rawTag === "string" ? rawTag.trim() : "";
  if (!tag || tag.length > 50) return null;

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
