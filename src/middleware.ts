// src/middleware.ts
// يحمي لوحة الإدارة وكل عمليات الكتابة على /api/designs.
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = await verifySessionToken(
    req.cookies.get(SESSION_COOKIE)?.value
  );

  // ---- واجهات API ----
  if (pathname.startsWith("/api/")) {
    // اللايك عام عمداً (محمي بـ rate limit داخل الـ route)
    if (pathname === "/api/designs/like") return NextResponse.next();
    // القراءة عامة
    if (SAFE_METHODS.has(req.method)) return NextResponse.next();

    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ---- صفحات /admin ----
  if (pathname === "/admin/login") return NextResponse.next();

  if (!isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/designs", "/api/designs/:path*"],
};
