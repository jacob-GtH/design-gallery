// src/lib/cover.ts
// تحديد صورة/فيديو الغلاف لبطاقة التصميم.

type CoverSource = {
  _key?: string;
  type: string;
  url?: string;
  items?: { url: string }[] | null;
};

export type Cover = { url: string; type: "image" | "video" };

function toCover(m: CoverSource): Cover | null {
  if ((m.type === "image" || m.type === "video") && m.url) {
    return { url: m.url, type: m.type };
  }
  if (m.type === "grid" && m.items?.[0]?.url) {
    return { url: m.items[0].url, type: "image" };
  }
  return null;
}

/** الغلاف المختار (coverKey) إن كان صالحاً، وإلا أول كتلة مرئية. */
export function getCover(
  media: CoverSource[] | null | undefined,
  coverKey?: string | null
): Cover | null {
  const list = media ?? [];
  if (coverKey) {
    const chosen = list.find((m) => m._key === coverKey);
    const c = chosen ? toCover(chosen) : null;
    if (c) return c;
  }
  for (const m of list) {
    const c = toCover(m);
    if (c) return c;
  }
  return null;
}

/** مفتاح الكتلة التي تُعدّ غلافاً فعلياً (لإظهار الشارة في المحرر). */
export function effectiveCoverKey(
  blocks: { _key: string; type: string; hasVisual?: boolean }[],
  coverKey?: string | null
): string | null {
  const isVisual = (b: { type: string }) =>
    b.type === "image" || b.type === "video" || b.type === "grid";
  if (coverKey && blocks.some((b) => b._key === coverKey && isVisual(b))) {
    return coverKey;
  }
  return blocks.find(isVisual)?._key ?? null;
}
