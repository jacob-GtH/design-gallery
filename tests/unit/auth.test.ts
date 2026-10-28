import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_MAX_AGE_SECONDS, createSessionToken, verifySessionToken } from "@/lib/auth";

const SECRET = "x".repeat(40);
let prev: string | undefined;

beforeEach(() => {
  prev = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = SECRET;
});
afterEach(() => {
  vi.useRealTimers();
  if (prev === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = prev;
});

describe("createSessionToken / verifySessionToken", () => {
  it("يُنشئ توكناً صالحاً بصيغة <expiresAt>.<signature>", async () => {
    const t = await createSessionToken();
    expect(t).toMatch(/^\d{10,16}\.[A-Za-z0-9_-]+$/);
    expect(await verifySessionToken(t)).toBe(true);
  });

  it("تاريخ الانتهاء بعد مدة الجلسة المضبوطة", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1_800_000_000_000);
    const t = (await createSessionToken())!;
    expect(Number(t.split(".")[0])).toBe(1_800_000_000_000 + SESSION_MAX_AGE_SECONDS * 1000);
  });

  it("يفشل بشكل مغلق عند غياب AUTH_SECRET أو قِصره", async () => {
    delete process.env.AUTH_SECRET;
    expect(await createSessionToken()).toBeNull();
    expect(await verifySessionToken("1800000000000.abc")).toBe(false);

    process.env.AUTH_SECRET = "y".repeat(31);
    expect(await createSessionToken()).toBeNull();
  });

  it("يرفض التوكن الفارغ أو الغائب", async () => {
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken(null)).toBe(false);
    expect(await verifySessionToken("")).toBe(false);
  });

  it("يرفض توقيعاً معدَّلاً", async () => {
    const [payload, sig] = (await createSessionToken())!.split(".");
    // نغيّر الحرف الأول (كل بتاته مؤثرة؛ الحرف الأخير يحمل بتات حشو لا تؤثر)
    const bad = (sig[0] === "A" ? "B" : "A") + sig.slice(1);
    expect(await verifySessionToken(`${payload}.${bad}`)).toBe(false);
  });

  it("يرفض تمديد تاريخ الانتهاء مع إبقاء التوقيع", async () => {
    const [payload, sig] = (await createSessionToken())!.split(".");
    const extended = String(Number(payload) + 10 * 24 * 3600 * 1000);
    expect(await verifySessionToken(`${extended}.${sig}`)).toBe(false);
  });

  it("يرفض توكناً موقّعاً بسر مختلف", async () => {
    const t = (await createSessionToken())!;
    process.env.AUTH_SECRET = "z".repeat(40);
    expect(await verifySessionToken(t)).toBe(false);
  });

  it("ينتهي عند انقضاء المدة", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1_800_000_000_000);
    const t = (await createSessionToken())!;
    const ttl = SESSION_MAX_AGE_SECONDS * 1000;

    vi.setSystemTime(1_800_000_000_000 + ttl - 1000);
    expect(await verifySessionToken(t)).toBe(true);

    vi.setSystemTime(1_800_000_000_000 + ttl + 1000);
    expect(await verifySessionToken(t)).toBe(false);
  });

  it.each([
    ["abc"],
    ["a.b.c"],
    ["123.sig"], // payload أقصر من 10 أرقام
    ["12345678901234567.sig"], // أطول من 16 رقماً
    ["1800000000000.!!!"], // ليس base64url
    ["abcdefghijk.sig"], // payload غير رقمي
  ])("يرفض الصيغة المشوّهة: %s", async (bad) => {
    expect(await verifySessionToken(bad)).toBe(false);
  });
});
