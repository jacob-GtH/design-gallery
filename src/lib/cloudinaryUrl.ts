// src/lib/cloudinaryUrl.ts
// تحويلات Cloudinary وقت العرض (حجم/صيغة/جودة تلقائية) بدل تحميل الملف الأصلي الكامل.
// تُطبَّق فقط على روابط res.cloudinary.com المرفوعة عبر الموقع (تحتوي /upload/v<رقم>/)،
// وأي رابط آخر يُعاد كما هو.

const IMAGE_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;
const VIDEO_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(v\d+\/.+)$/;

const clampWidth = (w: number) => Math.max(16, Math.min(4000, Math.round(w)));

/** صورة: صيغة حديثة تلقائية (WebP/AVIF) + جودة تلقائية + عرض لا يتجاوز width. */
export function optimizeCloudinaryImage(url: string, width = 1200): string {
  const m = IMAGE_RE.exec(url);
  if (!m) return url;
  return `${m[1]}f_auto,q_auto,w_${clampWidth(width)},c_limit/${m[2]}`;
}

/** فيديو: جودة تلقائية وعرض محدود، مع بقاء الصيغة mp4 (أوسع توافقاً مع autoplay على iOS). */
export function optimizeCloudinaryVideo(url: string, width = 1280): string {
  const m = VIDEO_RE.exec(url);
  if (!m) return url;
  return `${m[1]}q_auto,w_${clampWidth(width)},c_limit/${m[2]}`;
}

/** صورة غلاف للفيديو (أول إطار) لتظهر قبل التحميل. undefined إن لم يكن رابط Cloudinary. */
export function cloudinaryVideoPoster(url: string, width = 800): string | undefined {
  const m = VIDEO_RE.exec(url);
  if (!m) return undefined;
  const path = m[2].replace(/\.[A-Za-z0-9]+$/, ".jpg");
  return `${m[1]}so_0,f_jpg,q_auto,w_${clampWidth(width)},c_limit/${path}`;
}
