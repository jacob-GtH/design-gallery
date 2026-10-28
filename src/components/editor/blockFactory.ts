// components/editor/blockFactory.ts
// إنشاء الكتل والتحقق من الملفات (دوال خالصة قدر الإمكان).
import { v4 as uuidv4 } from "uuid";
import type { Block, GridItem } from "@/components/admin/Types";
import type { IMediaBlock } from "@/interfaces/Design";
import { MAX_GRID_ITEMS } from "@/hooks/blocksReducer";

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB (يمكنك رفعه للفيديو لاحقاً)

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export const ACCEPT_IMAGE = IMAGE_TYPES.join(",");
export const ACCEPT_VIDEO = VIDEO_TYPES.join(",");
export const ACCEPT_ANY = `${ACCEPT_IMAGE},${ACCEPT_VIDEO}`;

export type FileKind = "image" | "video" | "any";
export type Rejected = { file: File; reason: "size" | "type" };

export function validateFiles(
  files: File[],
  kind: FileKind
): { valid: File[]; rejected: Rejected[] } {
  const allowed =
    kind === "image" ? IMAGE_TYPES : kind === "video" ? VIDEO_TYPES : [...IMAGE_TYPES, ...VIDEO_TYPES];
  const valid: File[] = [];
  const rejected: Rejected[] = [];
  for (const file of files) {
    if (!allowed.includes(file.type)) rejected.push({ file, reason: "type" });
    else if (file.size > MAX_FILE_BYTES) rejected.push({ file, reason: "size" });
    else valid.push(file);
  }
  return { valid, rejected };
}

export const newKey = () => uuidv4();

export function makeMediaBlock(file: File): Block {
  return {
    type: file.type.startsWith("video/") ? "video" : "image",
    _key: newKey(),
    file,
    previewUrl: URL.createObjectURL(file),
    caption: "",
  };
}

export function makeGridItems(files: File[]): GridItem[] {
  return files.map((file) => ({
    _key: newKey(),
    file,
    previewUrl: URL.createObjectURL(file),
  }));
}

export function makeGridBlock(files: File[]): Block {
  const items = makeGridItems(files.slice(0, MAX_GRID_ITEMS));
  return { type: "grid", _key: newKey(), columns: Math.min(items.length, 3), items, caption: "" };
}

export const makeTextBlock = (): Block => ({ type: "text", _key: newKey(), caption: "" });
export const makeEmbedBlock = (canonicalUrl: string): Block => ({
  type: "embed",
  _key: newKey(),
  url: canonicalUrl,
  caption: "",
});

/** تحويل الكتل المحفوظة (من الـ API) إلى كتل المحرر. */
export function blocksFromPersisted(media: IMediaBlock[] | null | undefined): Block[] {
  const out: Block[] = [];
  for (const m of media ?? []) {
    const _key = m._key || newKey();
    const caption = m.caption ?? "";
    switch (m.type) {
      case "image":
      case "video":
        if (m.url) out.push({ type: m.type, _key, file: null, previewUrl: m.url, uploadedUrl: m.url, caption });
        break;
      case "text":
        out.push({ type: "text", _key, caption });
        break;
      case "embed":
        if (m.url) out.push({ type: "embed", _key, url: m.url, caption });
        break;
      case "grid": {
        const items: GridItem[] = (m.items ?? [])
          .filter((it) => it.url)
          .map((it) => ({ _key: it._key || newKey(), file: null, previewUrl: it.url, uploadedUrl: it.url }));
        if (items.length) {
          out.push({ type: "grid", _key, columns: m.columns ?? Math.min(items.length, 3), items, caption });
        }
        break;
      }
      default:
        break;
    }
  }
  return out;
}

export const isVisualBlock = (b: { type: string }) =>
  b.type === "image" || b.type === "video" || b.type === "grid";
