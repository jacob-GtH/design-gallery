// src/app/api/designs/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity.client";
import { likeSchema } from "@/lib/schemas";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = likeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid ID" }, { status: 400 });
  }
  const { id } = parsed.data;

  // لايك واحد لكل تصميم من نفس العنوان كل ساعة + سقف عام لكل عنوان
  const perDesign = rateLimit(`like:${ip}:${id}`, 1, 60 * 60 * 1000);
  const overall = rateLimit(`like:${ip}`, 60, 60 * 60 * 1000);
  if (!perDesign.ok || !overall.ok) {
    const retry = Math.max(perDesign.retryAfterSeconds, overall.retryAfterSeconds);
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retry) } }
    );
  }

  try {
    // يتأكد أن المستند تصميم فعلاً قبل التعديل
    const exists = await client.fetch<string | null>(
      `*[_type == "design" && _id == $id][0]._id`,
      { id }
    );
    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const result = await client
      .patch(id)
      .setIfMissing({ likes: 0 })
      .inc({ likes: 1 })
      .commit();

    return NextResponse.json({ likes: result.likes });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
  }
}
