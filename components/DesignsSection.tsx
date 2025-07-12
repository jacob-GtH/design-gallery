"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DesignCard from "./designs/DesignCard";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface DesignsSectionProps {
  designs: any[];
  
}

export default function DesignsSection({ designs }: DesignsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!designs || designs.length === 0) {
    return (
      <section className="relative h-screen py-24 bg-gradient-to-tr from-purple-900/40 to-black">
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-xl">لا توجد تصاميم لعرضها</p>
        </div>
      </section>
    );
  }

  const infiniteDesigns = [...designs, ...designs, ...designs];

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      const cardWidth = container.children[0]?.clientWidth || 0;
      const gap = 40;
      const scrollAmount = cardWidth + gap;

      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }, 3000);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const scrollToDesign = useCallback((direction: "prev" | "next") => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = container.children[0]?.clientWidth || 0;
    const gap = 40;
    const scrollAmount = cardWidth + gap;

    container.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => {
      if (prev) {
        stopAutoScroll();
        return false;
      } else {
        startAutoScroll();
        return true;
      }
    });
  }, [startAutoScroll, stopAutoScroll]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // ✅ الموضع الابتدائي باستخدام requestAnimationFrame
    const setupInitialPosition = () => {
      const cardWidth = container.children[0]?.clientWidth || 0;
      const gap = 40;
      const sectionWidth = (cardWidth + gap) * designs.length;
      container.scrollLeft = sectionWidth;
    };

    requestAnimationFrame(setupInitialPosition);

    if (isPlaying) {
      startAutoScroll();
    }

    const handleScroll = () => {
      const cardWidth = container.children[0]?.clientWidth || 0;
      const gap = 40;
      const sectionWidth = (cardWidth + gap) * designs.length;
      const scrollLeft = container.scrollLeft;

      // ✅ الحفاظ على الانزلاق اللانهائي
      if (scrollLeft <= 1) {
        container.scrollLeft = sectionWidth;
      } else if (scrollLeft >= sectionWidth * 2 - 1) {
        container.scrollLeft = sectionWidth;
      }

      // ✅ تحديث currentIndex
      const relativeIndex = Math.round(
        (scrollLeft % sectionWidth) / (cardWidth + gap)
      );
      setCurrentIndex(relativeIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      stopAutoScroll();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [designs.length, isPlaying, startAutoScroll, stopAutoScroll]);

  return (
    <section className="relative min-h-screen py-4 ">
      {/* العنوان */}
      <div className="relative mb-16">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          viewport={{ amount: 0.5 }}
        >
          أحدث التصاميم
        </motion.h2>
      </div>

      {/* أزرار التحكم */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => scrollToDesign("prev")}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="التصميم السابق"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={togglePlayPause}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label={isPlaying ? "إيقاف التشغيل" : "تشغيل"}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={() => scrollToDesign("next")}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="التصميم التالي"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* حاوية التصاميم */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-10 overflow-x-hidden scrollbar-hide px-8 pb-8"
          style={{ scrollSnapType: "x mandatory" }}
          onMouseEnter={stopAutoScroll}
          onMouseLeave={() => isPlaying && startAutoScroll()}
        >
          {infiniteDesigns.map((design, index) => (
            <motion.div
              key={`${design.id}-${index}`}
              initial={{ opacity: 0, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                delay: (index % designs.length) * 0.1,
                ease: "easeOut",
              }}
              viewport={{ amount: 0.3 }}
              className="relative w-[400px] md:w-[700px] xl:w-[900px] flex-shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <DesignCard design={design} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* مؤشرات التصاميم */}
      <div className="flex justify-center gap-2 mt-8">
        {designs.map((_, index) => (
          <div
            key={index}
            className={`w-6 md:w-14 h-1 rounded-full transition-colors ${
              index === currentIndex % designs.length
                ? "bg-white"
                : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
