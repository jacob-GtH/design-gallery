// src/app/api/admin/upload-signature/route.ts
// يعطي المدير المسجَّل توقيعاً صالحاً لرفع ملف واحد إلى Cloudinary.
// ملاحظة: المسار تحت /api/admin لا يمر عبر middleware، لذا التحقق هنا إلزامي.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/requireAdmin";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { ALLOWED_FORMATS, UPLOAD_FOLDER, signParams } from "@/lib/cloudinary";

const bodySchema = z.object({ type: z.enum(["image", "video"]) });

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const rl = rateLimit(`upload-sig:${getClientIp(req)}`, 200, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  const { type } = parsed.data;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    console.error(
      "❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME أو CLOUDINARY_API_KEY أو CLOUDINARY_API_SECRET غير مضبوطة"
    );
    return NextResponse.json({ error: "الخادم غير مهيأ" }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const allowedFormats = ALLOWED_FORMATS[type];
  const signature = signParams(
    { timestamp, folder: UPLOAD_FOLDER, allowed_formats: allowedFormats },
    apiSecret
  );

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder: UPLOAD_FOLDER,
    allowedFormats,
  });
}
