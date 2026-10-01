"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";

export default function FloatingAddButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // نبضة واحدة فقط عند الظهور، ثم تتوقف
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ scale: 0 }}
      animate={
        showPulse
          ? { scale: [0, 1.2, 1] }
          : { scale: isHovered ? 1.15 : 1 }
      }
      transition={
        showPulse
          ? { duration: 0.6, ease: "easeOut" }
          : { duration: 0.2, ease: "easeInOut" }
      }
      whileTap={{ scale: 0.95 }}
      className="fixed right-8 bottom-8 sm:right-12 sm:bottom-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-shadow items-center justify-center z-50"
      aria-label="إضافة تصميم جديد"
      title="إضافة تصميم جديد"
    >
      <PlusCircle size={28} />
    </motion.button>
  );
}
