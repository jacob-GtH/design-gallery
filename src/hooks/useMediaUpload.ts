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

    const data = new FormData();
    data.append("file", item.file);
    data.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
      const result = await uploadWithProgress(data, item.type, index, dispatch);

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

const uploadWithProgress = (
  data: FormData,
  type: string,
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
      const percent = Math.round((e.loaded / e.total) * 100);
      dispatch({ type: "UPDATE_PROGRESS", index, progress: percent });
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(xhr.statusText);
      }
    };

    xhr.onerror = () => reject(xhr.statusText);
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`
    );
    xhr.send(data);
  });
};
