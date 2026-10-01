"use client";

import { useRef, useEffect } from "react";
import { FiTrash2, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Props } from "../Types";

const MediaItemPreview = ({
  item,
  index,
  readonly,
  removeMediaItem,
  moveUp,
  moveDown,
}: Props) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (item.type !== "video" || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          videoRef.current?.play();
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(videoRef.current);

    return () => {
      observer.disconnect();
    };
  }, [item.type]);

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1.5">
      <div
        className="bg-blue-500 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  return (
    <div className="relative group w-full overflow-hidden">
      {item.type === "image" ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={item.previewUrl}
          alt="معاينة التصميم"
          className="w-full h-auto object-contain mx-auto"
        />
      ) : (
        <video
          ref={videoRef}
          src={item.previewUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto object-contain mx-auto"
        />
      )}

      {!readonly && (
        <div className="absolute top-3 right-3 flex space-x-2">
          <div className="relative group/delete">
            <button
              onClick={() => removeMediaItem(index)}
              className="bg-white/80 text-gray-700 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <FiTrash2 size={18} />
            </button>
            <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/delete:opacity-100 transition-opacity">
              {t("admin.deleteMedia")}
            </span>
          </div>

          <div className="relative group/up">
            <button
              onClick={() => moveUp?.(index)}
              className="bg-white/80 text-gray-700 p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              disabled={index === 0}
            >
              <FiChevronUp size={18} />
            </button>
            <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/up:opacity-100 transition-opacity">
              تحريك لأعلى
            </span>
          </div>

          <div className="relative group/down">
            <button
              onClick={() => moveDown?.(index)}
              className="bg-white/80 text-gray-700 p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <FiChevronDown size={18} />
            </button>
            <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/down:opacity-100 transition-opacity">
              تحريك لأسفل
            </span>
          </div>
        </div>
      )}

      {item.caption && !readonly && (
        <div
          className="text-gray-600 dark:text-gray-300 leading-relaxed prose prose-neutral dark:prose-invert max-w-none mt-4"
          dangerouslySetInnerHTML={{ __html: item.caption }}
        />
      )}

      {item.uploadProgress !== undefined && (
        <ProgressBar progress={item.uploadProgress} />
      )}
    </div>
  );
};

export default MediaItemPreview;