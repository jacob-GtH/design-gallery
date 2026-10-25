"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IDesign } from "@/interfaces/Design";
import { DesignFormViewMode } from "./Types";
import DesignFormCore from "./DesignFormCore";

export default function DesignFormPage({
  mode,
  initialData,
  onSuccess,
  onClose,
}: {
  mode: DesignFormViewMode;
  initialData?: IDesign;
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation();

  const modeTitle =
    mode === "create"
      ? t("admin.createMode")
      : mode === "edit"
      ? t("admin.editMode")
      : t("admin.viewMode");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-white/95 dark:bg-[#080808]/95 backdrop-blur-2xl overflow-hidden transition-colors duration-500"
      >
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-1/3 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-10 left-1/4 w-[400px] h-[300px] bg-purple-500/10 dark:bg-purple-500/15 blur-[140px] pointer-events-none rounded-full" />

        {/* Top Header Bar */}
        <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {modeTitle}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {mode === "create"
                  ? t("admin.dashboardDescription")
                  : initialData?.title || ""}
              </p>
            </div>
          </div>

          {/* Close Button */}
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-colors duration-200 shadow-sm"
              title={t("admin.close")}
              aria-label={t("admin.close")}
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </header>

        {/* Modal Scrollable Body */}
        <div className="relative flex-1 overflow-y-auto">
          <DesignFormCore
            mode={mode}
            initialData={initialData}
            onSuccess={onSuccess}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
