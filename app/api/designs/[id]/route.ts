import { NextRequest, NextResponse } from "next/server"
import { client } from "@/sanity/design-cms/lib/client"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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
        backgroundColor,
        "designer": designer->name,
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
  } catch (error: any) {
    console.error("❌ Failed to fetch design:", error);
    return NextResponse.json({ error: error.message || "خطأ غير متوقع" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    await client.delete(id);
    return NextResponse.json({ message: "تم الحذف بنجاح" });
  } catch (error: any) {
    console.error("❌ Failed to delete:", error);
    return NextResponse.json({ error: error.message || "فشل في الحذف" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const data = await req.json();

  if (!data.title ) {
    return NextResponse.json({ error: "الحقول المطلوبة غير مكتملة" }, { status: 400 });
  }

  try {
    await client
      .patch(id)
      .set({
        ...data,
        publishedAt: data.publishedAt || new Date().toISOString(),
      })
      .commit();

    return NextResponse.json({ message: "تم التحديث بنجاح" });
  } catch (error: any) {
    console.error("❌ Failed to update:", error);
    return NextResponse.json({ error: error.message || "فشل في التحديث" }, { status: 500 });
  }
}
