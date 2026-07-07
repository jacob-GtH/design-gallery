'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const showCursor = () => setIsVisible(true);
    const hideCursor = () => setIsVisible(false);

    window.addEventListener("mousemove", moveCursor);

    const targets = document.querySelectorAll(".hover-target");
    targets.forEach((el) => {
      el.addEventListener("mouseenter", showCursor);
      el.addEventListener("mouseleave", hideCursor);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", showCursor);
        el.removeEventListener("mouseleave", hideCursor);
      });
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cursor"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            x: position.x - 80,
            y: position.y - 80,
          }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed z-[9999] w-40 h-40 rounded-full bg-white/85 pointer-events-none flex items-center justify-center text-7xl text-black font-sans"
        >
          <span className="mb-7">→</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
