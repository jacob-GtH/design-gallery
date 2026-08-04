"use client";

import React from "react";
import { motion } from "framer-motion";
import { SectionBadge } from "./SectionBadge";

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
  align = "right",
  className = "",
}) => {
  const alignmentClasses = {
    right: "text-right items-end ml-auto",
    center: "text-center items-center mx-auto",
    left: "text-left items-start mr-auto",
  };

  return (
    <div className={`flex flex-col max-w-4xl mb-16 ${alignmentClasses[align]} ${className}`}>
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
