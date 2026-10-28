// components/editor/fonts.ts
// قيم الخط تُخزَّن كما هي داخل HTML، ويجب أن تطابق قائمة المنظِّف (sanitize.ts).
export const FONT_OPTIONS = [
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, Times, serif" },
  { label: "Courier New", value: "Courier New, Courier, monospace" },
  // خطوط الموقع (تُعرَّف بـ next/font في layout.tsx)
  { label: "Cairo", value: "var(--font-cairo), sans-serif" },
  { label: "Tajawal", value: "var(--font-tajawal), sans-serif" },
] as const;

export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];
export const DEFAULT_FONT_SIZE = 16;

/** أول عائلة في القيمة، بلا علامات اقتباس وبأحرف صغيرة (للمقارنة). */
export function firstFamily(value?: string | null): string {
  return (value ?? "").split(",")[0].replace(/["']/g, "").trim().toLowerCase();
}

/** يرجع قيمة الخيار المطابق للخط الحالي، أو "" إن لم يوجد. */
export function matchFont(current?: string | null): string {
  const f = firstFamily(current);
  if (!f) return "";
  return FONT_OPTIONS.find((o) => firstFamily(o.value) === f)?.value ?? "";
}
