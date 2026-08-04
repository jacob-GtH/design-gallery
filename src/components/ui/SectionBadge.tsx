"use client";

import React from "react";
import { motion } from "framer-motion";

interface SectionBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-6 ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
      <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-indigo-400 uppercase">
        {children}
      </span>
    </motion.div>
  );
};
