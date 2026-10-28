import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getClientIp, rateLimit, resetRateLimit } from "@/lib/rateLimit";

let n = 0;
const key = () => `k${++n}`;
afterEach(() => vi.useRealTimers());

describe("rateLimit", () => {
  it("يسمح حتى الحد ثم يمنع", () => {
    const k = key();
    for (let i = 0; i < 3; i++) expect(rateLimit(k, 3, 1000).ok).toBe(true);
    expect(rateLimit(k, 3, 1000).ok).toBe(false);
    expect(rateLimit(k, 3, 1000).ok).toBe(false);
  });

  it("retryAfterSeconds بين 1 وطول النافذة", () => {
    const k = key();
    rateLimit(k, 1, 10_000);
    const r = rateLimit(k, 1, 10_000);
    expect(r.ok).toBe(false);
    expect(r.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(r.retryAfterSeconds).toBeLessThanOrEqual(10);
  });

  it("المفاتيح مستقلة عن بعضها", () => {
    const a = key(), b = key();
    rateLimit(a, 1, 1000);
    expect(rateLimit(a, 1, 1000).ok).toBe(false);
    expect(rateLimit(b, 1, 1000).ok).toBe(true);
  });

  it("تبدأ نافذة جديدة بعد انتهاء المدة", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1_000_000);
    const k = key();
    rateLimit(k, 1, 60_000);
    expect(rateLimit(k, 1, 60_000).ok).toBe(false);

    vi.setSystemTime(1_000_000 + 60_001);
    expect(rateLimit(k, 1, 60_000).ok).toBe(true);
  });

  it("resetRateLimit يصفّر العدّاد", () => {
    const k = key();
    rateLimit(k, 1, 1000);
    expect(rateLimit(k, 1, 1000).ok).toBe(false);
    resetRateLimit(k);
    expect(rateLimit(k, 1, 1000).ok).toBe(true);
  });

  it("reset لمفتاح غير موجود لا يرمي خطأ", () => {
    expect(() => resetRateLimit("never-used")).not.toThrow();
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) => new Request("http://localhost", { headers });
  let prev: string | undefined;
  beforeEach(() => {
    prev = process.env.TRUSTED_PROXY_HOPS;
    delete process.env.TRUSTED_PROXY_HOPS;
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.TRUSTED_PROXY_HOPS;
    else process.env.TRUSTED_PROXY_HOPS = prev;
  });

  it("الافتراضي: يأخذ آخر عنوان (الذي أضافه الـ proxy الموثوق) لا الأول المزوَّر", () => {
    expect(getClientIp(req({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
    expect(getClientIp(req({ "x-forwarded-for": "203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("TRUSTED_PROXY_HOPS=2 يأخذ العنصر الثاني من اليمين", () => {
    process.env.TRUSTED_PROXY_HOPS = "2";
    expect(getClientIp(req({ "x-forwarded-for": "6.6.6.6, 203.0.113.9, 10.0.0.1" }))).toBe("203.0.113.9");
  });

  it("إن كانت القائمة أقصر من العدد المضبوط يأخذ الأول بدل الانهيار", () => {
    process.env.TRUSTED_PROXY_HOPS = "5";
    expect(getClientIp(req({ "x-forwarded-for": "203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("TRUSTED_PROXY_HOPS=0 يتجاهل الترويسات", () => {
    process.env.TRUSTED_PROXY_HOPS = "0";
    expect(getClientIp(req({ "x-forwarded-for": "6.6.6.6", "x-real-ip": "7.7.7.7" }))).toBe("unknown");
  });

  it.each([[""], ["   "], ["abc"], ["-1"], ["1.5"]])(
    "قيمة غير صالحة (%j) تعود للافتراضي 1 ولا توحّد كل الزوار في عنوان واحد",
    (v) => {
      process.env.TRUSTED_PROXY_HOPS = v;
      expect(getClientIp(req({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
    }
  );

  it("يرجع إلى x-real-ip ثم unknown", () => {
    expect(getClientIp(req({ "x-real-ip": " 7.7.7.7 " }))).toBe("7.7.7.7");
    expect(getClientIp(req({}))).toBe("unknown");
  });

  it("يتجاهل عناصر فارغة في x-forwarded-for", () => {
    expect(getClientIp(req({ "x-forwarded-for": "6.6.6.6, , 203.0.113.9," }))).toBe("203.0.113.9");
  });
});
