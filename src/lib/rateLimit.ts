// src/lib/rateLimit.ts
// Rate limiter بسيط داخل الذاكرة (نافذة ثابتة).
// تنبيه: الحالة لكل instance. على Vercel/serverless الحماية جزئية فقط؛
// للإنتاج الجاد استبدله بـ Upstash Ratelimit أو Redis بنفس الواجهة.

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  // تنظيف دوري لمنع تضخم الذاكرة
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** عنوان العميل من ترويسات الـ proxy (تضعها المنصة مثل Vercel). */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
