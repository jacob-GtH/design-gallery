// src/lib/validation.ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "الاسم يجب أن يكون أكثر من حرفين")
    .max(100, "الاسم طويل جداً")
    .regex(/^[^\r\n]+$/, "الاسم غير صالح"), // يمنع حقن ترويسات البريد
  email: z
    .string()
    .trim()
    .max(254, "البريد الإلكتروني غير صالح")
    .email("البريد الإلكتروني غير صالح"),
  message: z
    .string()
    .trim()
    .min(10, "الرسالة يجب أن تكون أكثر من 10 أحرف")
    .max(5000, "الرسالة طويلة جداً"),
  // honeypot: حقل مخفي، البشر يتركونه فارغاً
  website: z.string().max(200).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** للتوافق مع الاستدعاءات القديمة: يرجع رسالة الخطأ أو null. */
export function validateInput(data: {
  name: string;
  email: string;
  message: string;
}): string | null {
  const r = contactSchema.safeParse(data);
  return r.success ? null : r.error.issues[0]?.message ?? "بيانات غير صالحة";
}
