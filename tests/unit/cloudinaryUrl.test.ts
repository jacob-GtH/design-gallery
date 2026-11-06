// tests/unit/cloudinaryUrl.test.ts
import { describe, expect, it } from "vitest";
import {
  cloudinaryVideoPoster,
  optimizeCloudinaryImage,
  optimizeCloudinaryVideo,
} from "@/lib/cloudinaryUrl";

const IMG = "https://res.cloudinary.com/mycloud/image/upload/v1730000000/design-gallery/abc.jpg";
const VID = "https://res.cloudinary.com/mycloud/video/upload/v1730000000/design-gallery/clip.mp4";

describe("optimizeCloudinaryImage", () => {
  it("يحقن f_auto,q_auto وعرضاً محدوداً بعد /upload/", () => {
    expect(optimizeCloudinaryImage(IMG, 900)).toBe(
      "https://res.cloudinary.com/mycloud/image/upload/f_auto,q_auto,w_900,c_limit/v1730000000/design-gallery/abc.jpg"
    );
  });

  it("العرض الافتراضي 1200 ويُقيَّد بين 16 و4000", () => {
    expect(optimizeCloudinaryImage(IMG)).toContain("w_1200,");
    expect(optimizeCloudinaryImage(IMG, 99999)).toContain("w_4000,");
    expect(optimizeCloudinaryImage(IMG, 1)).toContain("w_16,");
    expect(optimizeCloudinaryImage(IMG, 450.7)).toContain("w_451,");
  });

  it("لا يمس أي رابط ليس من رفع الموقع على Cloudinary", () => {
    const untouched = [
      "https://cdn.sanity.io/images/p/d/a.png",
      "https://images.unsplash.com/a.jpg",
      "/images/bgHome.webp",
      "",
      "https://res.cloudinary.com/c/image/upload/w_100/v1/a.jpg", // فيه تحويلات أصلاً
      "http://res.cloudinary.com/c/image/upload/v1/a.jpg", // ليس https
      "https://res.cloudinary.com.evil.com/c/image/upload/v1/a.jpg",
      "https://evil.com/https://res.cloudinary.com/c/image/upload/v1/a.jpg",
      "https://res.cloudinary.com/c/raw/upload/v1/a.pdf",
      "https://res.cloudinary.com/c/video/upload/v1/a.mp4", // فيديو لا صورة
    ];
    for (const u of untouched) expect(optimizeCloudinaryImage(u, 500)).toBe(u);
  });

  it("تطبيقه مرتين لا يكرر التحويل", () => {
    const once = optimizeCloudinaryImage(IMG, 900);
    expect(optimizeCloudinaryImage(once, 900)).toBe(once);
  });
});

describe("optimizeCloudinaryVideo", () => {
  it("يحدد الجودة والعرض ويُبقي الامتداد mp4", () => {
    expect(optimizeCloudinaryVideo(VID, 800)).toBe(
      "https://res.cloudinary.com/mycloud/video/upload/q_auto,w_800,c_limit/v1730000000/design-gallery/clip.mp4"
    );
  });

  it("لا يمس روابط الصور ولا الروابط الخارجية", () => {
    expect(optimizeCloudinaryVideo(IMG, 500)).toBe(IMG);
    expect(optimizeCloudinaryVideo("https://x.com/a.mp4", 500)).toBe("https://x.com/a.mp4");
  });
});

describe("cloudinaryVideoPoster", () => {
  it("يبني صورة JPG لأول إطار من الفيديو", () => {
    expect(cloudinaryVideoPoster(VID, 600)).toBe(
      "https://res.cloudinary.com/mycloud/video/upload/so_0,f_jpg,q_auto,w_600,c_limit/v1730000000/design-gallery/clip.jpg"
    );
  });

  it("يتعامل مع أسماء فيها نقاط متعددة", () => {
    expect(
      cloudinaryVideoPoster("https://res.cloudinary.com/c/video/upload/v1/f/my.clip.v2.mov", 300)
    ).toBe("https://res.cloudinary.com/c/video/upload/so_0,f_jpg,q_auto,w_300,c_limit/v1/f/my.clip.v2.jpg");
  });

  it("undefined لغير فيديو Cloudinary", () => {
    expect(cloudinaryVideoPoster(IMG)).toBeUndefined();
    expect(cloudinaryVideoPoster("https://x.com/a.mp4")).toBeUndefined();
  });
});
