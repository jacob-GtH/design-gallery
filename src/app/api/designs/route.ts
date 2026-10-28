// src/app/api/designs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/lib/sanity.client";
import { IDesign } from "@/interfaces/Design";
import { requireAdmin } from "@/lib/requireAdmin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { MEDIA_LITE, NOT_DRAFT } from "@/lib/queries";
import { createDesignSchema, firstIssue, makeSlug } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    // المسودات لا تُعاد إلا للمدير وعند طلبها صراحةً (?drafts=1)
    const wantsDrafts = req.nextUrl.searchParams.get("drafts") === "1";
    const includeDrafts =
      wantsDrafts &&
      (await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value));
    const draftFilter = includeDrafts ? "" : ` && ${NOT_DRAFT}`;

    const rawDesigns = await client.fetch(
      `*[_type == "design"${draftFilter}] | order(_createdAt desc){
        _id,
        title,
        description,
        publishedAt,
        likes,
        "createdAt": _createdAt,
        viewsCount,
        rating,
        backgroundColor,
        status,
        coverKey,
        "designer": designer->{_id, name},
        "tags": tags[]->title,
        ${MEDIA_LITE}
      }`
    );

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
      status: d.status ?? "published",
      coverKey: d.coverKey ?? null,
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
  const { title, description, media, designerId, backgroundColor, tags, status, coverKey } =
    parsed.data;

  try {
    const newDesign: Record<string, unknown> = {
      _type: "design",
      title,
      description,
      backgroundColor,
      slug: { _type: "slug", current: makeSlug(title) },
      media,
      status,
      tags: tags.map((tag) => ({ _type: "reference", _ref: tag._ref })),
    };
    if (designerId) newDesign.designer = { _type: "reference", _ref: designerId };
    if (coverKey) newDesign.coverKey = coverKey;
    if (status === "published") newDesign.publishedAt = new Date().toISOString();

    const created = await client.create(newDesign as { _type: string } & Record<string, unknown>);
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
