import { describe, expect, it } from "vitest";
import { parseEmbedUrl } from "@/lib/embed";

const ID = "dQw4w9WgXcQ"; // 11 حرفاً

describe("parseEmbedUrl: YouTube", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtube.com/watch?v=${ID}&t=10s&list=x`],
    [`https://m.youtube.com/watch?v=${ID}`],
    [`http://www.youtube.com/watch?v=${ID}`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=abc`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/shorts/${ID}`],
    [`https://www.youtube.com/live/${ID}`],
    [`https://www.youtube.com/v/${ID}`],
    [`https://www.youtube-nocookie.com/embed/${ID}`],
    [`  https://youtu.be/${ID}  `],
  ])("يقبل %s ويعيد روابط معيارية", (url) => {
    expect(parseEmbedUrl(url)).toEqual({
      provider: "youtube",
      id: ID,
      canonicalUrl: `https://www.youtube.com/watch?v=${ID}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ID}`,
    });
  });

  it.each([
    ["معرّف أقصر من 11", "https://youtu.be/abc123"],
    ["معرّف أطول من 11", `https://youtu.be/${ID}x`],
    ["رموز غير مسموحة في المعرّف", "https://youtu.be/dQw4w9WgX!Q"],
    ["watch بلا v", "https://www.youtube.com/watch"],
    ["صفحة قناة", "https://www.youtube.com/@someone"],
    ["نطاق مشابه", `https://youtube.com.evil.com/watch?v=${ID}`],
    ["نطاق آخر بنفس المسار", `https://evil.com/watch?v=${ID}`],
    ["تمويه بـ userinfo", `https://youtube.com@evil.com/watch?v=${ID}`],
    ["نطاق ينتهي بـ youtube.com", `https://notyoutube.com/watch?v=${ID}`],
    ["نطاق ينتهي بـ youtu.be", `https://evilyoutu.be/${ID}`],
    ["نطاق فرعي مزيّف لـ youtu.be", `https://youtu.be.evil.com/${ID}`],
    ["نطاق فرعي لـ youtube.com", `https://evil.youtube.com/watch?v=${ID}`],
    ["نطاق ينتهي بـ youtube-nocookie.com", `https://evilyoutube-nocookie.com/embed/${ID}`],
  ])("يرفض: %s", (_label, url) => {
    expect(parseEmbedUrl(url)).toBeNull();
  });
});

describe("parseEmbedUrl: Vimeo", () => {
  it.each([
    ["https://vimeo.com/123456789"],
    ["https://www.vimeo.com/123456789"],
    ["https://player.vimeo.com/video/123456789"],
    ["https://vimeo.com/channels/staffpicks/123456789"],
  ])("يقبل %s", (url) => {
    expect(parseEmbedUrl(url)).toEqual({
      provider: "vimeo",
      id: "123456789",
      canonicalUrl: "https://vimeo.com/123456789",
      embedUrl: "https://player.vimeo.com/video/123456789",
    });
  });

  it.each([
    ["https://vimeo.com/12345"], // أقل من 6 أرقام
    ["https://vimeo.com/12345678901234"], // أكثر من 12
    ["https://vimeo.com/abc"],
    ["https://vimeo.com/"],
    ["https://evilvimeo.com/123456789"],
    ["https://vimeo.com.evil.com/123456789"],
    ["https://evil.player.vimeo.com/video/123456789"],
  ])("يرفض %s", (url) => {
    expect(parseEmbedUrl(url)).toBeNull();
  });
});

describe("parseEmbedUrl: مدخلات عامة غير صالحة", () => {
  it.each([[""], ["   "], ["not a url"], ["javascript:alert(1)"], ["ftp://youtu.be/dQw4w9WgXcQ"], ["data:text/html,x"]])(
    "%j => null",
    (v) => expect(parseEmbedUrl(v)).toBeNull()
  );
  it("null/undefined => null", () => {
    expect(parseEmbedUrl(null)).toBeNull();
    expect(parseEmbedUrl(undefined)).toBeNull();
  });
});
