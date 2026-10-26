// src/app/api/designs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/lib/sanity.client";
import { IDesign } from "@/interfaces/Design";
import { requireAdmin } from "@/lib/requireAdmin";
import { createDesignSchema, firstIssue, makeSlug } from "@/lib/schemas";

export async function GET() {
  try {
    const rawDesigns =
      await client.fetch(`*[_type == "design"] | order(_createdAt desc){
      _id,
      title,
      description,
      publishedAt,
      likes,
      "createdAt": _createdAt,
      viewsCount,
      rating,
      backgroundColor,
      "designer": designer->{_id, name},
      "tags": tags[]->title,
      media[]{
        url,
        type,
        caption
      }
    }`);

    const designs = rawDesigns.map((d: IDesign & { _id: string }) => ({
      id: d._id,
      title: d.title,
      description: d.description,
      publishedAt: d.publishedAt,
      likes: d.likes ?? 0,
      createdAt: d.createdAt,
      viewsCount: d.viewsCount ?? 0,
      rating: d.rating ?? 0,
      backgroundColor: d.backgroundColor || "#f9fafb",
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
  // طبقة حماية ثانية (الأولى في middleware)
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = createDesignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { title, description, media, designerId, backgroundColor, tags } =
    parsed.data;

  try {
    const newDesign = {
      _type: "design",
      title,
      description,
      backgroundColor,
      slug: { _type: "slug", current: makeSlug(title) },
      media,
      publishedAt: new Date().toISOString(),
      designer: { _type: "reference", _ref: designerId },
      tags: tags.map((tag) => ({ _type: "reference", _ref: tag._ref })),
    };

    const created = await client.create(newDesign);
    revalidatePath("/designs/[id]", "page");
    return NextResponse.json({
      success: true,
      design: { id: created._id, ...newDesign },
    });
  } catch (error) {
    // التفاصيل تُسجَّل في الخادم فقط ولا تُرسل للعميل
    console.error("❌ Failed to create design:", error);
    return NextResponse.json(
      { error: "Failed to create design" },
      { status: 500 }
    );
  }
}
