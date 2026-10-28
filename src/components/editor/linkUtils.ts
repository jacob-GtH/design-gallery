// components/editor/linkUtils.ts

/** يحوّل مدخل المستخدم إلى رابط آمن (http/https/mailto/tel) أو null. */
export function normalizeLinkUrl(input: string): string | null {
  const v = input.trim();
  if (!v || v.length > 2048) return null;

  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      return u.hostname ? u.toString() : null;
    } catch {
      return null;
    }
  }
  if (/^(mailto|tel):/i.test(v)) {
    return /^(mailto:[^\s@]+@[^\s@]+\.[^\s@]+|tel:\+?[\d\s().-]{5,})$/i.test(v) ? v : null;
  }
  if (/^[^\s@/:]+@[^\s@/:]+\.[^\s@/:]+$/.test(v)) return `mailto:${v}`;
  // نطاق بدون بروتوكول: example.com أو example.com/path
  if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#]\S*)?$/i.test(v)) {
    try {
      return new URL(`https://${v}`).toString();
    } catch {
      return null;
    }
  }
  return null;
}

/** يحوّل #rgb أو rgb()/rgba() إلى #rrggbb (لحقل input type=color). "" إن لم يُفهم. */
export function toHexColor(value?: string | null): string {
  if (!value) return "";
  const v = value.trim();
  let m = /^#([0-9a-f]{3})$/i.exec(v);
  if (m) return "#" + m[1].split("").map((c) => c + c).join("").toLowerCase();
  m = /^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(v);
  if (m) return "#" + m[1].toLowerCase();
  const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(v);
  if (rgb) {
    const hex = [rgb[1], rgb[2], rgb[3]]
      .map((n) => Math.max(0, Math.min(255, parseInt(n, 10))).toString(16).padStart(2, "0"))
      .join("");
    return "#" + hex;
  }
  return "";
}
