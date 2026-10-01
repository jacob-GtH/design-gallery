"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";
import { useTranslation } from "react-i18next";

const services = [
  {
    id: "web",
    titleKey: "services.items.web.title",
    contentKey: "services.items.web.content",
    tagsKeys: ["services.items.web.tags.0", "services.items.web.tags.1", "services.items.web.tags.2"],
  },
  {
    id: "branding",
    titleKey: "services.items.branding.title",
    contentKey: "services.items.branding.content",
    tagsKeys: ["services.items.branding.tags.0", "services.items.branding.tags.1", "services.items.branding.tags.2"],
  },
  {
    id: "graphic",
    titleKey: "services.items.graphic.title",
    contentKey: "services.items.graphic.content",
    tagsKeys: ["services.items.graphic.tags.0", "services.items.graphic.tags.1", "services.items.graphic.tags.2"],
  },
  {
    id: "packaging",
    titleKey: "services.items.packaging.title",
    contentKey: "services.items.packaging.content",
    tagsKeys: ["services.items.packaging.tags.0", "services.items.packaging.tags.1", "services.items.packaging.tags.2"],
  },
  {
    id: "video",
    titleKey: "services.items.video.title",
    contentKey: "services.items.video.content",
    tagsKeys: ["services.items.video.tags.0", "services.items.video.tags.1", "services.items.video.tags.2"],
  },
];

const serviceIcons: Record<string, React.ReactNode> = {
  web: (
    <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  branding: (
    <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  ),
  graphic: (
    <svg className="w-12 h-12 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  packaging: (
    <svg className="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  video: (
    <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

export default function ServicesSection() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isRTL = mounted && i18n.language?.startsWith("ar");

  const handleServiceChange = (newIndex: number) => {
    if (newIndex === activeIndex) return;
    setActiveIndex(newIndex);
  };

  const getButtonClasses = (index: number) => {
    const baseClasses = "relative transition-all duration-300 cursor-pointer min-w-max md:min-w-0 flex items-center py-4 px-6 text-start rounded-xl select-none outline-none group overflow-hidden w-full";

    return index === activeIndex
      ? `${baseClasses} text-black dark:text-white`
      : `${baseClasses} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300`;
  };

  return (
    <section
      id="services"
      className="min-h-screen w-full flex flex-col items-center px-6 md:px-16 py-12 md:py-24 overflow-hidden relative bg-white dark:bg-[#050505] transition-colors duration-500"
    >
      {/* Dynamic Background Glow - Positioned safely with inset */}
      <div className="absolute top-1/4 start-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none -translate-x-1/2 rtl:translate-x-1/2" />
      <div className="absolute top-1/2 end-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none translate-x-1/2 rtl:-translate-x-1/2" />

      <div className="w-full max-w-7xl mx-auto relative z-10 mb-12">
        <SectionHeader
          align={isRTL ? "right" : "left"}
          badge={t("services.badge")}
          title={t("services.title")}
          gradientTitle={t("services.gradientTitle")}
        />
      </div>

      {/* Mobile Accordion */}
      <div className="md:hidden w-full flex flex-col gap-4 relative z-10 mb-8">
        {services.map((service, index) => (
          <div
            key={service.id}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              activeIndex === index 
                ? "bg-white/80 dark:bg-gray-800/50 border-indigo-500/30" 
                : "bg-white/30 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
            }`}
          >
            <button
              onClick={() => setActiveIndex(index)}
              className="w-full p-5 flex items-center justify-between text-start"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">0{index + 1}</span>
                <span className={`text-lg font-semibold ${activeIndex === index ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                  {t(service.titleKey)}
                </span>
              </div>
              <span className="text-indigo-500 font-bold">
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>
            
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5 pt-2"
                >
                  <div className="mb-4">
                     {serviceIcons[service.id]}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.tagsKeys.map((tagKey) => (
                      <span key={tagKey} className="px-3 py-1 rounded-full bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-900/10">
                        {t(tagKey)}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                    {t(service.contentKey)}
                  </p>

                  {/* Action Button */}
                  <div className="flex justify-start">
                    <button
                      className="inline-flex items-center gap-2 text-indigo-500 hover:text-white font-semibold group transition-all duration-300 px-5 py-2.5 rounded-xl bg-indigo-950/20 hover:bg-indigo-600 border border-indigo-400/60 hover:border-indigo-500 shadow-md text-sm"
                      aria-label={`${t("services.learnMore")} ${t(service.titleKey)}`}
                    >
                      {t("services.learnMore")}
                      <svg
                        className="w-4 h-4 rtl:rotate-180 transform transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="hidden md:flex flex-col md:flex-row w-full h-full max-w-7xl mx-auto md:gap-12 lg:gap-16 relative z-10">
        
        {/* Sidebar Titles */}
        <div className="w-full md:w-1/3 flex flex-row md:flex-col justify-start gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible pb-6 md:pb-0 scrollbar-none">
          {services.map((service, index) => (
            <button
              key={service.id}
              className={getButtonClasses(index)}
              onMouseEnter={() => handleServiceChange(index)}
              onClick={() => handleServiceChange(index)}
              aria-current={index === activeIndex ? "true" : "false"}
            >
              {/* Animated Background Selector using Logical Border */}
              {index === activeIndex && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-service-gradient border-s-4 border-indigo-500 rounded-xl"
                  transition={{ type: "spring", stiffness: 450, damping: 38 }}
                />
              )}

              <div className="flex flex-row items-center relative z-20 w-full">
                <span className={`py-1 text-2xl lg:text-3xl me-3 transition-colors duration-300 font-mono ${
                  index === activeIndex ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-600 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                }`}>
                  0{index + 1}
                </span>
                <span className={`py-2 text-xl lg:text-2xl 2xl:text-3xl font-semibold transition-all duration-300 text-start transform ${
                  index === activeIndex 
                    ? "text-black dark:text-white translate-x-2 rtl:-translate-x-2" 
                    : "text-gray-700 dark:text-gray-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 dark:group-hover:text-gray-200"
                }`}>
                  {t(service.titleKey)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full md:w-2/3 flex flex-col justify-center relative min-h-[420px]">
          {/* Static Glass Container */}
          <div className="bg-gray-100 dark:bg-gray-900/40 backdrop-blur-md p-8 md:p-14 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-500 w-full h-full">
            {/* Card Inner Glow Accent */}
            <div className="absolute top-0 end-0 w-[150px] h-[150px] bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl pointer-events-none rounded-full" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                className="relative z-10 w-full h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <h3 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-400 tracking-tight text-start">
                      {t(services[activeIndex].titleKey)}
                    </h3>

                    {/* Service Icon */}
                    <div className="p-3 bg-white dark:bg-gray-950/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner shrink-0 ms-auto">
                      {serviceIcons[services[activeIndex].id]}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {services[activeIndex].tagsKeys.map((tagKey) => (
                      <span
                        key={tagKey}
                        className="px-4 py-2 rounded-full text-indigo-700 dark:text-indigo-300 bg-indigo-950/30 border border-indigo-900/20 shadow-md backdrop-blur-sm text-sm font-medium hover:border-indigo-500 transition-colors duration-300"
                      >
                        {t(tagKey)}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl text-start">
                    {t(services[activeIndex].contentKey)}
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex justify-start">
                  <button
                    className="inline-flex items-center gap-3 text-indigo-500 hover:text-white font-semibold group transition-all duration-300 px-6 py-3 rounded-xl bg-indigo-950/20 hover:bg-indigo-600 border border-indigo-400/60 hover:border-indigo-500 shadow-lg"
                    aria-label={`${t("services.learnMore")} ${t(services[activeIndex].titleKey)}`}
                  >
                    {t("services.learnMore")}
                    <svg
                      className="w-5 h-5 rtl:rotate-180 transform transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}