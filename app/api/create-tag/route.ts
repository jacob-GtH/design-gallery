import { client } from "@/sanity/design-cms/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title } = await req.json();

  if (!title)
    return NextResponse.json({ error: "Missing tag title" }, { status: 400 });

  // تحقق إذا الوسم موجود مسبقًا
  const existing = await client.fetch(
    `*[_type == "tag" && title == $title][0]{ _id }`,
    { title }
  );

  if (existing) {
    return NextResponse.json({ _id: existing._id });
  }

  // إنشاء وسم جديد
  const newTag = await client.create({
    _type: "tag",
    title,
  });

  return NextResponse.json({ _id: newTag._id });
}
