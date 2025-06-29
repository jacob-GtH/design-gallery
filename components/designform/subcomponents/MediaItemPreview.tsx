"use client";

import { useRef, useEffect } from "react";
import { FiFileText, FiTrash } from "react-icons/fi";
import { MediaItem } from "../Types"; // تأكد من وجود هذا النوع
//import ProgressBar from './ProgressBar'; // مسار مكون ProgressBar إن وُجد

type Props = {
  item: MediaItem;
  index: number;
  readonly: boolean;
  dispatch: React.Dispatch<any>;
  removeMediaItem: (index: number) => void;
};

const MediaItemPreview = ({
  item,
  index,
  readonly,
  dispatch,
  removeMediaItem,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1.5">
      <div
        className="bg-blue-500 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

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

  return (
    <div className="relative group w-full overflow-hidden">
      <div className="relative">
        {item.type === "image" ? (
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
            {/* زر إظهار/إخفاء المحرر */}
            <div className="relative group/editor">
              <button
                onClick={() => dispatch({ type: "TOGGLE_EDITOR", index })}
                className="bg-white/80 text-gray-700 p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <FiFileText size={18} />
              </button>
              <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/editor:opacity-100 transition-opacity">
                {item.showEditor ? "إخفاء المحرر" : "إظهار المحرر"}
              </span>
            </div>

            {/* زر الحذف */}
            <div className="relative group/delete">
              <button
                onClick={() => removeMediaItem(index)}
                className="bg-white/80 text-gray-700 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <FiTrash size={18} />
              </button>
              <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/delete:opacity-100 transition-opacity">
                حذف الوسائط
              </span>
            </div>
          </div>
        )}
        {item.uploadProgress !== undefined && (
          <ProgressBar progress={item.uploadProgress} />
        )}
      </div>
    </div>
  );
};

export default MediaItemPreview;
