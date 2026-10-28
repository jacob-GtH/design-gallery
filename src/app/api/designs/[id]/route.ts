import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/lib/sanity.client";
import { requireAdmin } from "@/lib/requireAdmin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { MEDIA_FULL, NOT_DRAFT } from "@/lib/queries";
import { firstIssue, idSchema, updateDesignSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };
type Existing = { _id: string; status?: "draft" | "published"; publishedAt?: string };

/** يتأكد أن المعرّف صالح وأن المستند من نوع design، ويرجع حالته الحالية. */
async function resolveDesign(
  params: Ctx["params"]
): Promise<{ id: string; existing: Existing } | { error: NextResponse }> {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return { error: NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 }) };
  }
  const existing = await client.fetch<Existing | null>(
    `*[_type == "design" && _id == $id][0]{ _id, status, publishedAt }`,
    { id }
  );
  if (!existing) {
    return { error: NextResponse.json({ error: "التصميم غير موجود" }, { status: 404 }) };
  }
  return { id, existing };
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  try {
    // المسودة لا يراها إلا المدير
    const isAdmin = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    const draftFilter = isAdmin ? "" : ` && ${NOT_DRAFT}`;

    const design = await client.fetch(
      `*[_type == "design" && _id == $id${draftFilter}][0]{
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
        ${MEDIA_FULL}
      }`,
      { id }
    );

    if (!design) {
      return NextResponse.json({ error: "التصميم غير موجود" }, { status: 404 });
    }

    const { _id, ...rest } = design;
    return NextResponse.json({
      id: _id,
      ...rest,
      status: design.status ?? "published",
      coverKey: design.coverKey ?? null,
      media: design.media ?? [],
    });
  } catch (error: unknown) {
    console.error("❌ Failed to fetch design:", error);
    return NextResponse.json({ error: "فشل جلب التصميم" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const resolved = await resolveDesign(params);
    if ("error" in resolved) return resolved.error;

    await client.delete(resolved.id);
    revalidatePath("/designs/[id]", "page");
    return NextResponse.json({ message: "تم الحذف بنجاح" });
  } catch (error: unknown) {
    console.error("❌ Failed to delete:", error);
    return NextResponse.json({ error: "فشل في الحذف" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = updateDesignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const resolved = await resolveDesign(params);
    if ("error" in resolved) return resolved.error;
    const { existing } = resolved;

    // بناء كائن نظيف فقط بالحقول المسموحة
    const set: Record<string, unknown> = {
      title: data.title,
      description: data.description,
      backgroundColor: data.backgroundColor,
    };
    if (data.tags) {
      set.tags = data.tags.map((tag) => ({ _type: "reference", _ref: tag._ref }));
    }
    if (data.designerId) {
      set.designer = { _type: "reference", _ref: data.designerId };
    }
    if (data.media) set.media = data.media;

    // الحالة وتاريخ النشر: يُحدَّد تاريخ النشر عند أول نشر فقط (أو عند الانتقال من مسودة)
    const nextStatus = data.status ?? existing.status ?? "published";
    set.status = nextStatus;
    if (nextStatus === "published" && (existing.status === "draft" || !existing.publishedAt)) {
      set.publishedAt = new Date().toISOString();
    }

    const unset: string[] = [];
    if (data.coverKey) set.coverKey = data.coverKey;
    else if (data.coverKey === null || data.media) unset.push("coverKey");

    let patch = client.patch(resolved.id).set(set);
    if (unset.length) patch = patch.unset(unset);
    await patch.commit();

    revalidatePath("/designs/[id]", "page");
    return NextResponse.json({ message: "تم التحديث بنجاح" });
  } catch (error: unknown) {
    console.error("❌ Failed to update:", error);
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}
