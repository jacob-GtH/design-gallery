"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SplashScreen from "../components/common/SplashScreen";
import LoadingSpinner from "../components/common/LoadingSpinner";
import HomeSection  from "./home/page";

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);

  const fetchDesigns = useCallback(async () => {
    if (!splashDone) return;
  }, [splashDone]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleSplashComplete = () => {
    // بدء الانتقال فوراً
    setStartAnimation(true);
    // إزالة السبلاش بعد انتهاء الانتقال
    setSplashDone(true);
  };

  return (
    <main className="min-h-screen overflow-hidden relative">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
          </div>
        }
      >
        <AnimatePresence>
          {/* شاشة السبلاش */}
          {!splashDone && (
            <motion.div
              key="splash-screen"
              initial={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{
                delay: 0.3,
                duration: 1.2,
                ease: [12, 0, 0.24, 1],
              }}
              className="fixed inset-0 z-[9999]"
            >
              <SplashScreen onComplete={handleSplashComplete} />
            </motion.div>
          )}

          {/* الشاشة الرئيسية */}
          {startAnimation && (
            <motion.div
              key="main-content"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.2, ease: [-1.1, 0, 0.24, 1] }}
              className="relative z-10 bg-gray-900"
            >
              <HomeSection animateStart={startAnimation} />
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>
    </main>
  );
}
