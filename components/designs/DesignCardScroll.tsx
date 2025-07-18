"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function DesignFooterMotion({ relatedDesigns }: { relatedDesigns: any[] }) {
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 to-transparent px-4 py-6"
    >
      <h2 className="text-white/50 text-lg font-semibold ml-2 mb-2">Other Designs</h2>
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
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {related.mediaType === "image" ? (
                <Image
                  src={related.mediaUrl}
                  alt={related.title}
                  width={400}
                  height={400}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <video
                  src={related.mediaUrl}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <p className="mt-2 ml-2 text-sm text-white truncate">{related.title}</p>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
