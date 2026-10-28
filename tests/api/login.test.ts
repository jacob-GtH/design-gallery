import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/login/route";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, verifySessionToken } from "@/lib/auth";
import { freshIp, makeReq } from "../helpers";

const URL_ = "http://localhost/api/admin/login";
const PASS = process.env.ADMIN_PASSWORD!;
const login = (password: unknown, ip?: string) => makeReq(URL_, "POST", { body: { password }, ip });

async function withEnv(vars: Record<string, string | undefined>, fn: () => Promise<void>) {
  const prev: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    prev[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    await fn();
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

afterEach(() => vi.restoreAllMocks());

describe("POST /api/admin/login", () => {
  it("كلمة المرور الصحيحة: 200 مع كوكي جلسة آمن وصالح", async () => {
    const res = await POST(await login(PASS));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });

    const cookie = res.cookies.get(SESSION_COOKIE);
    expect(cookie?.value).toBeTruthy();
    expect(await verifySessionToken(cookie!.value)).toBe(true);

    const raw = res.headers.get("set-cookie")!.toLowerCase();
    expect(raw).toContain("httponly");
    expect(raw).toContain("samesite=lax");
    expect(raw).toContain("path=/");
    expect(raw).toContain(`max-age=${SESSION_MAX_AGE_SECONDS}`);
  });

  it("كلمة مرور خاطئة: 401 وبلا كوكي", async () => {
    const res = await POST(await login("wrong"));
    expect(res.status).toBe(401);
    expect(res.cookies.get(SESSION_COOKIE)).toBeUndefined();
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("كلمة المرور بحروف مختلفة أو بمسافة زائدة مرفوضة", async () => {
    expect((await POST(await login(PASS.toUpperCase()))).status).toBe(401);
    expect((await POST(await login(PASS + " "))).status).toBe(401);
  });

  it("طلب غير صالح: JSON تالف أو حقل ناقص أو نوع خاطئ أو طويل", async () => {
    expect((await POST(await makeReq(URL_, "POST", { raw: "not json" }))).status).toBe(400);
    expect((await POST(await makeReq(URL_, "POST", { body: {} }))).status).toBe(400);
    expect((await POST(await login(""))).status).toBe(400);
    expect((await POST(await login(12345))).status).toBe(400);
    expect((await POST(await login("x".repeat(257)))).status).toBe(400);
  });

  it("إعدادات ناقصة: 500 ولا يُكشف السبب", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await withEnv({ ADMIN_PASSWORD: undefined }, async () => {
      const res = await POST(await login("anything"));
      expect(res.status).toBe(500);
      expect(JSON.stringify(await res.json())).not.toContain("ADMIN_PASSWORD");
    });
    await withEnv({ AUTH_SECRET: "short" }, async () => {
      expect((await POST(await login(PASS))).status).toBe(500);
    });
  });

  describe("تحديد المحاولات", () => {
    it("بعد 5 محاولات فاشلة: 429 مع Retry-After، حتى لكلمة المرور الصحيحة", async () => {
      const ip = freshIp();
      for (let i = 0; i < 5; i++) expect((await POST(await login("bad", ip))).status).toBe(401);

      const blocked = await POST(await login("bad", ip));
      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);

      expect((await POST(await login(PASS, ip))).status).toBe(429);
    });

    it("العناوين الأخرى غير متأثرة", async () => {
      const ip = freshIp();
      for (let i = 0; i < 6; i++) await POST(await login("bad", ip));
      expect((await POST(await login(PASS, freshIp()))).status).toBe(200);
    });

    it("الدخول الناجح يصفّر العدّاد", async () => {
      const ip = freshIp();
      for (let i = 0; i < 4; i++) await POST(await login("bad", ip));
      expect((await POST(await login(PASS, ip))).status).toBe(200);
      for (let i = 0; i < 5; i++) expect((await POST(await login("bad", ip))).status).toBe(401);
      expect((await POST(await login("bad", ip))).status).toBe(429);
    });

    it("تزوير أول قيمة في x-forwarded-for لا يتجاوز الحد", async () => {
      const real = freshIp();
      for (let i = 0; i < 5; i++) {
        const req = await makeReq(URL_, "POST", {
          body: { password: "bad" },
          headers: { "x-forwarded-for": `9.9.9.${i}, ${real}` },
        });
        expect((await POST(req)).status).toBe(401);
      }
      const spoofed = await makeReq(URL_, "POST", {
        body: { password: "bad" },
        headers: { "x-forwarded-for": `1.2.3.4, ${real}` },
      });
      expect((await POST(spoofed)).status).toBe(429);
    });
  });
});
