import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ fetch: vi.fn(), create: vi.fn() }));
vi.mock("@/lib/sanity.client", () => ({ client: { fetch: h.fetch, create: h.create } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { revalidatePath } from "next/cache";
import { GET, POST } from "@/app/api/designs/route";
import { NOT_DRAFT } from "@/lib/queries";
import { CLOUD_URL, makeReq } from "../helpers";

const URL_ = "http://localhost/api/designs";
const media = [{ _key: "m1", type: "image", url: CLOUD_URL(), caption: "" }];
const valid = (over: Record<string, unknown> = {}) => ({ title: "My Design", designerId: "designer-1", media, ...over });

beforeEach(() => {
  h.fetch.mockResolvedValue([]);
  h.create.mockResolvedValue({ _id: "new-1" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/designs", () => {
  const query = () => h.fetch.mock.calls[0][0] as string;

  it("الزائر لا يرى المسودات", async () => {
    await GET(await makeReq(URL_, "GET"));
    expect(query()).toContain(NOT_DRAFT);
  });
  it("?drafts=1 لا يكفي بدون جلسة المدير", async () => {
    await GET(await makeReq(`${URL_}?drafts=1`, "GET"));
    expect(query()).toContain(NOT_DRAFT);
  });
  it("المدير بدون ?drafts=1 لا يرى المسودات أيضاً", async () => {
    await GET(await makeReq(URL_, "GET", { admin: true }));
    expect(query()).toContain(NOT_DRAFT);
  });
  it("المدير مع ?drafts=1 يرى المسودات", async () => {
    await GET(await makeReq(`${URL_}?drafts=1`, "GET", { admin: true }));
    expect(query()).not.toContain(NOT_DRAFT);
  });
  it("يملأ القيم الافتراضية للمستندات القديمة", async () => {
    h.fetch.mockResolvedValue([{ _id: "a", title: "T", createdAt: "2024-01-01" }]);
    const res = await GET(await makeReq(URL_, "GET"));
    expect(await res.json()).toEqual([
      {
        id: "a",
        title: "T",
        createdAt: "2024-01-01",
        likes: 0,
        viewsCount: 0,
        rating: 0,
        backgroundColor: "#f9fafb",
        status: "published",
        coverKey: null,
        tags: [],
        media: [],
      },
    ]);
  });
  it("يحفظ القيم الموجودة", async () => {
    h.fetch.mockResolvedValue([{ _id: "a", title: "T", status: "draft", coverKey: "k", likes: 3, backgroundColor: "#000000", tags: ["x"], media: [{ _key: "1" }] }]);
    const [d] = await (await GET(await makeReq(URL_, "GET"))).json();
    expect(d).toMatchObject({ status: "draft", coverKey: "k", likes: 3, backgroundColor: "#000000", tags: ["x"] });
  });
  it("فشل Sanity: 500 دون تفاصيل", async () => {
    h.fetch.mockRejectedValue(new Error("internal detail"));
    const res = await GET(await makeReq(URL_, "GET"));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("internal detail");
  });
});

describe("POST /api/designs", () => {
  it("بدون جلسة: 401 ولا يُنشأ شيء", async () => {
    const res = await POST(await makeReq(URL_, "POST", { body: valid() }));
    expect(res.status).toBe(401);
    expect(h.create).not.toHaveBeenCalled();
  });

  it("جسم غير صالح أو بيانات خاطئة: 400 برسالة", async () => {
    expect((await POST(await makeReq(URL_, "POST", { raw: "{", admin: true }))).status).toBe(400);
    const res = await POST(await makeReq(URL_, "POST", { body: valid({ title: "" }), admin: true }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("العنوان مطلوب");
    expect(h.create).not.toHaveBeenCalled();
  });

  it("يرفض وسائط من حساب Cloudinary آخر", async () => {
    const bad = [{ type: "image", url: "https://res.cloudinary.com/other/image/upload/a.jpg" }];
    const res = await POST(await makeReq(URL_, "POST", { body: valid({ media: bad }), admin: true }));
    expect(res.status).toBe(400);
    expect(h.create).not.toHaveBeenCalled();
  });

  it("تصميم منشور: المستند المُنشأ كامل وآمن", async () => {
    const res = await POST(
      await makeReq(URL_, "POST", {
        body: valid({ tags: [{ _ref: "tag-1" }], description: "d", backgroundColor: "#000000", coverKey: "m1" }),
        admin: true,
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.design.id).toBe("new-1");

    expect(h.create).toHaveBeenCalledTimes(1);
    const doc = h.create.mock.calls[0][0];
    expect(doc).toMatchObject({
      _type: "design",
      title: "My Design",
      description: "d",
      backgroundColor: "#000000",
      status: "published",
      coverKey: "m1",
      designer: { _type: "reference", _ref: "designer-1" },
      slug: { _type: "slug" },
    });
    expect(doc.slug.current).toMatch(/^my-design-[0-9a-f]{6}$/);
    expect(new Date(doc.publishedAt).toISOString()).toBe(doc.publishedAt);
    expect(doc.tags).toHaveLength(1);
    expect(doc.tags[0]).toMatchObject({ _type: "reference", _ref: "tag-1" });
    expect(doc.tags[0]._key).toMatch(/^[0-9a-f]{12}$/);
    expect(doc.media[0]).toMatchObject({ _key: "m1", type: "image" });
    expect(revalidatePath).toHaveBeenCalledWith("/designs/[id]", "page");
  });

  it("مسودة: بلا publishedAt ولا مصمم إجباري", async () => {
    const res = await POST(await makeReq(URL_, "POST", { body: { title: "Draft", status: "draft" }, admin: true }));
    expect(res.status).toBe(200);
    const doc = h.create.mock.calls[0][0];
    expect(doc.status).toBe("draft");
    expect(doc).not.toHaveProperty("publishedAt");
    expect(doc).not.toHaveProperty("designer");
    expect(doc).not.toHaveProperty("coverKey");
  });

  it("coverKey غير صالح لا يُحفظ", async () => {
    await POST(await makeReq(URL_, "POST", { body: valid({ coverKey: "ghost" }), admin: true }));
    expect(h.create.mock.calls[0][0]).not.toHaveProperty("coverKey");
  });

  it("الحقول المحمية من العميل (publishedAt, likes, _id, slug) تُتجاهل", async () => {
    await POST(
      await makeReq(URL_, "POST", {
        body: valid({ publishedAt: "2000-01-01", likes: 9999, _id: "hijack", slug: { current: "x" } }),
        admin: true,
      })
    );
    const doc = h.create.mock.calls[0][0];
    expect(doc).not.toHaveProperty("likes");
    expect(doc).not.toHaveProperty("_id");
    expect(doc.publishedAt).not.toBe("2000-01-01");
    expect(doc.slug.current).not.toBe("x");
  });

  it("فشل الإنشاء: 500 دون تسريب التفاصيل", async () => {
    h.create.mockRejectedValue(new Error("secret db detail"));
    const res = await POST(await makeReq(URL_, "POST", { body: valid(), admin: true }));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("secret db detail");
  });
});
