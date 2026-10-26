// src/lib/requireAdmin.ts
// طبقة حماية ثانية داخل الـ route handlers (إضافةً إلى middleware).
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/** يرجع null إذا كان الطلب من مدير مسجّل، وإلا استجابة 401 جاهزة. */
export async function requireAdmin(
  req: NextRequest
): Promise<NextResponse | null> {
  const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  return ok
    ? null
    : NextResponse.json({ error: "غير مصرح" }, { status: 401 });
}
