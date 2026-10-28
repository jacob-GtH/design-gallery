import { describe, expect, it } from "vitest";
import { effectiveCoverKey, getCover } from "@/lib/cover";

const img = (k: string, url = `https://x/${k}.jpg`) => ({ _key: k, type: "image", url });
const vid = (k: string) => ({ _key: k, type: "video", url: `https://x/${k}.mp4` });
const txt = (k: string) => ({ _key: k, type: "text" });
const emb = (k: string) => ({ _key: k, type: "embed", url: "https://youtu.be/x" });
const grid = (k: string, urls: string[]) => ({ _key: k, type: "grid", items: urls.map((url) => ({ url })) });

describe("getCover", () => {
  it("لا وسائط => null", () => {
    expect(getCover(null)).toBeNull();
    expect(getCover(undefined)).toBeNull();
    expect(getCover([])).toBeNull();
  });
  it("بلا coverKey: أول كتلة مرئية، متخطّياً النص والتضمين", () => {
    expect(getCover([txt("t"), emb("e"), img("a"), img("b")])).toEqual({ url: "https://x/a.jpg", type: "image" });
  });
  it("فيديو", () => {
    expect(getCover([vid("v")])).toEqual({ url: "https://x/v.mp4", type: "video" });
  });
  it("الشبكة: أول عنصر كصورة", () => {
    expect(getCover([grid("g", ["https://x/1.jpg", "https://x/2.jpg"])])).toEqual({
      url: "https://x/1.jpg",
      type: "image",
    });
  });
  it("شبكة فارغة أو صورة بلا رابط تُتخطّى", () => {
    expect(getCover([grid("g", []), { _key: "i", type: "image" }, img("ok")])).toEqual({
      url: "https://x/ok.jpg",
      type: "image",
    });
  });
  it("coverKey صالح يُفضَّل على الأول", () => {
    expect(getCover([img("a"), img("b")], "b")).toEqual({ url: "https://x/b.jpg", type: "image" });
    expect(getCover([img("a"), grid("g", ["https://x/g1.jpg"])], "g")?.url).toBe("https://x/g1.jpg");
  });
  it("coverKey يشير إلى نص أو مفتاح غير موجود => رجوع إلى أول مرئي", () => {
    expect(getCover([img("a"), txt("t")], "t")?.url).toBe("https://x/a.jpg");
    expect(getCover([img("a")], "ghost")?.url).toBe("https://x/a.jpg");
  });
  it("لا شيء مرئي => null حتى مع coverKey", () => {
    expect(getCover([txt("t"), emb("e")], "t")).toBeNull();
  });
});

describe("effectiveCoverKey", () => {
  const blocks = [{ _key: "t", type: "text" }, { _key: "a", type: "image" }, { _key: "g", type: "grid" }];
  it("coverKey صالح يبقى", () => {
    expect(effectiveCoverKey(blocks, "g")).toBe("g");
  });
  it("غير صالح أو يشير إلى نص => أول كتلة مرئية", () => {
    expect(effectiveCoverKey(blocks, "t")).toBe("a");
    expect(effectiveCoverKey(blocks, "ghost")).toBe("a");
    expect(effectiveCoverKey(blocks, null)).toBe("a");
    expect(effectiveCoverKey(blocks, "")).toBe("a");
  });
  it("لا كتل مرئية => null", () => {
    expect(effectiveCoverKey([{ _key: "t", type: "text" }], "t")).toBeNull();
    expect(effectiveCoverKey([], undefined)).toBeNull();
  });
});
