"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

type SplashScreenProps = {
  onComplete: () => void;
};

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // محاكاة لتقدم التحميل لزيادة التفاعل
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 30);

    const timer = setTimeout(() => {
      setShowSplash(false);
      onComplete(); // Move onComplete here to ensure it's called after the splash screen is hidden
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  const title = "Design Gallery";
  const letters = Array.from(title);

  return (
    <AnimatePresence mode="wait">
      {showSplash && (
        <motion.div
          key={"splash-screen"}
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[9999] bg-white dark:bg-[#050505] flex flex-col items-center justify-center overflow-hidden transition-colors duration-500"
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full transition-colors duration-500" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-500/10 blur-[120px] rounded-full transition-colors duration-500" />
            <div className="absolute inset-0 bg-[url(https://grainy-gradients.vercel.app/noise.svg)] opacity-[0.05] dark:opacity-[0.03] brightness-100 contrast-150 transition-opacity duration-500" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                filter: "blur(0px)",
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 1, 
                ease: "easeOut",
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
              }}
              className="relative w-24 h-24 md:w-32 md:h-32 mb-10"
            >
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
              <Image
                src="/logo-for-web-jakop.svg"
                alt="Logo"
                width={128}
                height={128}
                priority
                className="object-contain relative z-20"
              />
            </motion.div>

            {/* Staggered Title Animation */}
            <div className="flex mb-4">
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.5,
                    delay: 0.5 + index * 0.05,
                    ease: "easeOut",
                  }}
                  className={`text-3xl md:text-5xl font-bold tracking-tight text-black dark:text-white ${letter === " " ? "mr-4" : ""}`}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="text-sm md:text-base tracking-[0.3em] uppercase text-gray-600 dark:text-gray-400 font-light transition-colors duration-500"
            >
              Discover stunning creations
            </motion.p>
          </div>

          {/* Progress Bar Container */}
          <div className="absolute bottom-20 w-48 h-[2px] bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden transition-colors duration-500">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            />
          </div>

          {/* Copyright or Branding Mini Text */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 text-[10px] uppercase tracking-widest text-black dark:text-white font-medium transition-colors duration-500"
          >
            © 2024 DESIGN GALLERY STUDIO
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
