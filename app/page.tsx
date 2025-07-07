"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SplashScreen from "../components/SplashScreen";
import HeroSection from "../components/HeroSection";
import CaseStudiesSection from "../components/CaseStudiesSection";
import ServicesSection from "../components/ServicesSection";
import ContactSection from "../components/ContactSection";
import DesignsSection from "../components/DesignsSection";
import Footer from "./footer/page";
import LoadingSpinner from "../components/loadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

interface Design {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDesigns = useCallback(async () => {
    if (!splashDone) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/designs");
      if (!res.ok) throw new Error(`تفقد الانترنت -_- : ${res.status}`);
      const data = await res.json();
      setDesigns(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(message);
      console.error("Error fetching designs:", err);
    } finally {
      setLoading(false);
    }
  }, [splashDone]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleRetry = () => {
    fetchDesigns();
  };

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
              initial={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ delay: 1, duration: 4.9, ease: [0.76, 0, 0.24, 1] }}
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
              animate={{ y: '0%' }}
              transition={{ delay: 0.7, duration: 3.2, ease: [0.76, 0, 0.24, 1] }}
              className="relative z-10 bg-gray-900"
            >
              <HeroSection animateStart={startAnimation} />

              <section>
                {loading && (
                  <div className="flex justify-center items-center py-20">
                    <LoadingSpinner />
                    <p className="text-white mr-4">جاري تحميل التصاميم...</p>
                  </div>
                )}
                {error && (
                  <ErrorMessage message={error} onRetry={handleRetry} />
                )}
                {!loading && !error && <DesignsSection designs={designs} />}
              </section>

              <ServicesSection />
              <CaseStudiesSection />
              <ContactSection />
              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>
    </main>
  );
}
