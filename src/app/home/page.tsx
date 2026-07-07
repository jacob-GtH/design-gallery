"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import HeroSection from "@/components/sections/HeroSection";
import CaseStudiesSection from "@/components/sections/CaseStudiesSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ContactSection from "@/components/sections/ContactSection";
import DesignsSection from "@/components/sections/DesignsSection";
import ErrorMessage from "@/components/common/ErrorMessage";
import { IDesign } from "@/interfaces/Design";
import Loading from "@/components/common/loading";

export default function HomeSection({
  animateStart,
}: {
  animateStart: boolean;
}) {
  const [designs, setDesigns] = useState<IDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/designs");
      if (!response.ok) {
        throw new Error("فشل تحميل التصاميم");
      }
      const data: IDesign[] = await response.json();
      setDesigns(data);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
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
  return (
    <main className="min-h-screen overflow-hidden relative">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loading />
          </div>
        }
      >
        {/* الشاشة الرئيسية */}

        <HeroSection animateStart={animateStart} />

        <section>
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loading />
            </div>
          )}
          {error && <ErrorMessage message={error} onRetry={handleRetry} />}
          {!loading && !error && <DesignsSection designs={designs} />}
        </section>

        <ServicesSection />
        <CaseStudiesSection />
        <ContactSection />
      </Suspense>
    </main>
  );
}
