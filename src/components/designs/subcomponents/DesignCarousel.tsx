"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import DesignCard from "../DesignCard";
import { IDesign } from "@/interfaces/Design";

interface DesignCarouselProps {
  designs: IDesign[];
}

export default function DesignCarousel({ designs }: DesignCarouselProps) {
  const [index, setIndex] = useState(0);

  // التنقل التلقائي
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % designs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [designs.length]);

  return (
    <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center overflow-hidden px-4">
      <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
        <AnimatePresence initial={false}>
          {[-1, 0, 1].map((offset) => {
            const itemIndex = (index + offset + designs.length) % designs.length;
            const design = designs[itemIndex];

            return (
              <motion.div
                key={`${design.id}-${itemIndex}`}
                initial={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  x: offset * 300,
                  zIndex: 0 
                }}
                animate={{ 
                  opacity: offset === 0 ? 1 : 0.4, 
                  scale: offset === 0 ? 1 : 0.85, 
                  x: offset * (typeof window !== "undefined" && window.innerWidth > 768 ? 400 : 200),
                  zIndex: offset === 0 ? 20 : 10,
                  filter: offset === 0 ? "blur(0px)" : "blur(4px)",
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  x: offset === 1 ? 500 : -500 
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1]
                }}
                className="absolute w-[300px] md:w-[600px] xl:w-[800px]"
              >
                <div className={`transition-all duration-500 ${offset === 0 ? "shadow-[0_0_50px_rgba(99,102,241,0.2)]" : ""}`}>
                  <DesignCard design={design} priority={offset === 0} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-4 flex gap-2 z-30">
        {designs.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === i ? "w-8 bg-indigo-500" : "w-2 bg-black/20 dark:bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Side Buttons for Manual Navigation */}
      <button 
        onClick={() => setIndex((prev) => (prev - 1 + designs.length) % designs.length)}
        className="absolute left-4 md:left-10 z-40 p-4 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-black dark:text-white transition-all backdrop-blur-sm transition-colors duration-500"
      >
        <svg className="w-6 h-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button 
        onClick={() => setIndex((prev) => (prev + 1) % designs.length)}
        className="absolute right-4 md:right-10 z-40 p-4 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-black dark:text-white transition-all backdrop-blur-sm transition-colors duration-500"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
