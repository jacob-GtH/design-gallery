"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface MediaCarouselProps {
  media: React.ReactNode[];
  isDarkBg?: boolean;
  mutedTextColor?: string;
}

export default function MediaCarousel({ media, isDarkBg = false }: MediaCarouselProps) {
  const [index, setIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const prev = () => {
    if (media.length > 1) setIndex((i) => (i - 1 + media.length) % media.length);
  };
  const next = () => {
    if (media.length > 1) setIndex((i) => (i + 1) % media.length);
  };

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v) {
        if (i === index && v.autoplay) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    });
  }, [index]);

  if (!media || media.length === 0) return null;
  if (media.length === 1) {
    return (
      <section className="pb-12">
        {media[0]}
      </section>
    );
  }

  return (
    <section className="pb-12">
      <div className="relative group w-full overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {media[index]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prev}
          className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md ${isDarkBg ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"} transition-all duration-300 opacity-0 group-hover:opacity-100`}
          aria-label="Previous media"
        >
          <FiChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md ${isDarkBg ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"} transition-all duration-300 opacity-0 group-hover:opacity-100`}
          aria-label="Next media"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {media.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === index ? (isDarkBg ? "w-6 bg-white" : "w-6 bg-indigo-600") : (isDarkBg ? "bg-white/30" : "bg-gray-300")}`}
            aria-label={`Go to media ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}