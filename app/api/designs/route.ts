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
      "designer":  designer->{_id, name},
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
      background: d.background || '#f9fafb',
      designer: d.designer,
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
    const { title, description, media, designerId, backgroundColor, tags } = await req.json();

    // تحقق موسع من الصحة
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
    }

    if (!media || !Array.isArray(media) || media.length === 0) {
      return NextResponse.json({ error: "الوسائط مطلوبة" }, { status: 400 });
    }

    if (!designerId) {
      return NextResponse.json({ error: "المصمم مطلوب" }, { status: 400 });
    }

    // إنشاء كائن التصميم
    const newDesign = {
      _type: "design",
      title,
      description,
      background: backgroundColor || '#f9fafb',
      slug: {
        _type: "slug",
        current: title.toLowerCase().replace(/\s+/g, "-").slice(0, 96),
      },
      media,
      publishedAt: new Date().toISOString(),
      designer: {
        _type: "reference",
        _ref: designerId,
      },
      tags: tags ? tags.map((tag: string) => ({
        _type: "reference",
        _ref: tag,
      })) : [],
    };

    const created = await client.create(newDesign);
    return NextResponse.json({
      success: true,
      design: {
        id: created._id,
        ...newDesign
      }
    });
  } catch (error) {
    console.error("❌ Failed to create design:", error);
    return NextResponse.json(
      { 
        error: "Failed to create design",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

