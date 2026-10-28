// hooks/useMediaUpload.ts
import type { Dispatch } from "react";
import type { Block } from "@/components/admin/Types";
import type { BlockAction } from "@/hooks/blocksReducer";

/** الشكل الذي يُرسل للـ API (يطابق مخطط zod في الخادم). */
export type PayloadBlock =
  | { _key: string; type: "image" | "video"; url: string; caption: string }
  | { _key: string; type: "text"; caption: string }
  | { _key: string; type: "embed"; url: string; caption: string }
  | {
      _key: string;
      type: "grid";
      columns: number;
      items: { _key: string; url: string }[];
      caption: string;
    };

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
};

const getUploadSignature = async (type: "image" | "video"): Promise<UploadSignature> => {
  const res = await fetch("/api/admin/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  if (res.status === 401) throw new Error("انتهت الجلسة، سجّل الدخول من جديد");
  if (!res.ok) throw new Error("تعذر الحصول على إذن الرفع");
  return res.json();
};

const uploadWithProgress = (
  data: FormData,
  type: "image" | "video",
  cloudName: string,
  onProgress: (percent: number) => void
) =>
  new Promise<{ secure_url: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("استجابة غير صالحة من Cloudinary"));
        }
      } else {
        // Cloudinary يرجّع سبب الرفض في JSON (صيغة غير مسموحة، توقيع خاطئ...)
        let msg = xhr.statusText || `HTTP ${xhr.status}`;
        try {
          msg = JSON.parse(xhr.responseText)?.error?.message || msg;
        } catch {}
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error("خطأ في الاتصال بـ Cloudinary"));
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`);
    xhr.send(data);
  });

/** يرفع ملفاً واحداً بتوقيع من الخادم ويرجع الرابط الآمن. */
async function uploadFile(
  file: File,
  type: "image" | "video",
  onProgress: (percent: number) => void
): Promise<string> {
  const sig = await getUploadSignature(type);
  const data = new FormData();
  data.append("file", file);
  data.append("api_key", sig.apiKey);
  data.append("timestamp", String(sig.timestamp));
  data.append("signature", sig.signature);
  data.append("folder", sig.folder);
  data.append("allowed_formats", sig.allowedFormats);
  const result = await uploadWithProgress(data, type, sig.cloudName, onProgress);
  return result.secure_url;
}

/**
 * يرفع كل ملفات الكتل التي لم تُرفع بعد، ويرجع حمولة الـ API.
 * ما رُفع يُحفظ في الحالة (UPLOADED) فلا يُعاد رفعه إن فشلت خطوة لاحقة.
 */
export async function uploadBlocks(
  blocks: Block[],
  dispatch: Dispatch<BlockAction>
): Promise<PayloadBlock[]> {
  const payload: PayloadBlock[] = [];

  for (const b of blocks) {
    switch (b.type) {
      case "image":
      case "video": {
        let url = b.uploadedUrl;
        if (!url) {
          if (!b.file) throw new Error("ملف مفقود");
          url = await uploadFile(b.file, b.type, (p) =>
            dispatch({ type: "PROGRESS", key: b._key, progress: p })
          );
          dispatch({ type: "UPLOADED", key: b._key, url });
        }
        payload.push({ _key: b._key, type: b.type, url, caption: b.caption });
        break;
      }

      case "grid": {
        const items: { _key: string; url: string }[] = [];
        for (const it of b.items) {
          let url = it.uploadedUrl;
          if (!url) {
            if (!it.file) throw new Error("ملف مفقود");
            url = await uploadFile(it.file, "image", (p) =>
              dispatch({ type: "PROGRESS", key: b._key, itemKey: it._key, progress: p })
            );
            dispatch({ type: "UPLOADED", key: b._key, itemKey: it._key, url });
          }
          items.push({ _key: it._key, url });
        }
        payload.push({ _key: b._key, type: "grid", columns: b.columns, items, caption: b.caption });
        break;
      }

      case "embed":
        payload.push({ _key: b._key, type: "embed", url: b.url, caption: b.caption });
        break;

      case "text":
        payload.push({ _key: b._key, type: "text", caption: b.caption });
        break;
    }
  }
  return payload;
}
