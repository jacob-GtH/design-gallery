// src/lib/auth.ts
// جلسة إدارة بسيطة موقّعة بـ HMAC-SHA256.
// تعتمد على Web Crypto فقط، فتعمل في Edge (middleware) وفي Node (route handlers).

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 ساعات

const encoder = new TextEncoder();

/** يرجع السر فقط إذا كان طوله كافياً؛ وإلا تفشل المصادقة بشكل مغلق (fail closed). */
function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function importKey(secret: string, usage: "sign" | "verify") {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

/** ينشئ توكن بصيغة `<expiresAtMs>.<signature>`، أو null إذا لم تُضبط الإعدادات. */
export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const payload = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const key = await importKey(secret, "sign");
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
}

/** يتحقق من التوقيع (بمقارنة ثابتة الزمن عبر subtle.verify) ومن انتهاء الصلاحية. */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  if (!/^\d{10,16}$/.test(payload)) return false;
  if (Number(payload) < Date.now()) return false;

  try {
    const key = await importKey(secret, "verify");
    return await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sig) as BufferSource,
      encoder.encode(payload)
    );
  } catch {
    return false;
  }
}
