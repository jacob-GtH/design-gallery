// src/lib/rateLimit.ts
// Rate limiter بسيط داخل الذاكرة (نافذة ثابتة).
// تنبيه: الحالة لكل instance. على Vercel/serverless الحماية جزئية فقط؛
// للإنتاج الجاد استبدله بـ Upstash Ratelimit أو Redis بنفس الواجهة.

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

const SWEEP_THRESHOLD = 5000;
const SWEEP_EVERY_MS = 60_000;
const HARD_CAP = 50_000;
let lastSweep = 0;

function sweep(now: number) {
  if (buckets.size <= SWEEP_THRESHOLD || now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  // سقف صلب: عند الإغراق بعناوين مختلفة نحذف الأقدم (الإدراج مرتب في Map)
  if (buckets.size > HARD_CAP) {
    let toDrop = buckets.size - HARD_CAP;
    for (const k of buckets.keys()) {
      if (toDrop-- <= 0) break;
      buckets.delete(k);
    }
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);

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

/** يصفّر العدّاد (مثلاً بعد تسجيل دخول ناجح حتى لا يُحتسب ضمن المحاولات الفاشلة). */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * عنوان العميل. الترويسة x-forwarded-for يضيف كل proxy موثوق عنوان من اتصل به في نهايتها،
 * فالقيمة الأولى يتحكم بها العميل ويمكن تزويرها. لذلك نأخذ القيمة التي أضافها
 * آخر proxy موثوق: العنصر رقم TRUSTED_PROXY_HOPS من اليمين (الافتراضي 1).
 * - Vercel وأغلب المنصات: proxy واحد => 1
 * - Cloudflare أمام nginx مثلاً => 2
 * - تشغيل مباشر بلا proxy: اضبط TRUSTED_PROXY_HOPS=0 لتجاهل الترويسة.
 */
export function getClientIp(req: Request): string {
  const hopsRaw = Number(process.env.TRUSTED_PROXY_HOPS ?? 1);
  const hops = Number.isInteger(hopsRaw) && hopsRaw >= 0 ? hopsRaw : 1;

  if (hops > 0) {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) {
      const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        return parts[Math.max(0, parts.length - hops)];
      }
    }
    const real = req.headers.get("x-real-ip");
    if (real) return real.trim();
  }
  return "unknown";
}
