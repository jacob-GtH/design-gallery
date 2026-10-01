// src/lib/sanity.client.ts
// المصدر الموحّد لعميل Sanity في التطبيق
import { createClient } from '@sanity/client';

// تحقق من وجود المتغيرات البيئية عند بدء التشغيل
function assertEnvValue(
  value: string | undefined,
  errorMessage: string
): string {
  if (value === undefined || value === '') {
    if (typeof console !== 'undefined') {
      console.error(
        `❌ Missing environment variable: ${errorMessage}\n` +
        `   تأكد من إضافة المتغير إلى ملف .env.local في جذر المشروع.`
      );
    }
    throw new Error(errorMessage);
  }
  return value;
}

// قراءة المتغيرات مع تحقق صارم
const projectId = assertEnvValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'NEXT_PUBLIC_SANITY_PROJECT_ID'
);
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-09';
const token = process.env.SANITY_API_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});