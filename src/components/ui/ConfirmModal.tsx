// components/ui/ConfirmModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "تأكيد العملية",
  description = "هل أنت متأكد من المتابعة؟",
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center space-y-5"
          >
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">{description}</p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={onCancel}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/10 transition-all"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
