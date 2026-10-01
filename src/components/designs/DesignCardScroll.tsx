"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function DesignFooterMotion({ relatedDesigns }: { relatedDesigns: { id: string, title: string, mediaUrl: string, mediaType: string }[] }) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // إصلاح Hydration: قبل التركيب، نستخدم نفس قيمة SSR (isRTL = false)
  const isRTL = mounted && i18n.language?.startsWith("ar");

  // ✅ كرر التصاميم 3 مرات
  const infiniteDesigns = [...relatedDesigns, ...relatedDesigns, ...relatedDesigns];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // ✅ ابدأ من النسخة الثانية (المنتصف)
    const scrollToMiddle = () => {
      const scrollWidth = container.scrollWidth / 3;
      container.scrollLeft = scrollWidth;
    };

    scrollToMiddle();

    const handleScroll = () => {
      const scrollWidth = container.scrollWidth;
      const scrollLeft = container.scrollLeft;
      const third = scrollWidth / 3;

      if (scrollLeft >= third * 2 - 1) {
        container.scrollLeft = third;
      }

      if (scrollLeft <= 1) {
        container.scrollLeft = third;
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = window.innerHeight * 0.25;
      const nearBottom = window.innerHeight - e.clientY < threshold;

      if (nearBottom && !isVisible) {
        setIsVisible(true);
        controls.start({ y: 0, opacity: 1 });
      } else if (!nearBottom && isVisible) {
        setIsVisible(false);
        controls.start({ y: 100, opacity: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [controls, isVisible]);

  return (
    <motion.div
      animate={controls}
      initial={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-gray-100/90 dark:from-black/90 to-transparent px-4 py-6 transition-colors duration-500"
    >
      <h2 className={`text-gray-500 dark:text-white/50 text-xl font-bold ml-2 mb-2 ${isRTL ? "text-right" : "text-left"} border-b border-gray-200 dark:border-gray-800 pb-4 transition-colors duration-500`}>{t("designCardScroll.title")}</h2>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
      >
        {infiniteDesigns.map((related, index) => (
          <Link
            key={`${related.id}-${index}`}
            href={`/designs/${related.id}`}
            className="group w-48 flex-shrink-0"
          >
            <div className="relative aspect-square bg-gray-200/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-xl transition-colors duration-500">
              {related.mediaType === "image" ? (
                <Image
                  src={related.mediaUrl}
                  alt={related.title}
                  width={400}
                  height={400}
                  unoptimized
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <video
                  src={related.mediaUrl}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-200 dark:from-gray-950 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300 transition-colors duration-500" />
              <p className={`absolute bottom-4 ${isRTL ? "right-4" : "right-4"} text-sm text-black dark:text-white font-semibold truncate max-w-[calc(100%-20px)] z-10 transition-colors duration-500`}>{related.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
