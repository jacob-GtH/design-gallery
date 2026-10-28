// src/components/designs/MediaBlocks.tsx
// عرض كتل المحتوى في الصفحة العامة (مكوّن خادم، بلا حالة).
import { sanitizeCaption } from "@/lib/sanitize";
import { parseEmbedUrl } from "@/lib/embed";
import type { IMediaBlock } from "@/interfaces/Design";
import { GRID_COLS } from "./gridClasses";

function Rich({ html, className = "" }: { html?: string; className?: string }) {
  const clean = sanitizeCaption(html);
  if (!clean) return null;
  return (
    <div
      className={`rich-content text-gray-700 dark:text-gray-300 transition-colors duration-500 ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export default function MediaBlocks({ blocks }: { blocks: IMediaBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        const key = b._key ?? `${b.type}-${i}`;

        if (b.type === "text") {
          return <Rich key={key} html={b.caption} className="py-4" />;
        }

        if (b.type === "embed") {
          const info = parseEmbedUrl(b.url);
          if (!info) return null;
          return (
            <div key={key} className="py-2">
              <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  src={info.embedUrl}
                  title={info.provider}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
              <Rich html={b.caption} className="pt-3" />
            </div>
          );
        }

        if (b.type === "grid") {
          const items = (b.items ?? []).filter((it) => it.url);
          if (items.length === 0) return null;
          const cols = GRID_COLS[b.columns ?? Math.min(items.length, 3)] ?? GRID_COLS[2];
          return (
            <div key={key} className="py-2">
              <div className={`grid ${cols} gap-2`}>
                {items.map((it, j) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={it._key ?? j}
                    src={it.url}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ))}
              </div>
              <Rich html={b.caption} className="pt-3" />
            </div>
          );
        }

        // image | video
        if (!b.url) return null;
        return (
          <div key={key} className="py-2">
            <div className="relative group w-full overflow-hidden">
              {b.type === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={b.url} alt="" loading="lazy" className="w-full h-auto object-contain mx-auto" />
              ) : (
                <video
                  src={b.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-contain mx-auto"
                />
              )}
            </div>
            <Rich html={b.caption} className="pt-3" />
          </div>
        );
      })}
    </>
  );
}
