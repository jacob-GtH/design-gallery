// src/components/designs/CoverMedia.tsx
// صورة/فيديو الغلاف داخل بطاقة (يمرّر الأصناف من المكان المستدعي).
"use client";

import Image from "next/image";
import { getCover } from "@/lib/cover";
import {
  cloudinaryVideoPoster,
  optimizeCloudinaryImage,
  optimizeCloudinaryVideo,
} from "@/lib/cloudinaryUrl";
import type { IMediaBlock } from "@/interfaces/Design";
import LazyVideo from "./LazyVideo";

export default function CoverMedia({
  media,
  coverKey,
  alt,
  imageClassName = "",
  videoClassName = "",
  width = 900,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  media: IMediaBlock[];
  coverKey?: string | null;
  alt: string;
  imageClassName?: string;
  videoClassName?: string;
  /** أقصى عرض يُطلب من Cloudinary */
  width?: number;
  sizes?: string;
}) {
  const cover = getCover(media, coverKey);
  if (!cover) {
    return <div className="w-full h-full bg-gray-200 dark:bg-gray-800" aria-hidden="true" />;
  }
  return cover.type === "image" ? (
    <Image
      src={optimizeCloudinaryImage(cover.url, width)}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized
      className={imageClassName}
    />
  ) : (
    <LazyVideo
      src={optimizeCloudinaryVideo(cover.url, width)}
      poster={cloudinaryVideoPoster(cover.url, width)}
      className={videoClassName}
    />
  );
}
