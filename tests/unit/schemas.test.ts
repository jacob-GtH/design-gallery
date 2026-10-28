import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  createDesignSchema,
  firstIssue,
  hasVisual,
  idSchema,
  isEmptyHtml,
  likeSchema,
  makeSlug,
  newKey,
  updateDesignSchema,
} from "@/lib/schemas";
import { CLOUD_URL } from "../helpers";

// القيم الافتراضية للبيئة تأتي من vitest.config.ts (اسم الحساب: mycloud)
const img = (extra: Record<string, unknown> = {}) => ({ type: "image", url: CLOUD_URL(), ...extra });
const txt = (caption: string, extra: Record<string, unknown> = {}) => ({ type: "text", caption, ...extra });
const published = (over: Record<string, unknown> = {}) => ({
  title: "تصميم",
  designerId: "designer-1",
  media: [img()],
  ...over,
});
const draft = (over: Record<string, unknown> = {}) => ({ title: "مسودة", status: "draft", ...over });

const messages = (r: { success: boolean; error?: z.ZodError }) => (r.error?.issues ?? []).map((i) => i.message);
const ok = (r: { success: boolean }) => r.success;

/** يعيد تحميل الوحدة مع متغيرات بيئة مختلفة (تُقرأ عند الاستيراد). */
async function loadSchemas(env: Record<string, string | undefined>) {
  const prev: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    prev[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  vi.resetModules();
  try {
    return await import("@/lib/schemas");
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

describe("idSchema / likeSchema", () => {
  it.each([["abc"], ["a-b_c.d"], ["drafts.abc123"], ["A".repeat(128)]])("يقبل %s", (v) => {
    expect(idSchema.safeParse(v).success).toBe(true);
  });
  it.each([[""], ["a b"], ["a/b"], ["a\\b"], ['a"b'], ["a'b"], ["a;b"], ["A".repeat(129)], ["عربي"]])("يرفض %j", (v) => {
    expect(idSchema.safeParse(v).success).toBe(false);
  });
  it("likeSchema يتطلب id صالحاً", () => {
    expect(likeSchema.safeParse({ id: "abc" }).success).toBe(true);
    expect(likeSchema.safeParse({}).success).toBe(false);
    expect(likeSchema.safeParse({ id: "a b" }).success).toBe(false);
  });
});

describe("createDesignSchema: الحقول الأساسية", () => {
  it("يقبل تصميماً منشوراً بأقل البيانات ويملأ الافتراضيات", () => {
    const r = createDesignSchema.safeParse(published());
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data).toMatchObject({
      title: "تصميم",
      description: "",
      backgroundColor: "#f9fafb",
      tags: [],
      status: "published",
      designerId: "designer-1",
    });
    expect(r.data.coverKey).toBeUndefined();
    expect(r.data.media[0]).toMatchObject({ type: "image", caption: "" });
    expect(r.data.media[0]._key).toMatch(/^[0-9a-f]{12}$/);
  });

  it("العنوان: يُقصّ، ومطلوب، وحده الأقصى 200", () => {
    const r = createDesignSchema.safeParse(published({ title: "  عنوان  " }));
    expect(r.success && r.data.title).toBe("عنوان");
    expect(ok(createDesignSchema.safeParse(published({ title: "   " })))).toBe(false);
    expect(ok(createDesignSchema.safeParse(published({ title: "" })))).toBe(false);
    expect(ok(createDesignSchema.safeParse(published({ title: "a".repeat(200) })))).toBe(true);
    expect(ok(createDesignSchema.safeParse(published({ title: "a".repeat(201) })))).toBe(false);
    expect(ok(createDesignSchema.safeParse({ designerId: "d", media: [img()] }))).toBe(false);
  });

  it("الوصف: حده 5000", () => {
    expect(ok(createDesignSchema.safeParse(published({ description: "a".repeat(5000) })))).toBe(true);
    expect(ok(createDesignSchema.safeParse(published({ description: "a".repeat(5001) })))).toBe(false);
  });

  it.each([["#fff"], ["#FFFFFF"], ["#ffffff80"], ["#a1B2c3"]])("لون صالح %s", (c) => {
    expect(ok(createDesignSchema.safeParse(published({ backgroundColor: c })))).toBe(true);
  });
  it.each([["red"], ["fff"], ["#ggg"], ["#ffff"], ["#fffff"], ["rgb(1,2,3)"], ["#fff; x"], ["url(x)"]])("لون غير صالح %s", (c) => {
    expect(ok(createDesignSchema.safeParse(published({ backgroundColor: c })))).toBe(false);
  });

  it("الوسوم: _ref صالح فقط، حد 30، وتُجرَّد الحقول الزائدة", () => {
    const r = createDesignSchema.safeParse(published({ tags: [{ _ref: "tag-1", evil: "x" }] }));
    expect(r.success && r.data.tags).toEqual([{ _ref: "tag-1" }]);
    expect(ok(createDesignSchema.safeParse(published({ tags: [{ _ref: "a b" }] })))).toBe(false);
    expect(ok(createDesignSchema.safeParse(published({ tags: [{}] })))).toBe(false);
    expect(ok(createDesignSchema.safeParse(published({ tags: Array.from({ length: 30 }, (_, i) => ({ _ref: `t${i}` })) })))).toBe(true);
    expect(ok(createDesignSchema.safeParse(published({ tags: Array.from({ length: 31 }, (_, i) => ({ _ref: `t${i}` })) })))).toBe(false);
  });

  it("status غير معروف مرفوض، والافتراضي published", () => {
    expect(ok(createDesignSchema.safeParse(published({ status: "archived" })))).toBe(false);
  });
});

describe("createDesignSchema: النشر مقابل المسودة", () => {
  it("المنشور يتطلب مصمماً", () => {
    const r = createDesignSchema.safeParse(published({ designerId: undefined }));
    expect(messages(r)).toContain("المصمم مطلوب");
  });
  it('designerId = "" أو null يُعامل كغائب', () => {
    expect(messages(createDesignSchema.safeParse(published({ designerId: "" })))).toContain("المصمم مطلوب");
    expect(messages(createDesignSchema.safeParse(published({ designerId: null })))).toContain("المصمم مطلوب");
  });
  it("المنشور يتطلب صورة أو فيديو أو شبكة", () => {
    const msg = "أضف صورة أو فيديو واحداً على الأقل";
    expect(messages(createDesignSchema.safeParse(published({ media: [] })))).toContain(msg);
    expect(messages(createDesignSchema.safeParse(published({ media: [txt("<p>x</p>")] })))).toContain(msg);
    expect(ok(createDesignSchema.safeParse(published({ media: [{ type: "video", url: CLOUD_URL("video/upload/a.mp4") }] })))).toBe(true);
    expect(ok(createDesignSchema.safeParse(published({ media: [{ type: "grid", items: [{ url: CLOUD_URL() }] }] })))).toBe(true);
  });
  it("المسودة تقبل بيانات ناقصة (عنوان فقط)", () => {
    const r = createDesignSchema.safeParse(draft());
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ status: "draft", media: [], tags: [] });
  });
  it("المسودة لا تُسقط التحقق من الروابط", () => {
    expect(ok(createDesignSchema.safeParse(draft({ media: [img({ url: "https://evil.com/a.png" })] })))).toBe(false);
  });
});

describe("createDesignSchema: روابط الوسائط", () => {
  const withUrl = (url: string) => createDesignSchema.safeParse(draft({ media: [img({ url })] }));

  it("يقبل Cloudinary لحسابك وCloudinary-sanity-unsplash", () => {
    expect(ok(withUrl(CLOUD_URL()))).toBe(true);
    expect(ok(withUrl("https://cdn.sanity.io/images/p/d/a.png"))).toBe(true);
    expect(ok(withUrl("https://images.unsplash.com/photo-1"))).toBe(true);
  });
  it("يرفض حساب Cloudinary آخر (حتى لو بدأ باسم حسابك)", () => {
    expect(ok(withUrl("https://res.cloudinary.com/other/image/upload/a.jpg"))).toBe(false);
    expect(ok(withUrl("https://res.cloudinary.com/mycloud2/image/upload/a.jpg"))).toBe(false);
    expect(ok(withUrl("https://res.cloudinary.com/mycloudx/a.jpg"))).toBe(false);
  });
  it("لا يمكن تجاوز المسار بـ .. أو ترميزه", () => {
    expect(ok(withUrl("https://res.cloudinary.com/mycloud/../other/a.jpg"))).toBe(false);
    expect(ok(withUrl("https://res.cloudinary.com/mycloud/%2e%2e/other/a.jpg"))).toBe(false);
  });
  it("يرفض http والنطاقات المشابهة والتمويه بـ userinfo", () => {
    expect(ok(withUrl("http://res.cloudinary.com/mycloud/a.jpg"))).toBe(false);
    expect(ok(withUrl("https://res.cloudinary.com.evil.com/mycloud/a.jpg"))).toBe(false);
    expect(ok(withUrl("https://res.cloudinary.com@evil.com/mycloud/a.jpg"))).toBe(false);
    expect(ok(withUrl("https://evil.com/mycloud/a.jpg"))).toBe(false);
  });
  it("يرفض غير الروابط والبروتوكولات الأخرى والطويل", () => {
    for (const v of ["", "not a url", "javascript:alert(1)", "data:image/png;base64,AAAA", "ftp://res.cloudinary.com/mycloud/a.jpg"]) {
      expect(ok(withUrl(v))).toBe(false);
    }
    expect(ok(withUrl(CLOUD_URL("image/upload/" + "a".repeat(2100))))).toBe(false);
  });
  it("بدون اسم حساب Cloudinary في البيئة تُرفض روابطه (fail closed) وتبقى بقية المصادر", async () => {
    const m = await loadSchemas({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: undefined });
    const parse = (url: string) => m.createDesignSchema.safeParse(draft({ media: [img({ url })] })).success;
    expect(parse(CLOUD_URL())).toBe(false);
    expect(parse("https://cdn.sanity.io/images/p/d/a.png")).toBe(true);
  });
  it("ALLOWED_MEDIA_HOSTS يضيف مضيفات (بلا حساسية للحروف)", async () => {
    const m = await loadSchemas({ ALLOWED_MEDIA_HOSTS: "Cdn.Example.com, other.org" });
    const parse = (url: string) => m.createDesignSchema.safeParse(draft({ media: [img({ url })] })).success;
    expect(parse("https://cdn.example.com/a.png")).toBe(true);
    expect(parse("https://other.org/a.png")).toBe(true);
    expect(parse("https://third.org/a.png")).toBe(false);
  });
});

describe("createDesignSchema: كتل المحتوى", () => {
  const media = (blocks: unknown[]) => createDesignSchema.safeParse(draft({ media: blocks }));
  const out = (blocks: unknown[]) => {
    const r = media(blocks);
    if (!r.success) throw new Error(JSON.stringify(r.error.issues));
    return r.data.media;
  };

  it("_key المرسل يُحفظ، والغائب يُولَّد (12 خانة hex)", () => {
    const m = out([img({ _key: "mine" }), img()]);
    expect(m[0]._key).toBe("mine");
    expect(m[1]._key).toMatch(/^[0-9a-f]{12}$/);
  });
  it("يرفض _key مكرراً بين الكتل وبين عناصر الشبكة", () => {
    expect(messages(media([img({ _key: "k" }), img({ _key: "k" })]))).toContain("مفتاح مكرر في الأقسام");
    const grid = { type: "grid", items: [{ _key: "i", url: CLOUD_URL() }, { _key: "i", url: CLOUD_URL() }] };
    expect(messages(media([grid]))).toContain("مفتاح مكرر في الشبكة");
  });
  it("الحد الأقصى 60 كتلة", () => {
    expect(ok(media(Array.from({ length: 60 }, () => txt("<p>x</p>"))))).toBe(true);
    expect(ok(media(Array.from({ length: 61 }, () => txt("<p>x</p>"))))).toBe(false);
  });
  it("نوع كتلة مجهول أو بيانات ناقصة مرفوضة", () => {
    expect(ok(media([{ type: "script", url: CLOUD_URL() }]))).toBe(false);
    expect(ok(media([{ type: "image" }]))).toBe(false);
    expect(ok(media([{ type: "text" }]))).toBe(false);
  });

  describe("نص", () => {
    it("يُنظَّف من السكربتات", () => {
      expect(out([txt("<p>hi</p><script>alert(1)</script>")])[0]).toMatchObject({ type: "text", caption: "<p>hi</p>" });
    });
    it("الفارغ فعلياً يُحذف، والفاصل <hr> يبقى", () => {
      expect(out([txt("<p></p>"), txt("<p>&nbsp;</p>"), txt("   "), txt("<p><br></p>")])).toEqual([]);
      const m = out([txt("<hr>")]);
      expect(m).toHaveLength(1);
      expect(m[0].caption).toContain("<hr");
    });
    it("الحد الأقصى 50000 حرف", () => {
      expect(ok(media([txt("a".repeat(50001))]))).toBe(false);
    });
  });

  describe("صورة/فيديو", () => {
    it("الـ caption يُنظَّف ويُملأ افتراضياً بفراغ", () => {
      const m = out([img({ caption: '<p onclick="x()">a</p><script>1</script>' }), img()]);
      expect(m[0]).toMatchObject({ caption: "<p>a</p>" });
      expect(m[1]).toMatchObject({ caption: "" });
    });
  });

  describe("تضمين", () => {
    it("يُحوَّل إلى الرابط المعياري", () => {
      expect(out([{ type: "embed", url: "https://youtu.be/dQw4w9WgXcQ" }])[0]).toMatchObject({
        type: "embed",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      });
      expect(out([{ type: "embed", url: "https://player.vimeo.com/video/123456789" }])[0]).toMatchObject({
        url: "https://vimeo.com/123456789",
      });
    });
    it("يرفض المصادر غير المدعومة برسالة واضحة", () => {
      const m = messages(media([{ type: "embed", url: "https://evil.com/x" }]));
      expect(m.join(" ")).toContain("غير مدعوم");
      expect(ok(media([{ type: "embed", url: "javascript:alert(1)" }]))).toBe(false);
    });
  });

  describe("شبكة", () => {
    const items = (n: number) => Array.from({ length: n }, () => ({ url: CLOUD_URL() }));
    it("الأعمدة الافتراضية min(عدد,3) وتحفظ المرسل", () => {
      expect(out([{ type: "grid", items: items(2) }])[0]).toMatchObject({ type: "grid", columns: 2 });
      expect(out([{ type: "grid", items: items(5) }])[0]).toMatchObject({ columns: 3 });
      expect(out([{ type: "grid", columns: 4, items: items(2) }])[0]).toMatchObject({ columns: 4 });
    });
    it("حدود الأعمدة والعناصر", () => {
      expect(ok(media([{ type: "grid", columns: 0, items: items(1) }]))).toBe(false);
      expect(ok(media([{ type: "grid", columns: 5, items: items(1) }]))).toBe(false);
      expect(ok(media([{ type: "grid", columns: 1.5, items: items(1) }]))).toBe(false);
      expect(ok(media([{ type: "grid", items: [] }]))).toBe(false);
      expect(ok(media([{ type: "grid", items: items(12) }]))).toBe(true);
      expect(ok(media([{ type: "grid", items: items(13) }]))).toBe(false);
    });
    it("روابط عناصرها تخضع لقاعدة المصادر", () => {
      expect(ok(media([{ type: "grid", items: [{ url: "https://evil.com/a.png" }] }]))).toBe(false);
    });
    it("كل عنصر يحصل على _key", () => {
      const g = out([{ type: "grid", items: [{ url: CLOUD_URL() }, { _key: "keep", url: CLOUD_URL() }] }])[0] as { items: { _key: string }[] };
      expect(g.items[0]._key).toMatch(/^[0-9a-f]{12}$/);
      expect(g.items[1]._key).toBe("keep");
    });
  });
});

describe("coverKey", () => {
  const blocks = [img({ _key: "img1" }), txt("<p>x</p>", { _key: "t1" })];
  const cover = (coverKey: unknown) => {
    const r = createDesignSchema.safeParse(published({ media: blocks, coverKey }));
    return r.success ? r.data.coverKey : "ERR";
  };
  it("يبقى إن أشار إلى كتلة مرئية", () => expect(cover("img1")).toBe("img1"));
  it("يُحذف إن أشار إلى نص أو مفتاح غير موجود", () => {
    expect(cover("t1")).toBeUndefined();
    expect(cover("ghost")).toBeUndefined();
  });
  it("null/غائب => غير معرّف", () => {
    expect(cover(null)).toBeUndefined();
    expect(cover(undefined)).toBeUndefined();
  });
  it("الطويل جداً مرفوض", () => expect(cover("k".repeat(65))).toBe("ERR"));
});

describe("updateDesignSchema", () => {
  it("لا يملأ قيماً افتراضية: الحقول الغائبة تبقى غير معرّفة (حتى لا تمسح بيانات)", () => {
    const r = updateDesignSchema.safeParse({ title: "T" });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.description).toBeUndefined();
    expect(r.data.backgroundColor).toBeUndefined();
    expect(r.data.media).toBeUndefined();
    expect(r.data.tags).toBeUndefined();
    expect(r.data.status).toBeUndefined();
    expect(r.data.coverKey).toBeUndefined();
  });
  it('الوصف الفارغ "" المرسل صراحةً يبقى ""', () => {
    const r = updateDesignSchema.safeParse({ title: "T", description: "" });
    expect(r.success && r.data.description).toBe("");
  });
  it("العنوان مطلوب", () => {
    expect(ok(updateDesignSchema.safeParse({}))).toBe(false);
    expect(ok(updateDesignSchema.safeParse({ title: " " }))).toBe(false);
  });
  it("coverKey = null يعني إزالة الغلاف ويبقى null", () => {
    const r = updateDesignSchema.safeParse({ title: "T", coverKey: null });
    expect(r.success && r.data.coverKey).toBeNull();
  });
  it("coverKey مع media يُتحقق منه، وبدون media يمرّ كما هو", () => {
    const media = [img({ _key: "a" }), txt("<p>x</p>", { _key: "t" })];
    const get = (extra: Record<string, unknown>) => {
      const r = updateDesignSchema.safeParse({ title: "T", ...extra });
      return r.success ? r.data.coverKey : "ERR";
    };
    expect(get({ media, coverKey: "a" })).toBe("a");
    expect(get({ media, coverKey: "t" })).toBeUndefined();
    expect(get({ media, coverKey: "ghost" })).toBeUndefined();
    expect(get({ coverKey: "a" })).toBe("a");
  });
  it("النشر الصريح يتطلب مصمماً، وصورة إن أُرسلت media", () => {
    expect(messages(updateDesignSchema.safeParse({ title: "T", status: "published" }))).toContain("المصمم مطلوب");
    const r = updateDesignSchema.safeParse({ title: "T", status: "published", designerId: "d", media: [txt("<p>x</p>")] });
    expect(messages(r)).toContain("أضف صورة أو فيديو واحداً على الأقل");
    expect(ok(updateDesignSchema.safeParse({ title: "T", status: "published", designerId: "d" }))).toBe(true);
    expect(ok(updateDesignSchema.safeParse({ title: "T", status: "published", designerId: "d", media: [img()] }))).toBe(true);
  });
  it("المسودة تقبل ناقصاً", () => {
    expect(ok(updateDesignSchema.safeParse({ title: "T", status: "draft", media: [] }))).toBe(true);
  });
  it("publishedAt المرسل يُتجاهل (يحدده الخادم)", () => {
    const r = updateDesignSchema.safeParse({ title: "T", publishedAt: "2000-01-01" });
    expect(r.success && "publishedAt" in r.data).toBe(false);
  });
  it("نفس قواعد الروابط والتنظيف", () => {
    expect(ok(updateDesignSchema.safeParse({ title: "T", media: [img({ url: "https://evil.com/a.png" })] }))).toBe(false);
    const r = updateDesignSchema.safeParse({ title: "T", media: [img({ caption: "<script>x</script><p>a</p>" })] });
    expect(r.success && r.data.media?.[0].caption).toBe("<p>a</p>");
  });
});

describe("makeSlug", () => {
  it("يدعم العربية ويضيف لاحقة عشوائية", () => {
    expect(makeSlug("تصميم جديد")).toMatch(/^تصميم-جديد-[0-9a-f]{6}$/);
  });
  it("حروف لاتينية صغيرة ورموز تُحوَّل إلى شرطات", () => {
    expect(makeSlug("Hello World!!")).toMatch(/^hello-world-[0-9a-f]{6}$/);
    expect(makeSlug("  --Hi--  ")).toMatch(/^hi-[0-9a-f]{6}$/);
    expect(makeSlug("2024 Logo")).toMatch(/^2024-logo-[0-9a-f]{6}$/);
  });
  it("رموز فقط => لاحقة فقط", () => {
    expect(makeSlug("!!! ???")).toMatch(/^[0-9a-f]{6}$/);
  });
  it("يقصّ الأساس إلى 80 حرفاً", () => {
    expect(makeSlug("a".repeat(200))).toHaveLength(80 + 1 + 6);
  });
  it("عنوانان متطابقان يعطيان slug مختلفين", () => {
    expect(makeSlug("نفس العنوان")).not.toBe(makeSlug("نفس العنوان"));
  });
});

describe("أدوات أخرى", () => {
  it("isEmptyHtml", () => {
    for (const h of ["", "<p></p>", "<p>&nbsp;</p>", "<p> <br> </p>", "<img src=x>", "  "]) expect(isEmptyHtml(h)).toBe(true);
    for (const h of ["<p>x</p>", "<hr>", "<p><hr /></p>", "نص"]) expect(isEmptyHtml(h)).toBe(false);
  });
  it("newKey: 12 خانة hex وفريد", () => {
    expect(newKey()).toMatch(/^[0-9a-f]{12}$/);
    expect(newKey()).not.toBe(newKey());
  });
  it("hasVisual", () => {
    expect(hasVisual([{ _key: "a", type: "image", url: "u", caption: "" }])).toBe(true);
    expect(hasVisual([{ _key: "a", type: "grid", columns: 2, items: [], caption: "" }])).toBe(true);
    expect(hasVisual([{ _key: "a", type: "text", caption: "" }, { _key: "b", type: "embed", url: "u", caption: "" }])).toBe(false);
    expect(hasVisual([])).toBe(false);
  });
  it("firstIssue", () => {
    expect(firstIssue(new z.ZodError([]))).toBe("بيانات غير صالحة");
    const r = createDesignSchema.safeParse(published({ title: "" }));
    expect(!r.success && firstIssue(r.error)).toBe("العنوان مطلوب");
  });
});
