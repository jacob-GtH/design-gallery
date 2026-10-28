import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { config, middleware } from "@/middleware";
import { adminCookie } from "../helpers";

const req = async (path: string, method = "GET", admin = false, cookie?: string) => {
  const headers: Record<string, string> = {};
  if (admin) headers.cookie = await adminCookie();
  if (cookie) headers.cookie = cookie;
  return new NextRequest(`http://localhost${path}`, { method, headers });
};
const passes = (res: Response) => res.headers.get("x-middleware-next") === "1";

afterEach(() => vi.useRealTimers());

describe("middleware: واجهات API", () => {
  it("القراءة عامة (GET/HEAD/OPTIONS)", async () => {
    for (const m of ["GET", "HEAD", "OPTIONS"]) {
      expect(passes(await middleware(await req("/api/designs", m)))).toBe(true);
      expect(passes(await middleware(await req("/api/designs/abc", m)))).toBe(true);
    }
  });

  it.each([["POST", "/api/designs"], ["PATCH", "/api/designs/abc"], ["DELETE", "/api/designs/abc"], ["PUT", "/api/designs/abc"]])(
    "%s %s بلا جلسة: 401",
    async (method, path) => {
      const res = await middleware(await req(path, method));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "غير مصرح" });
    }
  );

  it("الكتابة بجلسة المدير تمرّ", async () => {
    for (const [m, p] of [["POST", "/api/designs"], ["PATCH", "/api/designs/abc"], ["DELETE", "/api/designs/abc"]]) {
      expect(passes(await middleware(await req(p, m, true)))).toBe(true);
    }
  });

  it("اللايك عام بلا جلسة (مسار محدد فقط)", async () => {
    expect(passes(await middleware(await req("/api/designs/like", "POST")))).toBe(true);
    // مسار يشبهه لا يُستثنى
    expect((await middleware(await req("/api/designs/like/extra", "POST"))).status).toBe(401);
    expect((await middleware(await req("/api/designs/likes", "POST"))).status).toBe(401);
  });

  it("كوكي تالف أو موقّع بسر مختلف أو منتهٍ: يُعامل كزائر", async () => {
    expect((await middleware(await req("/api/designs", "POST", false, "admin_session=garbage"))).status).toBe(401);
    expect((await middleware(await req("/api/designs", "POST", false, "admin_session=1800000000000.AAAA"))).status).toBe(401);

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1_800_000_000_000);
    const cookie = await adminCookie();
    vi.setSystemTime(1_800_000_000_000 + 9 * 3600 * 1000); // بعد 9 ساعات (الجلسة 8)
    expect((await middleware(await req("/api/designs", "POST", false, cookie))).status).toBe(401);
  });
});

describe("middleware: صفحات /admin", () => {
  it("بلا جلسة: تحويل إلى صفحة الدخول مع next ودون الاستعلام", async () => {
    const res = await middleware(await req("/admin"));
    expect(res.status).toBe(307);
    const loc = new URL(res.headers.get("location")!);
    expect(loc.pathname).toBe("/admin/login");
    expect(loc.searchParams.get("next")).toBe("/admin");

    const res2 = await middleware(await req("/admin/edit/abc?x=1&y=2"));
    const loc2 = new URL(res2.headers.get("location")!);
    expect(loc2.searchParams.get("next")).toBe("/admin/edit/abc");
    expect(loc2.searchParams.has("x")).toBe(false);
  });
  it("صفحة الدخول متاحة للجميع", async () => {
    expect(passes(await middleware(await req("/admin/login")))).toBe(true);
  });
  it("بجلسة صالحة تمرّ الصفحات", async () => {
    expect(passes(await middleware(await req("/admin", "GET", true)))).toBe(true);
    expect(passes(await middleware(await req("/admin/edit/abc", "GET", true)))).toBe(true);
  });
});

describe("middleware: matcher", () => {
  it("يغطي لوحة الإدارة ومسارات التصاميم، ولا يغطي /api/admin (محمية داخل الـ route)", () => {
    expect(config.matcher).toEqual(expect.arrayContaining(["/admin/:path*", "/api/designs", "/api/designs/:path*"]));
    expect(config.matcher.some((m) => m.startsWith("/api/admin"))).toBe(false);
  });
});
