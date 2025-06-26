import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/design-cms/lib/client";

export async function GET() {
  try {
    const rawDesigns =
      await client.fetch(`*[_type == "design"] | order(_createdAt desc){
      _id,
      title,
      description,
      publishedAt,
      likes,
      background,
      "designer": designer->name,
      "tags": tags[]->title,
      media[]{
        url,
        type,
        caption
      }
    }`);

    const designs = rawDesigns.map((d: any) => ({
      id: d._id,
      title: d.title,
      description: d.description,
      publishedAt: d.publishedAt,
      likes: d.likes ?? 0,
      background: d.background,
      designer: d.designer.name,
      tags: d.tags ?? [],
      media: d.media ?? [],
    }));

    return NextResponse.json(designs);
  } catch (error) {
    console.error("❌ Failed to fetch designs:", error);
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, media, designerId } = await req.json();

    if (
      !title ||
      !media ||
      !Array.isArray(media) ||
      media.length === 0 ||
      !designerId
    ) {
      return NextResponse.json(
        { error: "الحقول المطلوبة مفقودة" },
        { status: 400 }
      );
    }

    const newDesign = {
      _type: "design",
      title,
      description,
      slug: {
        _type: "slug",
        current: title.toLowerCase().replace(/\s+/g, "-").slice(0, 96),
      },
      media, // [{ url, type, caption }]
      publishedAt: new Date().toISOString(),
      designer: {
        _type: "reference",
        _ref: designerId,
      },
    };

    const created = await client.create(newDesign);
    return NextResponse.json(created);
  } catch (error) {
    console.error("❌ Failed to create design:", error);
    return NextResponse.json(
      { error: "Failed to create design" },
      { status: 500 }
    );
  }
}
