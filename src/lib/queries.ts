// src/lib/queries.ts
// أجزاء GROQ مشتركة.

/** شرط يستثني المسودات (المستندات القديمة بلا status تُعدّ منشورة). */
export const NOT_DRAFT = `coalesce(status, "published") != "draft"`;

/** كل كتل المحتوى مع التفاصيل (للتفاصيل والتعديل). */
export const MEDIA_FULL = `media[]{ _key, type, url, caption, columns, "items": items[]{ _key, url } }`;

/** نسخة خفيفة بدون captions (للقوائم والبطاقات). */
export const MEDIA_LITE = `media[]{ _key, type, url, "items": items[]{ _key, url } }`;
