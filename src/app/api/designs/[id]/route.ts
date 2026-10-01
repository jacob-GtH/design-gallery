import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/sanity.client"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    return NextResponse.json({ error: (error as Error).message || "خطأ غير متوقع" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await client.delete(id);
    return NextResponse.json({ message: "تم الحذف بنجاح" });
  } catch (error: unknown) {
    console.error("❌ Failed to delete:", error);
    return NextResponse.json({ error: (error as Error).message || "فشل في الحذف" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();

  if (!data.title) {
    return NextResponse.json({ error: "الحقول المطلوبة غير مكتملة" }, { status: 400 });
  }

  try {
    // بناء كائن نظيف فقط بالحقول المطلوبة (منع حقول الواجهة القذرة)
    const cleanData: Record<string, unknown> = {
      title: data.title,
      description: data.description ?? "",
      backgroundColor: data.backgroundColor || "#f9fafb",
      publishedAt: data.publishedAt || new Date().toISOString(),
    };

    // تحويل الوسوم إلى مراجع
    if (data.tags && Array.isArray(data.tags)) {
      cleanData.tags = data.tags.map((tag: { _ref: string }) => ({
        _type: "reference",
        _ref: tag._ref,
      }));
    }

    // تحويل designerId إلى مرجع مصمم
    if (data.designerId) {
      cleanData.designer = {
        _type: "reference",
        _ref: data.designerId,
      };
    }

    // تحديث الوسائط إن وُجدت
    if (data.media && Array.isArray(data.media)) {
      cleanData.media = data.media;
    }

    await client.patch(id).set(cleanData).commit();

    return NextResponse.json({ message: "تم التحديث بنجاح" });
  } catch (error: unknown) {
    console.error("❌ Failed to update:", error);
    return NextResponse.json({ error: (error as Error).message || "فشل في التحديث" }, { status: 500 });
  }
}
