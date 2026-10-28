// src/lib/schemas.ts
// مخططات zod للتحقق من مدخلات الـ API.
import { z } from "zod";
import { sanitizeCaption } from "@/lib/sanitize";
import { parseEmbedUrl } from "@/lib/embed";

// ---- ثوابت ----
const BASE_MEDIA_HOSTS = ["res.cloudinary.com", "cdn.sanity.io", "images.unsplash.com"];
const EXTRA_MEDIA_HOSTS = (process.env.ALLOWED_MEDIA_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);
const ALLOWED_MEDIA_HOSTS = new Set([...BASE_MEDIA_HOSTS, ...EXTRA_MEDIA_HOSTS]);

const CLOUDINARY_HOST = "res.cloudinary.com";
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

function isAllowedMediaUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (!ALLOWED_MEDIA_HOSTS.has(host)) return false;

    // Cloudinary: يُقبل حسابك أنت فقط (المسار يبدأ بـ /<cloud_name>/) وليس أي حساب آخر.
    // إن لم يُضبط اسم الحساب نرفض (fail closed).
    if (host === CLOUDINARY_HOST) {
      if (!CLOUDINARY_CLOUD_NAME) return false;
      return u.pathname.startsWith(`/${CLOUDINARY_CLOUD_NAME}/`);
    }
    return true;
  } catch {
    return false;
  }
}

/** مفتاح _key لعناصر المصفوفات في Sanity. */
export const newKey = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

/** هل الـ HTML بلا محتوى فعلي (نص أو فاصل)؟ */
export function isEmptyHtml(html: string): boolean {
  if (/<hr\b/i.test(html)) return false;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "").length === 0;
}

// ---- حقول مشتركة ----
/** معرّف مستند Sanity (حروف وأرقام و . _ - فقط). */
export const idSchema = z
  .string()
  .regex(/^[A-Za-z0-9._-]{1,128}$/, "معرّف غير صالح");

/** النموذج يرسل "" عند عدم اختيار مصمم: نعامله كغير موجود. */
const optionalId = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  idSchema.optional()
);

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "لون غير صالح");

const mediaUrl = z
  .string()
  .url("رابط الوسيط غير صالح")
  .max(2048)
  .refine(isAllowedMediaUrl, "مصدر الوسيط غير مسموح");

const keyField = z.string().min(1).max(64).optional();
const captionField = z.string().max(50000).optional();

// ---- كتل المحتوى ----
// ملاحظة: z.discriminatedUnion يقبل ZodObject فقط، لذا التحقق الإضافي
// (embed) والتحويلات (تنظيف HTML، المفاتيح) تتم على مستوى المصفوفة.
const imageVideoBlock = z.object({
  _key: keyField,
  type: z.enum(["image", "video"]),
  url: mediaUrl,
  caption: captionField,
});
const textBlock = z.object({
  _key: keyField,
  type: z.literal("text"),
  caption: z.string().max(50000),
});
const embedBlock = z.object({
  _key: keyField,
  type: z.literal("embed"),
  url: z.string().max(2048),
  caption: captionField,
});
const gridBlock = z.object({
  _key: keyField,
  type: z.literal("grid"),
  columns: z.number().int().min(1).max(4).optional(),
  items: z.array(z.object({ _key: keyField, url: mediaUrl })).min(1).max(12),
  caption: captionField,
});

export type PersistedBlock =
  | { _key: string; type: "image" | "video"; url: string; caption: string }
  | { _key: string; type: "text"; caption: string }
  | { _key: string; type: "embed"; url: string; caption: string }
  | {
      _key: string;
      type: "grid";
      columns: number;
      items: { _key: string; url: string }[];
      caption: string;
    };

const mediaBlocks = z
  .array(z.discriminatedUnion("type", [imageVideoBlock, textBlock, embedBlock, gridBlock]))
  .max(60, "عدد الأقسام كبير جداً")
  .superRefine((blocks, ctx) => {
    // _key يجب أن يكون فريداً داخل المصفوفة (Sanity يعتمد عليه)
    const seen = new Set<string>();
    blocks.forEach((b, i) => {
      if (!b._key) return;
      if (seen.has(b._key)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "مفتاح مكرر في الأقسام", path: [i, "_key"] });
      }
      seen.add(b._key);
    });
    blocks.forEach((b, i) => {
      if (b.type === "grid") {
        const itemKeys = new Set<string>();
        b.items.forEach((it, j) => {
          if (!it._key) return;
          if (itemKeys.has(it._key)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "مفتاح مكرر في الشبكة", path: [i, "items", j, "_key"] });
          }
          itemKeys.add(it._key);
        });
      }
      if (b.type === "embed" && !parseEmbedUrl(b.url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "رابط الفيديو غير مدعوم (YouTube أو Vimeo فقط)",
          path: [i, "url"],
        });
      }
    });
  })
  .transform((blocks): PersistedBlock[] =>
    blocks.flatMap((b): PersistedBlock[] => {
      const _key = b._key ?? newKey();
      switch (b.type) {
        case "text": {
          const html = sanitizeCaption(b.caption);
          return isEmptyHtml(html) ? [] : [{ _key, type: "text", caption: html }];
        }
        case "embed": {
          const info = parseEmbedUrl(b.url)!; // تم التحقق في superRefine
          return [{ _key, type: "embed", url: info.canonicalUrl, caption: sanitizeCaption(b.caption) }];
        }
        case "grid":
          return [
            {
              _key,
              type: "grid",
              columns: b.columns ?? Math.min(b.items.length, 3),
              items: b.items.map((it) => ({ _key: it._key ?? newKey(), url: it.url })),
              caption: sanitizeCaption(b.caption),
            },
          ];
        default:
          return [{ _key, type: b.type, url: b.url, caption: sanitizeCaption(b.caption) }];
      }
    })
  );

export const hasVisual = (blocks: PersistedBlock[]) =>
  blocks.some((b) => b.type === "image" || b.type === "video" || b.type === "grid");

/** يبقي coverKey فقط إذا كان يشير إلى كتلة مرئية موجودة. */
function pickCoverKey(blocks: PersistedBlock[] | undefined, coverKey?: string | null) {
  if (!coverKey) return undefined;
  if (!blocks) return coverKey; // لا يمكن التحقق (تعديل بدون media)
  const ok = blocks.some(
    (b) => b._key === coverKey && (b.type === "image" || b.type === "video" || b.type === "grid")
  );
  return ok ? coverKey : undefined;
}

const title = z.string().trim().min(1, "العنوان مطلوب").max(200, "العنوان طويل جداً");
const description = z.string().max(5000, "الوصف طويل جداً");
const status = z.enum(["draft", "published"]);

// ---- تصميم ----
export const createDesignSchema = z
  .object({
    title,
    description: description.optional().default(""),
    designerId: optionalId,
    backgroundColor: hexColor.optional().default("#f9fafb"),
    tags: z.array(z.object({ _ref: idSchema })).max(30).optional().default([]),
    media: mediaBlocks.optional().default([]),
    coverKey: z.string().max(64).nullish(),
    status: status.optional().default("published"),
  })
  .superRefine((d, ctx) => {
    if (d.status !== "published") return; // المسودة تقبل بيانات ناقصة
    if (!d.designerId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "المصمم مطلوب", path: ["designerId"] });
    }
    if (!hasVisual(d.media)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "أضف صورة أو فيديو واحداً على الأقل",
        path: ["media"],
      });
    }
  })
  .transform((d) => ({ ...d, coverKey: pickCoverKey(d.media, d.coverKey) }));

export const updateDesignSchema = z
  .object({
    title,
    // بلا default عمداً: الحقل الغائب لا يُمسّ (PATCH جزئي)
    description: description.optional(),
    designerId: optionalId,
    backgroundColor: hexColor.optional(),
    tags: z.array(z.object({ _ref: idSchema })).max(30).optional(),
    media: mediaBlocks.optional(),
    coverKey: z.string().max(64).nullish(), // null = إزالة الغلاف المختار
    status: status.optional(),
    // publishedAt يُتجاهل عمداً: يحدده الخادم عند النشر
  })
  .superRefine((d, ctx) => {
    if (d.status !== "published") return;
    if (!d.designerId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "المصمم مطلوب", path: ["designerId"] });
    }
    if (d.media && !hasVisual(d.media)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "أضف صورة أو فيديو واحداً على الأقل",
        path: ["media"],
      });
    }
  })
  .transform((d) => ({
    ...d,
    coverKey: d.coverKey === null ? null : pickCoverKey(d.media, d.coverKey),
  }));

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
