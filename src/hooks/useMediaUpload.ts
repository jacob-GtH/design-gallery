import { Dispatch } from "react";
import { MediaItem, MediaType } from "@/components/admin/Types";
import { MediaAction } from "@/hooks/mediaAction";

export const uploadMediaItems = async (
  mediaItems: MediaItem[],
  dispatch: Dispatch<MediaAction>
): Promise<{ _key: string; url: string; type: MediaType; caption?: string }[]> => {
  const uploaded: { _key: string; url: string; type: MediaType; caption?: string }[] = [];
  const errors: string[] = [];

  for (const [index, item] of mediaItems.entries()) {
    if (item.uploadedUrl) {
      uploaded.push({
        _key: item._key,
        url: item.uploadedUrl,
        type: item.type,
        caption: item.caption,
      });
      continue;
    }

    if (!item.file) {
      errors.push(`الوسيط ${index + 1}: لا يوجد ملف`);
      continue;
    }

    try {
      // توقيع من الخادم لكل ملف (يتطلب جلسة المدير)
      const sig = await getUploadSignature(item.type);

      const data = new FormData();
      data.append("file", item.file);
      data.append("api_key", sig.apiKey);
      data.append("timestamp", String(sig.timestamp));
      data.append("signature", sig.signature);
      data.append("folder", sig.folder);
      data.append("allowed_formats", sig.allowedFormats);

      const result = await uploadWithProgress(
        data,
        item.type,
        sig.cloudName,
        index,
        dispatch
      );

      if (result?.secure_url) {
        uploaded.push({
          _key: item._key,
          url: result.secure_url,
          type: item.type,
          caption: item.caption,
        });
      } else {
        errors.push(`الوسيط ${index + 1}: استجابة غير صالحة من الخادم`);
      }
    } catch (err) {
      errors.push(`الوسيط ${index + 1}: ${(err as Error).message || "فشل الرفع"}`);
    }
  }

  // إذا فشل أي وسيط، ارمِ خطأً مجمعاً
  if (errors.length > 0) {
    throw new Error(`فشل رفع ${errors.length} وسيط:\n${errors.join("\n")}`);
  }

  return uploaded;
};

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
};

const getUploadSignature = async (type: string): Promise<UploadSignature> => {
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
  type: string,
  cloudName: string,
  index: number,
  dispatch: Dispatch<MediaAction>
) => {
  return new Promise<{
    secure_url: string;
    original_filename: string;
    resource_type: string;
  }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (!e.lengthComputable) return;
      const percent = Math.round((e.loaded / e.total) * 100);
      dispatch({ type: "UPDATE_PROGRESS", index, progress: percent });
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
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`
    );
    xhr.send(data);
  });
};
