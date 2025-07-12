"use client";

import { IDesign } from "@/interfaces/Design";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiPlay,
  FiPause,
  FiEye,
  FiHeart,
  FiShare2,
} from "react-icons/fi";

interface DesignCardProps {
  design: IDesign;
  priority?: boolean;
  
}

export default function DesignCard({
  design, 
  priority = false,

}: DesignCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // التحكم في الفيديو عند hover
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered) {
      video.play().catch(console.error);
      setIsVideoPlaying(true);
    } else {
      video.pause();
      setIsVideoPlaying(false);
    }
  }, [isHovered]);

  // التحقق من وجود الميديا
  const hasMedia =
    design.media && Array.isArray(design.media) && design.media.length > 0;
  const firstMedia = hasMedia ? design.media[0] : null;
  const isVideo = firstMedia?.type === "video";
  const isImage = firstMedia?.type === "image";

  // دالة toggle للفيديو
  const toggleVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const video = videoRef.current;
    if (!video) return;

    if (isVideoPlaying) {
      video.pause();
      setIsVideoPlaying(false);
    } else {
      video.play().catch(console.error);
      setIsVideoPlaying(true);
    }
  };

  return (
    <motion.div
      className="relative pl-4 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-[300px] md:h-[500px] 2xl:h-[600px] rounded-xl overflow-hidden shadow-lg  border-gray-800 bg-gray-900">
        {/* محتوى الميديا */}
        {!hasMedia ? (
          // حالة عدم وجود ميديا
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center text-gray-400">
              <FiEye size={48} className="mx-auto mb-4 opacity-50" />
              <p>لا توجد صورة</p>
            </div>
          </div>
        ) : isImage ? (
          // عرض الصورة
          <>
            {!imageLoaded && !imageError && (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            )}

            {imageError ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center text-gray-400">
                  <FiEye size={48} className="mx-auto mb-4 opacity-50" />
                  <p>فشل في تحميل الصورة</p>
                </div>
              </div>
            ) : (
              <Image
                src={firstMedia.url}
                alt={design.title || "تصميم"}
                fill
                className={`object-cover w-full h-full transition-all duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                } ${isHovered ? "scale-105" : "scale-100"}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                priority={priority}
                unoptimized
              />
            )}
          </>
        ) : isVideo ? (
          // عرض الفيديو
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={firstMedia.url}
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              onLoadStart={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />

            {/* زر تشغيل/إيقاف الفيديو */}
            <button
              onClick={toggleVideo}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors z-10"
              aria-label={isVideoPlaying ? "إيقاف الفيديو" : "تشغيل الفيديو"}
            >
              {isVideoPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
            </button>
          </div>
        ) : null}

        {/* Overlay مع التفاصيل */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-70"
          }`}
        >
          {/* أزرار التفاعل */}
          <div
            className={`absolute top-4 left-4 flex gap-2 transition-all duration-300 ${
              isHovered
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // إضافة منطق الإعجاب
              }}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
              aria-label="أعجبني"
            >
              <FiHeart size={16} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // إضافة منطق المشاركة
              }}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
              aria-label="مشاركة"
            >
              <FiShare2 size={16} />
            </button>
          </div>

          {/* معلومات التصميم */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-white text-xl md:text-2xl font-bold mb-2 line-clamp-2">
                {design.title || "تصميم بدون عنوان"}
              </h3>

              {design.description && (
                <p className="text-gray-200 text-sm md:text-base mb-3 line-clamp-2">
                  {design.description}
                </p>
              )}

              {/* معلومات المصمم */}
              {design.designer && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-300 text-sm gap-2">
                    <FiUser className="flex-shrink-0" />
                    <span className="truncate">
                      {typeof design.designer === "object" &&
                      design.designer !== null
                        ? design.designer.name || "مصمم مجهول"
                        : "مصمم مجهول"}
                    </span>
                  </span>

                  {/* تاريخ الإنشاء */}
                  {design.createdAt && (
                    <span className="text-gray-400 text-xs">
                      {new Date(design.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* رابط للعرض الكامل */}
        <Link
          href={`/designs/${design.id}`}
          className="absolute inset-0 z-20"
          aria-label={`عرض تفاصيل ${design.title || "التصميم"}`}
        />
      </div>
    </motion.div>
  );
}
