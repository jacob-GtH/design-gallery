// src/components/designs/CoverMedia.tsx
// صورة/فيديو الغلاف داخل بطاقة (يمرّر الأصناف من المكان المستدعي).
import Image from "next/image";
import { getCover } from "@/lib/cover";
import type { IMediaBlock } from "@/interfaces/Design";

export default function CoverMedia({
  media,
  coverKey,
  alt,
  imageClassName = "",
  videoClassName = "",
}: {
  media: IMediaBlock[];
  coverKey?: string | null;
  alt: string;
  imageClassName?: string;
  videoClassName?: string;
}) {
  const cover = getCover(media, coverKey);
  if (!cover) {
    return <div className="w-full h-full bg-gray-200 dark:bg-gray-800" aria-hidden="true" />;
  }
  return cover.type === "image" ? (
    <Image src={cover.url} alt={alt} fill unoptimized className={imageClassName} />
  ) : (
    <video src={cover.url} muted autoPlay loop playsInline className={videoClassName} />
  );
}
