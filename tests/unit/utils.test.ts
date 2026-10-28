import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/escapeHtml";
import { isDarkColor } from "@/lib/utils/colorUtils";
import { ALLOWED_FORMATS, UPLOAD_FOLDER, signParams } from "@/lib/cloudinary";
import { normalizeLinkUrl, toHexColor } from "@/components/editor/linkUtils";

describe("escapeHtml", () => {
  it("يهرّب الرموز الخمسة", () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;"
    );
  });
  it("لا يهرّب & مرتين (التهريب مرة واحدة)", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
  it("لا يغيّر النص العادي والعربي", () => {
    expect(escapeHtml("مرحباً بالعالم 123")).toBe("مرحباً بالعالم 123");
    expect(escapeHtml("")).toBe("");
  });
});

describe("isDarkColor (صيغة #rrggbb التي ينتجها حقل اللون)", () => {
  it("يميّز الداكن من الفاتح", () => {
    expect(isDarkColor("#000000")).toBe(true);
    expect(isDarkColor("#111827")).toBe(true);
    expect(isDarkColor("#ffffff")).toBe(false);
    expect(isDarkColor("#f9fafb")).toBe(false);
  });
  it("حدّ العتبة 128", () => {
    expect(isDarkColor("#7f7f7f")).toBe(true); // 127
    expect(isDarkColor("#808080")).toBe(false); // 128
  });
});

describe("cloudinary.signParams", () => {
  it("يطابق المثال الرسمي في توثيق Cloudinary", () => {
    const sig = signParams(
      { timestamp: 1315060510, public_id: "sample_image", eager: "w_400,h_300,c_pad|w_260,h_200,c_crop" },
      "abcd"
    );
    expect(sig).toBe("bfd09f95f331f558cbd1320e67aa8d488770583e");
  });
  it("لا يتأثر بترتيب المفاتيح", () => {
    expect(signParams({ a: 1, b: 2, c: 3 }, "s")).toBe(signParams({ c: 3, a: 1, b: 2 }, "s"));
  });
  it("يتغير التوقيع بتغير السر أو أي قيمة", () => {
    const base = signParams({ timestamp: 1, folder: "f" }, "s1");
    expect(signParams({ timestamp: 1, folder: "f" }, "s2")).not.toBe(base);
    expect(signParams({ timestamp: 2, folder: "f" }, "s1")).not.toBe(base);
    expect(signParams({ timestamp: 1, folder: "g" }, "s1")).not.toBe(base);
  });
  it("التوقيع SHA-1 hex (40 خانة)", () => {
    expect(signParams({ a: 1 }, "s")).toMatch(/^[0-9a-f]{40}$/);
  });
});

describe("ثوابت الرفع", () => {
  it("لا يُسمح بـ SVG ولا بصيغ تنفيذية", () => {
    expect(ALLOWED_FORMATS.image).not.toContain("svg");
    expect(ALLOWED_FORMATS.image).toContain("png");
    expect(ALLOWED_FORMATS.video).toContain("mp4");
    expect(UPLOAD_FOLDER).toBe("design-gallery");
  });
});

describe("normalizeLinkUrl", () => {
  it("يقبل http/https ويطبّعهما", () => {
    expect(normalizeLinkUrl("https://example.com")).toBe("https://example.com/");
    expect(normalizeLinkUrl("http://a.com/p?q=1")).toBe("http://a.com/p?q=1");
    expect(normalizeLinkUrl("  HTTPS://EXAMPLE.COM  ")).toBe("https://example.com/");
  });
  it("نطاق بلا بروتوكول => https", () => {
    expect(normalizeLinkUrl("example.com")).toBe("https://example.com/");
    expect(normalizeLinkUrl("example.com/path?x=1#y")).toBe("https://example.com/path?x=1#y");
  });
  it("mailto وtel والبريد المجرّد", () => {
    expect(normalizeLinkUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
    expect(normalizeLinkUrl("a@b.com")).toBe("mailto:a@b.com");
    expect(normalizeLinkUrl("tel:+966 555 1234")).toBe("tel:+966 555 1234");
    expect(normalizeLinkUrl("mailto:bad")).toBeNull();
    expect(normalizeLinkUrl("tel:123")).toBeNull();
  });
  it("يرفض البروتوكولات الخطرة وغير المدعومة", () => {
    for (const v of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,x", "ftp://x.com", "vbscript:x", "file:///etc/passwd"]) {
      expect(normalizeLinkUrl(v)).toBeNull();
    }
  });
  it("يرفض الفارغ والطويل والعشوائي", () => {
    expect(normalizeLinkUrl("")).toBeNull();
    expect(normalizeLinkUrl("   ")).toBeNull();
    expect(normalizeLinkUrl("not a url")).toBeNull();
    expect(normalizeLinkUrl("https://example.com/" + "a".repeat(2100))).toBeNull();
  });
});

describe("toHexColor", () => {
  it("يحوّل الصيغ المعروفة إلى #rrggbb", () => {
    expect(toHexColor("#abc")).toBe("#aabbcc");
    expect(toHexColor("#ABCDEF")).toBe("#abcdef");
    expect(toHexColor("#aabbccdd")).toBe("#aabbcc");
    expect(toHexColor("rgb(255, 0, 10)")).toBe("#ff000a");
    expect(toHexColor("rgba(1,2,3,0.5)")).toBe("#010203");
  });
  it("يقصّ القيم الخارجة عن 0..255", () => {
    expect(toHexColor("rgb(300, 0, 0)")).toBe("#ff0000");
  });
  it("القيمة غير المفهومة أو الفارغة => نص فارغ", () => {
    for (const v of ["red", "#12", "", "   "]) expect(toHexColor(v)).toBe("");
    expect(toHexColor(null)).toBe("");
    expect(toHexColor(undefined)).toBe("");
  });
});
