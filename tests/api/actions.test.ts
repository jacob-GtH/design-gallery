import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ cookies: vi.fn(), fetch: vi.fn(), create: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: h.cookies }));
vi.mock("@/lib/sanity.client", () => ({ client: { fetch: h.fetch, create: h.create } }));

import { getOrCreateTag } from "@/lib/actions";
import { SESSION_COOKIE, createSessionToken } from "@/lib/auth";

const asVisitor = () => h.cookies.mockResolvedValue({ get: () => undefined });
const asAdmin = async () => {
  const value = (await createSessionToken())!;
  h.cookies.mockResolvedValue({ get: (n: string) => (n === SESSION_COOKIE ? { name: n, value } : undefined) });
};

beforeEach(() => {
  h.fetch.mockResolvedValue(null);
  h.create.mockResolvedValue({ _id: "new-tag" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getOrCreateTag", () => {
  it("بلا جلسة: null ولا يلمس قاعدة البيانات", async () => {
    asVisitor();
    expect(await getOrCreateTag("design")).toBeNull();
    expect(h.fetch).not.toHaveBeenCalled();
    expect(h.create).not.toHaveBeenCalled();
  });

  it("كوكي تالف: null", async () => {
    h.cookies.mockResolvedValue({ get: () => ({ name: SESSION_COOKIE, value: "garbage" }) });
    expect(await getOrCreateTag("design")).toBeNull();
    expect(h.create).not.toHaveBeenCalled();
  });

  it("وسم موجود: يعيد مرجعه دون إنشاء", async () => {
    await asAdmin();
    h.fetch.mockResolvedValue({ _id: "tag-9" });
    expect(await getOrCreateTag("design")).toEqual({ _type: "reference", _ref: "tag-9" });
    expect(h.create).not.toHaveBeenCalled();
    expect(h.fetch.mock.calls[0][1]).toEqual({ tag: "design" }); // معامل وليس نصاً مدمجاً في GROQ
  });

  it("وسم جديد: يُنشأ ويُعاد مرجعه، ويُقصّ النص", async () => {
    await asAdmin();
    expect(await getOrCreateTag("  شعار  ")).toEqual({ _type: "reference", _ref: "new-tag" });
    expect(h.create).toHaveBeenCalledWith({ _type: "tag", title: "شعار" });
  });

  it("مدخلات غير صالحة: null", async () => {
    await asAdmin();
    expect(await getOrCreateTag("")).toBeNull();
    expect(await getOrCreateTag("   ")).toBeNull();
    expect(await getOrCreateTag("a".repeat(51))).toBeNull();
    expect(await getOrCreateTag(123 as unknown as string)).toBeNull();
    expect(h.create).not.toHaveBeenCalled();
    expect(await getOrCreateTag("a".repeat(50))).not.toBeNull();
  });

  it("خطأ في Sanity: null", async () => {
    await asAdmin();
    h.fetch.mockRejectedValue(new Error("boom"));
    expect(await getOrCreateTag("x")).toBeNull();
  });
});
