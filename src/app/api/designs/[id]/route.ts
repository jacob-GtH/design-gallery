import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/lib/sanity.client";
import { requireAdmin } from "@/lib/requireAdmin";
import { firstIssue, idSchema, updateDesignSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

/** يتأكد أن المعرّف صالح وأن المستند من نوع design (حتى لا تُستخدم الواجهة لتعديل/حذف مستندات أخرى). */
async function resolveDesignId(
  params: Ctx["params"]
): Promise<{ id: string } | { error: NextResponse }> {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return { error: NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 }) };
  }
  const exists = await client.fetch<string | null>(
    `*[_type == "design" && _id == $id][0]._id`,
    { id }
  );
  if (!exists) {
    return { error: NextResponse.json({ error: "التصميم غير موجود" }, { status: 404 }) };
  }
  return { id };
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  try {
    const design = await client.fetch(
      `*[_type == "design" && _id == $id][0]{
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
        media[] {
          url,
          type,
          caption
        }
      }`,
      { id }
    );

    if (!design) {
      return NextResponse.json({ error: "التصميم غير موجود" }, { status: 404 });
    }

    const { _id, ...rest } = design;
    return NextResponse.json({ id: _id, ...rest });
  } catch (error: unknown) {
    console.error("❌ Failed to fetch design:", error);
    return NextResponse.json({ error: "فشل جلب التصميم" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const resolved = await resolveDesignId(params);
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
    const resolved = await resolveDesignId(params);
    if ("error" in resolved) return resolved.error;

    // بناء كائن نظيف فقط بالحقول المسموحة
    const cleanData: Record<string, unknown> = {
      title: data.title,
      description: data.description,
      backgroundColor: data.backgroundColor,
    };
    if (data.tags) {
      cleanData.tags = data.tags.map((tag) => ({
        _type: "reference",
        _ref: tag._ref,
      }));
    }
    if (data.designerId) {
      cleanData.designer = { _type: "reference", _ref: data.designerId };
    }
    if (data.media) {
      cleanData.media = data.media;
    }

    await client.patch(resolved.id).set(cleanData).commit();
    revalidatePath("/designs/[id]", "page");
    return NextResponse.json({ message: "تم التحديث بنجاح" });
  } catch (error: unknown) {
    console.error("❌ Failed to update:", error);
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}
