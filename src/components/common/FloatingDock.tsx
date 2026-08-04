"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFloatingDock, useDockKeyboardShortcuts, useDockPersistence } from "@/hooks/useFloatingDock";
import { defaultApps } from "@/lib/defaultApps";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function FloatingDock() {
  const [hoveredApp, setHoveredApp] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    apps,
    isVisible,
    setActiveApp,
    setApps,
  } = useFloatingDock({
    apps: defaultApps,
    autoHide: true,
    hideOnScroll: true,
  });

  useDockKeyboardShortcuts(apps, setActiveApp);
  useDockPersistence(apps, setApps, "floating-dock");

  const getScale = (index: number) => {
    if (hoveredApp === null) return 1;
    const distance = Math.abs(index - hoveredApp);
    if (distance === 0) return 1.4; // المركزية أكبر
    if (distance === 1) return 1.2; // المجاورة أقل
    if (distance === 2) return 1.1; // التي تليها أقل
    return 1;
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) return null;

  // إضافة زر السمة إلى قائمة التطبيقات ديناميكياً
  const appsWithTheme = [
    ...apps,
    {
      name: theme === "dark" ? "وضع النهار" : "وضع الليل",
      icon: theme === "dark" ? <Sun size={24} className="text-amber-400" /> : <Moon size={24} className="text-indigo-400" />,
      color: theme === "dark" ? "#fbbf24" : "#818cf8",
      action: toggleTheme,
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:top-4 md:left-1/2 md:-translate-x-1/2 z-[999]"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
            <div className="flex flex-row md:flex-row gap-3 items-center bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/20 relative transition-colors duration-500">
              {appsWithTheme.map((app, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    if (app.action) {
                        app.action();
                    }
                    if (index < apps.length) {
                        setActiveApp(index);
                    }
                  }}
                  className={`relative p-3 rounded-xl text-black dark:text-white transition-all duration-300 transform-gpu focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  onMouseEnter={() => setHoveredApp(index)}
                  onMouseLeave={() => setHoveredApp(null)}
                  animate={{
                    scale: getScale(index),
                    y: hoveredApp === index ? -0 : 0, // رفع الأيقونة قليلاً عند التركيز
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
                  style={{ zIndex: hoveredApp === index ? 100 : 10 }}
                >
                  {/* Tooltip */}
                  {hoveredApp === index && ( 
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: -40 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.2 }}
                      className="absolute top-1/2 -translate-y-1/2 -left-24 px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-black dark:text-white text-xs rounded-md shadow-lg whitespace-nowrap transition-colors duration-500"
                    >
                      {app.name}
                    </motion.div>
                  )}

                  {app.icon}

                  {"isActive" in app && app.isActive && (
                    <motion.div
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.7)] animate-pulse"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }} // حركة نبضية تختفي وتظهر
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {"badge" in app && app.badge && app.badge > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-white/10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {app.badge > 99 ? "99+" : app.badge}
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
