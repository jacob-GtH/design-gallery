"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import DesignCard from "../DesignCard";
import CarouselControls from "./CarouselControls";
import { IDesign } from "@/interfaces/Design";

interface DesignCarouselProps {
  designs: IDesign[];
}

const DesignCarousel: React.FC<DesignCarouselProps> = ({ designs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const infiniteDesigns = designs ? [...designs, ...designs, ...designs] : [];

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

      if (scrollLeft <= 1) {
        container.scrollLeft = sectionWidth;
      } else if (scrollLeft >= sectionWidth * 2 - 1) {
        container.scrollLeft = sectionWidth;
      }

      const relativeIndex = Math.round((scrollLeft % sectionWidth) / (cardWidth + gap));
      setCurrentIndex(relativeIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      stopAutoScroll();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [designs?.length, isPlaying, startAutoScroll, stopAutoScroll]);

  if (!designs || designs.length === 0) {
    return (
      <section className="relative h-screen py-24 bg-gradient-to-tr from-purple-900/40 to-black">
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-xl">لا توجد تصاميم لعرضها</p>
        </div>
      </section>
    );
  }

  return (
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
            <DesignCard design={design} priority={true} />
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {designs.map((_, index) => (
          <div
            key={index}
            className={`w-6 md:w-14 h-1 rounded-full transition-colors ${
              index === currentIndex % designs.length ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DesignCarousel;
