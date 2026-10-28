import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const chain = { set: vi.fn(), unset: vi.fn(), commit: vi.fn() };
  chain.set.mockReturnValue(chain);
  chain.unset.mockReturnValue(chain);
  return { chain, fetch: vi.fn(), delete: vi.fn(), patch: vi.fn(() => chain) };
});
vi.mock("@/lib/sanity.client", () => ({ client: { fetch: h.fetch, delete: h.delete, patch: h.patch } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { revalidatePath } from "next/cache";
import { DELETE, GET, PATCH } from "@/app/api/designs/[id]/route";
import { NOT_DRAFT } from "@/lib/queries";
import { CLOUD_URL, ctx, makeReq } from "../helpers";

const URL_ = "http://localhost/api/designs/d1";
const existing = (o: Record<string, unknown> = {}) => ({
  _id: "d1",
  status: "published",
  publishedAt: "2024-01-01T00:00:00.000Z",
  hasDesigner: true,
  ...o,
});
const img = (extra: Record<string, unknown> = {}) => ({ type: "image", url: CLOUD_URL(), ...extra });
const patch = (body: unknown, opts: { admin?: boolean; id?: string; raw?: string } = {}) =>
  makeReq(URL_, "PATCH", { body: opts.raw ? undefined : body, raw: opts.raw, admin: opts.admin ?? true }).then((req) =>
    PATCH(req, ctx(opts.id ?? "d1"))
  );
const setArg = () => h.chain.set.mock.calls[0][0] as Record<string, unknown>;

beforeEach(() => {
  h.fetch.mockResolvedValue(existing());
  h.chain.commit.mockResolvedValue({});
  h.delete.mockResolvedValue({});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/designs/[id]", () => {
  const get = async (id = "d1", admin = false) => GET(await makeReq(URL_, "GET", { admin }), ctx(id));

  it("معرّف غير صالح: 400 دون استعلام", async () => {
    expect((await get("a b")).status).toBe(400);
    expect(h.fetch).not.toHaveBeenCalled();
  });
  it("الزائر لا يرى المسودة، والمدير يراها", async () => {
    await get("d1", false);
    expect(h.fetch.mock.calls[0][0]).toContain(NOT_DRAFT);
    h.fetch.mockClear();
    await get("d1", true);
    expect(h.fetch.mock.calls[0][0]).not.toContain(NOT_DRAFT);
  });
  it("غير موجود: 404", async () => {
    h.fetch.mockResolvedValue(null);
    expect((await get()).status).toBe(404);
  });
  it("يعيد الشكل مع قيم افتراضية للمستندات القديمة", async () => {
    h.fetch.mockResolvedValue({ _id: "d1", title: "T" });
    const body = await (await get()).json();
    expect(body).toMatchObject({ id: "d1", title: "T", status: "published", coverKey: null, media: [] });
    expect(body).not.toHaveProperty("_id");
  });
  it("500 دون تسريب", async () => {
    h.fetch.mockRejectedValue(new Error("secret"));
    const res = await get();
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("secret");
  });
});

describe("DELETE /api/designs/[id]", () => {
  const del = async (id = "d1", admin = true) => DELETE(await makeReq(URL_, "DELETE", { admin }), ctx(id));

  it("بدون جلسة: 401 ولا شيء يُحذف", async () => {
    expect((await del("d1", false)).status).toBe(401);
    expect(h.fetch).not.toHaveBeenCalled();
    expect(h.delete).not.toHaveBeenCalled();
  });
  it("معرّف غير صالح: 400", async () => {
    expect((await del("a/b")).status).toBe(400);
    expect(h.delete).not.toHaveBeenCalled();
  });
  it("مستند ليس تصميماً أو غير موجود: 404 ولا حذف", async () => {
    h.fetch.mockResolvedValue(null);
    expect((await del("tag-1")).status).toBe(404);
    expect(h.delete).not.toHaveBeenCalled();
    expect(h.fetch.mock.calls[0][0]).toContain('_type == "design"');
  });
  it("نجاح: يحذف ويُعيد التوليد", async () => {
    const res = await del();
    expect(res.status).toBe(200);
    expect(h.delete).toHaveBeenCalledWith("d1");
    expect(revalidatePath).toHaveBeenCalledWith("/designs/[id]", "page");
  });
  it("فشل: 500", async () => {
    h.delete.mockRejectedValue(new Error("x"));
    expect((await del()).status).toBe(500);
  });
});

describe("PATCH /api/designs/[id]", () => {
  describe("الحماية والتحقق", () => {
    it("بدون جلسة: 401 دون أي استعلام", async () => {
      expect((await patch({ title: "T" }, { admin: false })).status).toBe(401);
      expect(h.fetch).not.toHaveBeenCalled();
      expect(h.patch).not.toHaveBeenCalled();
    });
    it("جسم تالف أو بيانات خاطئة: 400", async () => {
      expect((await patch(undefined, { raw: "{" })).status).toBe(400);
      const res = await patch({});
      expect(res.status).toBe(400);
      expect(h.patch).not.toHaveBeenCalled();
    });
    it("معرّف غير صالح: 400 دون استعلام", async () => {
      expect((await patch({ title: "T" }, { id: "a b" })).status).toBe(400);
      expect(h.fetch).not.toHaveBeenCalled();
    });
    it("مستند غير موجود أو ليس تصميماً: 404", async () => {
      h.fetch.mockResolvedValue(null);
      expect((await patch({ title: "T" })).status).toBe(404);
      expect(h.patch).not.toHaveBeenCalled();
    });
    it("وسائط من حساب غريب: 400", async () => {
      const res = await patch({ title: "T", media: [img({ url: "https://res.cloudinary.com/other/a.jpg" })] });
      expect(res.status).toBe(400);
      expect(h.patch).not.toHaveBeenCalled();
    });
    it("فشل الحفظ: 500 دون تسريب", async () => {
      h.chain.commit.mockRejectedValue(new Error("secret detail"));
      const res = await patch({ title: "T" });
      expect(res.status).toBe(500);
      expect(JSON.stringify(await res.json())).not.toContain("secret detail");
    });
  });

  describe("التحديث الجزئي (لا يمسح ما لم يُرسل)", () => {
    it("العنوان فقط: set يحمل title وstatus فقط", async () => {
      const res = await patch({ title: "New" });
      expect(res.status).toBe(200);
      expect(h.patch).toHaveBeenCalledWith("d1");
      expect(h.chain.set).toHaveBeenCalledWith({ title: "New", status: "published" });
      expect(h.chain.unset).not.toHaveBeenCalled();
      expect(h.chain.commit).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith("/designs/[id]", "page");
    });
    it("الوصف واللون يُكتبان فقط عند إرسالهما (حتى الوصف الفارغ)", async () => {
      await patch({ title: "T", description: "", backgroundColor: "#000000" });
      expect(setArg()).toMatchObject({ description: "", backgroundColor: "#000000" });
    });
    it("الوسوم تحصل على _key", async () => {
      await patch({ title: "T", tags: [{ _ref: "tag-1" }] });
      const tags = setArg().tags as Array<Record<string, string>>;
      expect(tags[0]).toMatchObject({ _type: "reference", _ref: "tag-1" });
      expect(tags[0]._key).toMatch(/^[0-9a-f]{12}$/);
    });
    it("المصمم يُحفظ كمرجع، والوسائط تُنظَّف", async () => {
      await patch({ title: "T", designerId: "des-2", media: [img({ _key: "a", caption: "<p>x</p><script>1</script>" })] });
      expect(setArg().designer).toEqual({ _type: "reference", _ref: "des-2" });
      expect((setArg().media as Array<{ caption: string }>)[0].caption).toBe("<p>x</p>");
    });
    it("الحقول الحساسة المرسلة (publishedAt, likes) لا تصل إلى set", async () => {
      await patch({ title: "T", publishedAt: "2000-01-01", likes: 99, _id: "x" });
      expect(setArg()).toEqual({ title: "T", status: "published" });
    });
  });

  describe("الحالة وتاريخ النشر", () => {
    it("بدون status تبقى الحالة الحالية (مسودة)", async () => {
      h.fetch.mockResolvedValue(existing({ status: "draft", hasDesigner: false, publishedAt: undefined }));
      const res = await patch({ title: "T" });
      expect(res.status).toBe(200);
      expect(setArg().status).toBe("draft");
      expect(setArg()).not.toHaveProperty("publishedAt");
    });
    it("من مسودة إلى منشور: يضبط publishedAt", async () => {
      h.fetch.mockResolvedValue(existing({ status: "draft", publishedAt: "1999-01-01T00:00:00.000Z" }));
      await patch({ title: "T", status: "published", designerId: "des-1" });
      expect(setArg().status).toBe("published");
      const at = setArg().publishedAt as string;
      expect(at).not.toBe("1999-01-01T00:00:00.000Z");
      expect(new Date(at).toISOString()).toBe(at);
    });
    it("مستند قديم بلا status ولا publishedAt يُعدّ منشوراً ويحصل على تاريخ", async () => {
      h.fetch.mockResolvedValue({ _id: "d1", hasDesigner: true });
      await patch({ title: "T" });
      expect(setArg().status).toBe("published");
      expect(setArg().publishedAt).toBeTruthy();
    });
    it("منشور له تاريخ: لا يُغيَّر تاريخ النشر", async () => {
      await patch({ title: "T", status: "published", designerId: "des-1" });
      expect(setArg()).not.toHaveProperty("publishedAt");
    });
    it("من منشور إلى مسودة: لا يمسّ publishedAt", async () => {
      await patch({ title: "T", status: "draft" });
      expect(setArg().status).toBe("draft");
      expect(setArg()).not.toHaveProperty("publishedAt");
    });
  });

  describe("اكتمال المستند المنشور (حسب الحالة الفعلية لا حالة الطلب)", () => {
    it("منشور حالياً وإرسال وسائط بلا صورة/فيديو (بدون status): 400", async () => {
      const res = await patch({ title: "T", media: [{ type: "text", caption: "<p>x</p>" }] });
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("أضف صورة أو فيديو واحداً على الأقل");
      expect(h.patch).not.toHaveBeenCalled();
    });
    it("منشور حالياً وإفراغ الوسائط تماماً: 400", async () => {
      expect((await patch({ title: "T", media: [] })).status).toBe(400);
    });
    it("منشور بلا مصمم ولا designerId في الطلب: 400", async () => {
      h.fetch.mockResolvedValue(existing({ hasDesigner: false }));
      const res = await patch({ title: "T" });
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("المصمم مطلوب");
    });
    it("منشور بلا مصمم لكن الطلب يحدد designerId: يمرّ", async () => {
      h.fetch.mockResolvedValue(existing({ hasDesigner: false }));
      expect((await patch({ title: "T", designerId: "des-1" })).status).toBe(200);
    });
    it("المسودة تقبل وسائط نصية فقط وبلا مصمم", async () => {
      h.fetch.mockResolvedValue(existing({ status: "draft", hasDesigner: false }));
      expect((await patch({ title: "T", media: [{ type: "text", caption: "<p>x</p>" }] })).status).toBe(200);
    });
  });

  describe("الغلاف coverKey", () => {
    it("coverKey صالح مع الوسائط: يُحفظ ولا يُحذف", async () => {
      await patch({ title: "T", media: [img({ _key: "a" })], coverKey: "a" });
      expect(setArg().coverKey).toBe("a");
      expect(h.chain.unset).not.toHaveBeenCalled();
    });
    it("coverKey = null: يُزال", async () => {
      await patch({ title: "T", coverKey: null });
      expect(h.chain.unset).toHaveBeenCalledWith(["coverKey"]);
      expect(setArg()).not.toHaveProperty("coverKey");
    });
    it("إرسال وسائط بلا coverKey صالح: يُزال الغلاف القديم", async () => {
      await patch({ title: "T", media: [img({ _key: "a" })], coverKey: "ghost" });
      expect(h.chain.unset).toHaveBeenCalledWith(["coverKey"]);
      h.chain.unset.mockClear();
      await patch({ title: "T", media: [img({ _key: "a" })] });
      expect(h.chain.unset).toHaveBeenCalledWith(["coverKey"]);
    });
    it("بلا وسائط ولا coverKey: لا يُمسّ الغلاف", async () => {
      await patch({ title: "T" });
      expect(h.chain.unset).not.toHaveBeenCalled();
      expect(setArg()).not.toHaveProperty("coverKey");
    });
  });
});
