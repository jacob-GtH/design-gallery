"use client";

import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { SectionHeader } from "../ui/SectionHeader";
import { useTranslation } from "react-i18next";

export default function ContactSection() {
  const { t } = useTranslation();
  return (
    <section
      id="contact"
      className="relative w-full py-32 md:py-48 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Grid */}
        
        {/* Deep Aura Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] rounded-full transition-colors duration-500" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 dark:bg-indigo-600/10 blur-[100px] rounded-full transition-colors duration-500" />
      </div>

      {/* Floating Frosted Glass Orbs */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
          className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/10 dark:from-purple-500/20 to-transparent backdrop-blur-3xl border border-gray-200 dark:border-white/5 z-0 transition-colors duration-500"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            rotate: [0, -120, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 right-[15%] w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-500/10 dark:from-indigo-500/15 to-transparent backdrop-blur-2xl border border-gray-200 dark:border-white/5 z-0 transition-colors duration-500"
        />

      <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        <SectionHeader
          align="center"
          badge={t("cta.badge")}
          title={t("cta.title")}
          gradientTitle={t("cta.gradientTitle")}
          description={t("cta.description")}
          className="mb-12"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >

          {/* Primary Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-4 px-10 py-5 bg-indigo-950 dark:bg-white text-white dark:text-black rounded-2xl font-extrabold text-xl hover:bg-gray-800 dark:hover:bg-purple-50 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_60px_rgba(168,85,247,0.2)]"
            >
              {t("cta.contactNow")}
              <span className="w-8 h-8 rounded-full bg-white dark:bg-black text-black dark:text-white flex items-center justify-center group-hover:translate-x-[-4px] transition-transform duration-300">
                <FiArrowLeft className="rotate-180" />
              </span>
            </Link>
          </motion.div>

          {/* Quick Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.9  }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 text-sm text-indigo-500 dark:text-indigo-500 uppercase tracking-widest"
          >
            {t("cta.responseTime")}
          </motion.div>
        </motion.div>
      </div>

      {/* Background Decorative Text */}
      <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 opacity-[0.05] dark:opacity-[0.02] text-[12vw] font-black text-black dark:text-white select-none pointer-events-none whitespace-nowrap uppercase tracking-tighter transition-colors duration-500">
        {t("contact.getInTouch")}
      </div>
    </section>
  );
}
