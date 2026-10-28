// src/lib/embed.ts
// تحليل روابط YouTube/Vimeo فقط. لا نخزّن ولا نعرض أي رابط خام:
// نعيد بناء رابط التضمين من المعرّف المُتحقَّق منه (يمنع حقن iframe لمواقع أخرى).

export type EmbedInfo = {
  provider: "youtube" | "vimeo";
  id: string;
  canonicalUrl: string; // يُحفظ في Sanity
  embedUrl: string; // يُستخدم في iframe
};

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;

export function parseEmbedUrl(input: string | null | undefined): EmbedInfo | null {
  if (!input) return null;
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, "");
  const segments = u.pathname.split("/").filter(Boolean);

  // ---- YouTube ----
  let ytId: string | null = null;
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (segments[0] === "watch") ytId = u.searchParams.get("v");
    else if (["embed", "shorts", "live", "v"].includes(segments[0] ?? "")) ytId = segments[1] ?? null;
  } else if (host === "youtu.be") {
    ytId = segments[0] ?? null;
  }
  if (ytId && YT_ID.test(ytId)) {
    return {
      provider: "youtube",
      id: ytId,
      canonicalUrl: `https://www.youtube.com/watch?v=${ytId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}`,
    };
  }

  // ---- Vimeo ----
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const vId = segments.find((s) => VIMEO_ID.test(s));
    if (vId) {
      return {
        provider: "vimeo",
        id: vId,
        canonicalUrl: `https://vimeo.com/${vId}`,
        embedUrl: `https://player.vimeo.com/video/${vId}`,
      };
    }
  }
  return null;
}
