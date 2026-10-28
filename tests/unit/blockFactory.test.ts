import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_FILE_BYTES,
  blocksFromPersisted,
  isVisualBlock,
  makeEmbedBlock,
  makeGridBlock,
  makeMediaBlock,
  makeTextBlock,
  validateFiles,
} from "@/components/editor/blockFactory";

const file = (name: string, type: string, size?: number) => {
  const f = new File(["x"], name, { type });
  if (size !== undefined) Object.defineProperty(f, "size", { value: size });
  return f;
};

afterEach(() => vi.restoreAllMocks());

describe("validateFiles", () => {
  it("صور فقط: يقبل الصور ويرفض الفيديو بسبب النوع", () => {
    const { valid, rejected } = validateFiles([file("a.png", "image/png"), file("b.mp4", "video/mp4")], "image");
    expect(valid.map((f) => f.name)).toEqual(["a.png"]);
    expect(rejected).toEqual([{ file: expect.any(File), reason: "type" }]);
  });
  it("فيديو فقط", () => {
    const { valid, rejected } = validateFiles([file("a.png", "image/png"), file("b.webm", "video/webm")], "video");
    expect(valid.map((f) => f.name)).toEqual(["b.webm"]);
    expect(rejected[0].reason).toBe("type");
  });
  it("any: يقبل الاثنين", () => {
    const { valid } = validateFiles([file("a.jpg", "image/jpeg"), file("b.mov", "video/quicktime")], "any");
    expect(valid).toHaveLength(2);
  });
  it("يرفض الأنواع الخطرة وغير المدعومة (SVG, HTML, PDF, JS)", () => {
    const bad = ["image/svg+xml", "text/html", "application/pdf", "application/javascript", ""].map((t) => file("x", t));
    const { valid, rejected } = validateFiles(bad, "any");
    expect(valid).toHaveLength(0);
    expect(rejected.every((r) => r.reason === "type")).toBe(true);
  });
  it("الحجم: الحد نفسه مقبول وما فوقه مرفوض", () => {
    const ok = file("ok.png", "image/png", MAX_FILE_BYTES);
    const big = file("big.png", "image/png", MAX_FILE_BYTES + 1);
    const { valid, rejected } = validateFiles([ok, big], "image");
    expect(valid).toEqual([ok]);
    expect(rejected).toEqual([{ file: big, reason: "size" }]);
  });
  it("النوع يُفحص قبل الحجم", () => {
    const { rejected } = validateFiles([file("x.svg", "image/svg+xml", MAX_FILE_BYTES * 2)], "image");
    expect(rejected[0].reason).toBe("type");
  });
  it("قائمة فارغة", () => {
    expect(validateFiles([], "any")).toEqual({ valid: [], rejected: [] });
  });
});

describe("blocksFromPersisted", () => {
  it("null/undefined/[] => []", () => {
    expect(blocksFromPersisted(null)).toEqual([]);
    expect(blocksFromPersisted(undefined)).toEqual([]);
    expect(blocksFromPersisted([])).toEqual([]);
  });

  it("صورة وفيديو: تُعدّان مرفوعتين مسبقاً", () => {
    const r = blocksFromPersisted([
      { _key: "i", type: "image", url: "https://x/i.jpg", caption: "<p>c</p>" },
      { _key: "v", type: "video", url: "https://x/v.mp4" },
    ]);
    expect(r[0]).toEqual({ type: "image", _key: "i", file: null, previewUrl: "https://x/i.jpg", uploadedUrl: "https://x/i.jpg", caption: "<p>c</p>" });
    expect(r[1]).toMatchObject({ type: "video", _key: "v", caption: "", uploadedUrl: "https://x/v.mp4" });
  });

  it("نص وتضمين", () => {
    const r = blocksFromPersisted([
      { _key: "t", type: "text", caption: "<p>hi</p>" },
      { _key: "e", type: "embed", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    ]);
    expect(r).toEqual([
      { type: "text", _key: "t", caption: "<p>hi</p>" },
      { type: "embed", _key: "e", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "" },
    ]);
  });

  it("شبكة: تتخطى العناصر بلا رابط، والأعمدة الافتراضية min(عدد,3)", () => {
    const r = blocksFromPersisted([
      { _key: "g", type: "grid", items: [{ _key: "1", url: "https://x/1.jpg" }, { url: "" }, { _key: "3", url: "https://x/3.jpg" }] },
      { _key: "g2", type: "grid", columns: 4, items: [{ url: "https://x/a.jpg" }] },
    ]);
    const g = r[0] as Extract<(typeof r)[number], { type: "grid" }>;
    expect(g.items.map((i) => i._key)).toEqual(["1", "3"]);
    expect(g.columns).toBe(2);
    expect((r[1] as typeof g).columns).toBe(4);
  });

  it("يتخطى الكتل الناقصة أو المجهولة", () => {
    const r = blocksFromPersisted([
      { _key: "a", type: "image" }, // بلا رابط
      { _key: "b", type: "embed" }, // بلا رابط
      { _key: "c", type: "grid", items: [] }, // شبكة فارغة
      { _key: "d", type: "grid", items: null },
      { _key: "e", type: "unknown" as never },
    ]);
    expect(r).toEqual([]);
  });

  it("يولّد _key لمن لا يملكه، ويُبقي ترتيب الكتل", () => {
    const r = blocksFromPersisted([{ type: "text", caption: "a" }, { _key: "keep", type: "text", caption: "b" }]);
    expect(r[0]._key).toMatch(/^[0-9a-f-]{36}$/);
    expect(r[1]._key).toBe("keep");
  });
});

describe("إنشاء الكتل", () => {
  it("makeTextBlock / makeEmbedBlock", () => {
    expect(makeTextBlock()).toMatchObject({ type: "text", caption: "" });
    expect(makeEmbedBlock("https://vimeo.com/123456789")).toMatchObject({
      type: "embed",
      url: "https://vimeo.com/123456789",
      caption: "",
    });
    expect(makeTextBlock()._key).not.toBe(makeTextBlock()._key);
  });

  it("makeMediaBlock: النوع من نوع الملف ومعاينة محلية", () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
    expect(makeMediaBlock(file("a.png", "image/png"))).toMatchObject({ type: "image", previewUrl: "blob:preview", caption: "" });
    expect(makeMediaBlock(file("a.mp4", "video/mp4"))).toMatchObject({ type: "video" });
  });

  it("makeGridBlock: يقصّ إلى 12 والأعمدة min(عدد,3)", () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:p");
    const two = makeGridBlock([file("1.png", "image/png"), file("2.png", "image/png")]) as Extract<ReturnType<typeof makeGridBlock>, { type: "grid" }>;
    expect(two.columns).toBe(2);
    const files = Array.from({ length: 20 }, (_, i) => file(`${i}.png`, "image/png"));
    const big = makeGridBlock(files) as typeof two;
    expect(big.items).toHaveLength(12);
    expect(big.columns).toBe(3);
  });

  it("isVisualBlock", () => {
    for (const t of ["image", "video", "grid"]) expect(isVisualBlock({ type: t })).toBe(true);
    for (const t of ["text", "embed"]) expect(isVisualBlock({ type: t })).toBe(false);
  });
});
