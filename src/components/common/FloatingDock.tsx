"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFloatingDock, useDockKeyboardShortcuts, useDockPersistence } from "@/hooks/useFloatingDock";
import { defaultApps } from "@/lib/defaultApps";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export default function FloatingDock() {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const router = useRouter();
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

  useEffect(() => setMounted(true), []);

  useDockKeyboardShortcuts(apps, setActiveApp);
  useDockPersistence(apps, setApps, "floating-dock");

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language?.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
    router.refresh();
  };

  // إضافة زر السمة وزر اللغة إلى قائمة التطبيقات ديناميكياً
  const appsWithTheme = [
    ...apps,
    {
      name: i18n.language?.startsWith("ar") ? "English" : "العربية",
      icon: <Globe size={24} />,
      color: "#10B981",
      action: toggleLanguage,
    },
    {
      name: theme === "dark" ? "وضع النهار" : "وضع الليل",
      icon: theme === "dark" ? <Sun size={24} /> : <Moon size={24} />,
      color: theme === "dark" ? "#fbbf24" : "#818cf8",
      action: toggleTheme,
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed left-1/2 -translate-x-1/2 z-[999] bottom-4 md:bottom-auto md:top-6"
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <div dir="ltr" className="flex flex-row gap-2 md:gap-4 items-center bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-full p-2 shadow-2xl relative transition-all duration-500">
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
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  aria-label={t(app.name)}
                  title={t(app.name)}
                  className={`relative p-3 rounded-full transition-all duration-300 transform-gpu focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center group`}
                  whileHover={{ 
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div 
                    className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 transition-colors duration-300"
                    style={{ 
                        color: hoveredIndex === index ? (app.color || '#6366f1') : (theme === 'dark' ? 'white' : 'black') 
                    }}
                    animate={{
                        filter: hoveredIndex === index ? `drop-shadow(0 0 8px ${app.color || '#6366f1'})` : 'none',
                        scale: hoveredIndex === index ? 1.15 : 1
                    }}
                  >
                    {app.icon}
                  </motion.div>

                  {"isActive" in app && app.isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"
                      layoutId="active-indicator"
                    />
                  )}

                  {"badge" in app && app.badge && app.badge > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border-2 border-white/20"
                    >
                      {app.badge > 99 ? "9" : app.badge}
                    </motion.div>
                  )}
                  
                  {/* Tooltip */}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap" style={{ color: app.color || '#6366f1' }}>
                    {t(app.name)}
                  </span>
                </motion.button>
              ))}
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
