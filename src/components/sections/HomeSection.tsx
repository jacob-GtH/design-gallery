"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import HeroSection from "@/components/sections/HeroSection";
import CaseStudiesSection from "@/components/sections/CaseStudiesSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ContactSection from "@/components/sections/ContactSection";
import DesignsSection from "@/components/sections/DesignsSection";
import ErrorMessage from "@/components/common/ErrorMessage";
import { IDesign } from "@/interfaces/Design";
import Loading from "@/components/common/loading";

export default function HomeSection({
  animateStart = true,
}: {
  animateStart?: boolean;
}) {
  const [designs, setDesigns] = useState<IDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // مراقبة تقدم التمرير لشريط التقدم العلوي
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/designs");
      if (!response.ok) {
        throw new Error("فشل تحميل التصاميم");
      }
      const data: IDesign[] = await response.json();
      setDesigns(data);
    } catch (err: unknown) {
      setError((err as Error).message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleRetry = () => {
    fetchDesigns();
  };

  // إعدادات أنميشن ظهور الأقسام عند التمرير
  const revealVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] as const }
    }
  };

  return (
    <main className="min-h-screen overflow-hidden relative bg-white dark:bg-[#050505] transition-colors duration-500">
      {/* شريط تقدم التمرير العلوي الفاخر */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-[0%] z-[9999]"
        style={{ scaleX }}
      />

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loading />
          </div>
        }
      >
        {/* الشاشة الرئيسية */}
        <HeroSection animateStart={animateStart} />

        {/* قسم أحدث التصاميم مع أنميشن ظهور سلس */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={revealVariants}
        >
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loading />
            </div>
          )}
          {error && <ErrorMessage message={error} onRetry={handleRetry} />}
          {!loading && !error && <DesignsSection designs={designs} />}
        </motion.section>

        {/* قسم الخدمات مع أنميشن ظهور سلس */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={revealVariants}
        >
          <ServicesSection />
        </motion.div>

        {/* قسم دراسات الحالة مع أنميشن ظهور سلس */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={revealVariants}
        >
          <CaseStudiesSection />
        </motion.div>

        {/* قسم التواصل مع أنميشن ظهور سلس */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={revealVariants}
        >
          <ContactSection />
        </motion.div>
      </Suspense>
    </main>
  );
}
