// src/lib/schemas.ts
// مخططات zod للتحقق من مدخلات الـ API.
import { z } from "zod";
import { sanitizeCaption } from "@/lib/sanitize";

// ---- ثوابت ----
const BASE_MEDIA_HOSTS = ["res.cloudinary.com", "cdn.sanity.io", "images.unsplash.com"];
const EXTRA_MEDIA_HOSTS = (process.env.ALLOWED_MEDIA_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);
const ALLOWED_MEDIA_HOSTS = new Set([...BASE_MEDIA_HOSTS, ...EXTRA_MEDIA_HOSTS]);

function isAllowedMediaUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && ALLOWED_MEDIA_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

// ---- حقول مشتركة ----
/** معرّف مستند Sanity (حروف وأرقام و . _ - فقط). */
export const idSchema = z
  .string()
  .regex(/^[A-Za-z0-9._-]{1,128}$/, "معرّف غير صالح");

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "لون غير صالح");

const mediaItemSchema = z
  .object({
    _key: z.string().min(1).max(64).optional(),
    url: z
      .string()
      .url("رابط الوسيط غير صالح")
      .max(2048)
      .refine(isAllowedMediaUrl, "مصدر الوسيط غير مسموح"),
    type: z.enum(["image", "video"]),
    caption: z.string().max(20000).optional(),
  })
  .transform((m) => ({
    _key: m._key ?? crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    url: m.url,
    type: m.type,
    // تنظيف الـ HTML عند الحفظ (وسيُنظَّف أيضاً عند العرض)
    caption: sanitizeCaption(m.caption),
  }));

const tagRefSchema = z.object({ _ref: idSchema });

const title = z.string().trim().min(1, "العنوان مطلوب").max(200, "العنوان طويل جداً");
const description = z.string().max(5000, "الوصف طويل جداً");

// ---- تصميم ----
export const createDesignSchema = z.object({
  title,
  description: description.optional().default(""),
  designerId: idSchema,
  backgroundColor: hexColor.optional().default("#f9fafb"),
  tags: z.array(tagRefSchema).max(30).optional().default([]),
  media: z.array(mediaItemSchema).min(1, "الوسائط مطلوبة").max(50),
});

export const updateDesignSchema = z.object({
  title,
  description: description.optional().default(""),
  designerId: idSchema.optional(),
  backgroundColor: hexColor.optional().default("#f9fafb"),
  tags: z.array(tagRefSchema).max(30).optional(),
  media: z.array(mediaItemSchema).min(1).max(50).optional(),
  // publishedAt يُتجاهل عمداً: التعديل لا يغيّر تاريخ النشر
});

export const likeSchema = z.object({ id: idSchema });

// ---- أدوات ----
/** يحوّل العنوان إلى slug يدعم العربية، مع لاحقة عشوائية لتفادي التكرار. */
export function makeSlug(titleText: string): string {
  const base = titleText
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const suffix = crypto.randomUUID().slice(0, 6);
  return base ? `${base}-${suffix}` : suffix;
}

/** أول رسالة خطأ مقروءة من نتيجة zod. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "بيانات غير صالحة";
}
