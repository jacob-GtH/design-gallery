import { motion } from "framer-motion";
import Image from "next/image";
import { SectionHeader } from "../ui/SectionHeader";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const CheckIcon = () => (
  <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

export default function SectionCaseStudies() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // إصلاح Hydration: قبل التركيب، نستخدم نفس قيمة SSR (isRTL = false)
  const isRTL = mounted && i18n.language?.startsWith("ar");

  const caseStudies = [
    {
      id: 1,
      titleKey: "caseStudies.items.0.title",
      categoryKey: "caseStudies.items.0.category",
      descriptionKey: "caseStudies.items.0.description",
      imageUrl: "/images/bgHome.png",
      resultsKeys: ["caseStudies.items.0.results.0", "caseStudies.items.0.results.1", "caseStudies.items.0.results.2"],
      accentColor: "indigo"
    },
    {
      id: 2,
      titleKey: "caseStudies.items.1.title",
      categoryKey: "caseStudies.items.1.category",
      descriptionKey: "caseStudies.items.1.description",
      imageUrl: "/images/bgHome.png",
      resultsKeys: ["caseStudies.items.1.results.0", "caseStudies.items.1.results.1", "caseStudies.items.1.results.2"],
      accentColor: "purple"
    },
    {
      id: 3,
      titleKey: "caseStudies.items.2.title",
      categoryKey: "caseStudies.items.2.category",
      descriptionKey: "caseStudies.items.2.description",
      imageUrl: "/images/bgHome.png",
      resultsKeys: ["caseStudies.items.2.results.0", "caseStudies.items.2.results.1", "caseStudies.items.2.results.2"],
      accentColor: "emerald"
    },
  ];

  return (
    <section
      id="case-studies"
      className="relative w-full flex flex-col items-center px-6 md:px-12 py-20 space-y-32 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500"
    >
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/3 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-500/3 dark:bg-purple-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />

      {/* Section Header */}
      <SectionHeader
        align="center"
        badge={t("caseStudies.badge")}
        title={t("caseStudies.title")}
        gradientTitle={t("caseStudies.gradientTitle")}
        description={t("caseStudies.description")}
      />
      
      {caseStudies.map((study, index) => (
        <div
          key={study.id}
          className={`relative z-10 w-full max-w-7xl flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12 lg:gap-20`}
        >
          {/* Image Container with Parallax Effect */}
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="w-full md:w-3/5 group"
          >
            <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl transition-colors duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              
              <Image
                src={study.imageUrl}
                alt={t(study.titleKey)}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              
              {/* Overlay Badge on Image */}
              <div className={`absolute bottom-8 z-20 flex items-center gap-4 ${isRTL ? "right-8" : "left-8"}`}>
                <div className="px-6 py-3 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl transition-colors duration-500">
                  <span className="text-white dark:text-white font-semibold text-lg">{t("caseStudies.viewProject")}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Container - Dynamic alignment based on language */}
          <div className={`w-full md:w-2/5 flex flex-col ${isRTL ? "text-right items-end" : "text-left items-start"} space-y-8`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest transition-colors duration-500">
                {t(study.categoryKey)}
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white leading-tight transition-colors duration-500">
                {t(study.titleKey)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed transition-colors duration-500">
                {t(study.descriptionKey)}
              </p>
            </motion.div>

            {/* Results Grid */}
            <div className="w-full space-y-4 pt-8 border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">{t("caseStudies.results")}</h4>
              <div className="space-y-4">
                {study.resultsKeys.map((resultKey, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                    className={`flex items-center gap-4 ${isRTL ? "justify-start" : "justify-start"} group/item`}
                  >
                    {isRTL ? (
                      <>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 flex items-center justify-center group-hover/item:bg-indigo-500/20 transition-all duration-300">
                          <CheckIcon />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 group-hover/item:text-black dark:group-hover/item:text-white transition-colors duration-300 text-lg font-medium">{t(resultKey)}</span>
                      </>
                    ) : (
                      <>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 flex items-center justify-center group-hover/item:bg-indigo-500/20 transition-all duration-300">
                          <CheckIcon />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 group-hover/item:text-black dark:group-hover/item:text-white transition-colors duration-300 text-lg font-medium">{t(resultKey)}</span>

                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* View More Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 flex items-center gap-3 text-black dark:text-white font-bold group transition-colors duration-500"
            >
              {isRTL ? (
                <>
                  {t("caseStudies.viewDetails")}
                  <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </>
              ) : (
                <>
                {t("caseStudies.viewDetails")}
                  <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-300">
                    <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  
                </>
              )}
            </motion.button>
          </div>
        </div>
      ))}

      {/* Bottom CTA for Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="pt-20 text-center"
      >
        <button className="px-10 py-5 bg-indigo-950 dark:bg-white text-white dark:text-black font-extrabold rounded-2xl hover:bg-indigo-800 dark:hover:bg-gray-200 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
          {t("caseStudies.browseAll")}
        </button>
      </motion.div>
    </section>
  );
}