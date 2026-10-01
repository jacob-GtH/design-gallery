"use client";

import { IDesign } from "@/interfaces/Design";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUser, FiPlay, FiPause, FiHeart, FiShare2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import MediaError from "./subcomponents/MediaError";
import MediaPlaceholder from "./subcomponents/MediaPlaceholder";

interface DesignCardProps {
  design: IDesign;
  priority?: boolean;
}

export default function DesignCard({ design, priority = false }: DesignCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const hasMedia = design.media && Array.isArray(design.media) && design.media.length > 0;
  const firstMedia = hasMedia ? design.media[0] : null;
  const isVideo = firstMedia?.type === "video";
  const isImage = firstMedia?.type === "image";

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
      <div className="relative h-[300px] md:h-[500px] 2xl:h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        {!hasMedia ? (
          <MediaError />
        ) : isImage ? (
          <>
            {!imageLoaded && !imageError && <MediaPlaceholder />}
            {imageError ? (
              <MediaError />
            ) : (
              <Image
                src={firstMedia.url}
                alt={design.title || t("designCard.noTitle")}
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
            <button
              onClick={toggleVideo}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white dark:hover:bg-black/70 transition-colors z-10"
              aria-label={isVideoPlaying ? t("designCard.pauseVideo") : t("designCard.playVideo")}
            >
              {isVideoPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
            </button>
          </div>
        ) : null}

        <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/90 dark:from-black/90 via-gray-400/30 dark:via-black/30 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-70"}`}>
          <div className={`absolute top-4 left-4 flex gap-2 transition-all duration-300 ${isHovered ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="p-2 bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
              aria-label={t("designCard.like")}
            >
              <FiHeart size={16} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="p-2 bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
              aria-label={t("designCard.share")}
            >
              <FiShare2 size={16} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <h3 className="text-black dark:text-white text-xl md:text-2xl font-bold mb-2 line-clamp-2">{design.title || t("designCard.noTitle")}</h3>
              {design.description && <p className="text-gray-600 dark:text-gray-200 text-sm md:text-base mb-3 line-clamp-2">{design.description}</p>}
              {design.designer && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-500 dark:text-gray-300 text-sm gap-2">
                    <FiUser className="flex-shrink-0" />
                    <span className="truncate">{typeof design.designer === "object" && design.designer !== null ? design.designer.name || t("designCard.unknownDesigner") : t("designCard.unknownDesigner")}</span>
                  </span>
                  {design.createdAt && <span className="text-gray-500 dark:text-gray-400 text-xs">{new Date(design.createdAt).toLocaleDateString("ar-SA")}</span>}
                </div>
              )}
            </motion.div>
          </div>
        </div>
        <Link href={`/designs/${design.id}`} className="absolute inset-0 z-20" aria-label={t("designCard.viewDetails", { title: design.title || t("designCard.noTitle") })} />
      </div>
    </motion.div>
  );
}
