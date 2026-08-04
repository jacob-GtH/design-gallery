"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionBadge } from "../ui/SectionBadge";

export default function HeroSection({
  animateStart,
}: {
  animateStart: boolean;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
  // Parallax effects
  const textY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.section
      id="home"
      initial={{ y: "100%" }}
      animate={animateStart ? { y: 0 } : {}}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      className="relative h-screen w-full flex items-center justify-end overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500"
    >
      {/* Background Image - Strongly aligned to the left */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-left md:bg-[left_center] bg-no-repeat opacity-100 dark:opacity-60 transition-opacity duration-500"
        style={{ backgroundImage: `url("/images/bgHome.png")` }}
      />
      
      {/* Gradient Overlays - Clear the left side, darken the right */}
      <div className="absolute inset-0 z-1 bg-gradient-to-r from-transparent via-white/0 dark:via-black/20 to-white/7 dark:to-black/90 hidden md:block" />
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-black/10 dark:via-black/10 to-white/10 dark:to-[#050505]" />

      {/* Interactive Spotlight Glow */}
      <motion.div
        className="absolute inset-0 z-2 pointer-events-none dark:opacity-20 opacity-40 transition-opacity duration-500"
        animate={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
        }}
      />

      {/* Content Container - Pushed to the extreme right on desktop */}
      <div className="relative z-10 w-full flex flex-col items-center md:items-end text-center md:text-right px-6 md:px-12 lg:px-24">
        <motion.div style={{ y: textY, opacity }} className="max-w-2xl xl:max-w-3xl flex flex-col items-center md:items-end">
          {/* Badge */}
          <SectionBadge className="mb-6">
            Design Gallery Studio
          </SectionBadge>

          {/* Main Headline - Compact and ultra-aligned to the right */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={animateStart ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.7, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white dark:text-white leading-[1.1] mb-8"
          >
            نصنع الواقع <br />
            <span className="text-transparent bg-clip-text bg-hero-gradient">
              بلمسات إبداعية
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={animateStart ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.9, duration: 0.8 }}
            className="text-indigo-200 dark:text-gray-400 text-base md:text-lg lg:text-xl max-w-lg mb-10 font-light leading-relaxed ml-auto"
          >
            استوديو إبداعي متخصص في تحويل الرؤى الطموحة إلى تجارب رقمية استثنائية تترك أثراً لا ينسى في عالم التصميم.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={animateStart ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 2.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row-reverse gap-4 justify-start"
          >
            <Link 
              href="#case-studies"
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-white transition-all hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2"
            >
              استكشف أعمالنا
              <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            
            <Link 
              href="#contact"
              className="px-8 py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl font-bold text-white dark:text-white transition-all text-center"
            >
              تواصل معنا
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={animateStart ? { opacity: 1 } : {}}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 right-8 md:right-12 flex flex-col items-center gap-2"
      >
        <div className="w-[1px] h-10 bg-gradient-to-b from-purple-500 to-transparent" />
      </motion.div>

      {/* Side Branding Mini Text */}
      <div className="absolute left-10 bottom-10 opacity-20 dark:opacity-10 hidden md:block rotate-[-90deg] origin-left">
        <span className="text-sm font-bold text-black dark:text-white uppercase tracking-[0.5em] whitespace-nowrap">
          The Art of Excellence
        </span>
      </div>
    </motion.section>
  );
}

