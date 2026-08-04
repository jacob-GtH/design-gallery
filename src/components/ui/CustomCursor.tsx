// src/components/ui/CustomCursor.tsx
'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // استخدام السبرينغ (Spring) لحركة أكثر نعومة واحترافية
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      // إظهار الماوس بمجرد حركته
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", moveCursor);

    // مراقبة العناصر التي تحمل كلاس hover-target
    const updateTargets = () => {
      const targets = document.querySelectorAll(".hover-target");
      targets.forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
      });
    };

    updateTargets();
    
    // إعادة فحص العناصر في حال تغيرت الصفحة
    const observer = new MutationObserver(updateTargets);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div className="hidden lg:block">
      {/* 1. النقطة المركزية (تظهر دائماً في جميع أنحاء الموقع بمجرد توفر الإحداثيات) */}
      <motion.div
        style={{
          left: cursorX,
          top: cursorY,
          opacity: isVisible ? 1 : 0,
        }}
        className="fixed z-[10000] w-2 h-2 bg-indigo-500 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(99,102,241,1)] transition-opacity duration-300"
      />

      <AnimatePresence>
        {isVisible && (
          <>
            {/* 2. الهالة الخارجية (تتفاعل عند الـ Hover فقط) */}
            <motion.div
              style={{
                left: cursorX,
                top: cursorY,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isHovering ? 1 : 0.4,
                opacity: isHovering ? 1 : 0.15,
              }}
              className={`fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center transition-colors duration-500 ${
                isHovering ? "w-32 h-32 bg-black/5 dark:bg-white/10 backdrop-blur-md" : "w-12 h-12 bg-transparent"
              }`}
            >
              {isHovering && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-[10px] font-black tracking-[0.3em] text-black dark:text-white uppercase ml-1 transition-colors duration-500">VIEW</span>
                  <span className="text-xl text-indigo-500 dark:text-indigo-400 mt-1 transition-colors duration-500">→</span>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
