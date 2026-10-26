// src/lib/cloudinary.ts
// توقيع طلبات الرفع (Signed Upload) من جهة الخادم فقط.
import { createHash } from "node:crypto";

export const UPLOAD_FOLDER = "design-gallery";

/** الصيغ المسموحة لكل نوع (بدون SVG عمداً لأنه قد يحمل سكربتات). */
export const ALLOWED_FORMATS = {
  image: "jpg,jpeg,png,gif,webp,avif",
  video: "mp4,webm,mov,m4v",
} as const;

/**
 * توقيع Cloudinary: ترتيب أبجدي لكل المعاملات الموقَّعة بصيغة k=v مفصولة بـ &،
 * ثم إلحاق الـ api_secret، ثم SHA-1 (hex).
 * لا تدخل في التوقيع: file, cloud_name, resource_type, api_key.
 */
export function signParams(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}
