"use client";

import React from "react";
import { motion } from "framer-motion";
import { SectionBadge } from "./SectionBadge";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  gradientTitle?: string;
  description?: string;
  align?: "right" | "center" | "left";
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  gradientTitle,
  description,
  align,
  className = "",
}) => {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // إصلاح Hydration: قبل التركيب، نستخدم نفس قيمة SSR (isRTL = false)
  const isRTL = mounted && i18n.language?.startsWith("ar");

  // If align is not explicitly set, use language direction
  const effectiveAlign = align || (isRTL ? "right" : "left");

  const alignmentClasses = {
    right: "text-start items-start",
    center: "text-center items-center mx-auto",
    left: "text-start items-start",
  };

  const finalAlign = effectiveAlign === "center" ? "center" : (isRTL ? "right" : "left");

  return (
    <div className={`flex flex-col max-w-4xl mb-16 ${alignmentClasses[finalAlign]} ${className}`}>
      {badge && <SectionBadge>{badge}</SectionBadge>}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
        className="text-4xl md:text-6xl font-black text-black dark:text-white leading-[1.1] mb-6 transition-colors duration-500"
      >
        {title} {gradientTitle && <br />}
        {gradientTitle && (
          <span className="text-transparent bg-clip-text bg-hero-gradient">
            {gradientTitle}
          </span>
        )}
      </motion.h2>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl transition-colors duration-500"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};