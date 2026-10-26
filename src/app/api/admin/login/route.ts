// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const bodySchema = z.object({ password: z.string().min(1).max(256) });

function safeEqual(a: string, b: string): boolean {
  // نقارن البصمات (طول ثابت) بمقارنة ثابتة الزمن
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "محاولات كثيرة، حاول لاحقاً" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const token = await createSessionToken();
  if (!adminPassword || !token) {
    console.error(
      "❌ ADMIN_PASSWORD أو AUTH_SECRET (32 حرفاً على الأقل) غير مضبوطين"
    );
    return NextResponse.json({ error: "الخادم غير مهيأ" }, { status: 500 });
  }

  if (!safeEqual(parsed.data.password, adminPassword)) {
    return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
