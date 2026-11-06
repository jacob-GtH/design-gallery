"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/common/SplashScreen";
import Loading from "@/components/common/loading";
import HomeSection from "@/components/sections/HomeSection";

const SPLASH_KEY = "splashSeen";

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  // زائر عائد في نفس الجلسة (أو يفضّل تقليل الحركة): لا شاشة بداية ولا انزلاق
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    // يضبطه سكربت صغير في layout.tsx قبل أول رسم (فلا يظهر وميض للشاشة)
    if (document.documentElement.dataset.splash === "seen") {
      setInstant(true);
      setStartAnimation(true);
      setSplashDone(true);
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {}
    // بدء الانتقال فوراً، وإزالة السبلاش بعد انتهاء الانتقال
    setStartAnimation(true);
    setSplashDone(true);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loading />
          </div>
        }
      >
        <AnimatePresence>
          {/* شاشة السبلاش */}
          {!splashDone && (
            <motion.div
              id="splash-root"
              key="splash-screen"
              initial={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{
                delay: 0.3,
                duration: 1.2,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="fixed inset-0 z-[9999] "
            >
              <SplashScreen onComplete={handleSplashComplete} />
            </motion.div>
          )}

          {/* الشاشة الرئيسية */}
          {startAnimation && (
            <motion.div
              key="main-content"
              initial={instant ? false : { y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
              className="relative z-10 bg-white dark:bg-gray-900 shadow-2xl shadow-gray-200 dark:shadow-slate-50 transition-colors duration-500"
            >
              <HomeSection animateStart={startAnimation} instant={instant} />
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
