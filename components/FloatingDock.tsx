'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useFloatingDock, useDockKeyboardShortcuts, useDockPersistence } from '@/hooks/useFloatingDock'; // تأكد من المسار الصحيح
import { defaultApps } from '@/lib/defaultApps';
export default function FloatingDock() {
  const {
    apps,
    isVisible,
    hoveredIndex,
    setHovered,
    setActiveApp,
    updateApp,
    setBadge,
  } = useFloatingDock({
    apps: defaultApps,
    autoHide: true,
    hideOnScroll: true,
  });

  useDockKeyboardShortcuts(apps, setActiveApp);
  useDockPersistence(apps, () => {}, 'floating-dock');

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.4;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.1;
    return 1;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex flex-row gap-6 items-center -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 px-4 shadow-2xl shadow-black/20 hover:bg-white/15 transition-all duration-300">
            {apps.map((app, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  app.action?.();
                  setActiveApp(index);
                }}
                className={`relative p-4 bg-white/5 hover:bg-white/20 rounded-2xl transition-all duration-300 text-white shadow-lg hover:shadow-xl`}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                animate={{
                  scale: getScale(index),
                  rotateY: hoveredIndex === index ? 10 : 0,
                }}
                whileHover={{
                  boxShadow: app.color
                    ? `0 0 20px ${app.color}40, 0 0 40px ${app.color}20`
                    : '0 10px 25px rgba(0,0,0,0.3)',
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background:
                    hoveredIndex === index && app.color
                      ? `linear-gradient(135deg, ${app.color}20, ${app.color}40)`
                      : undefined,
                  transformOrigin: 'bottom',
                }}
              >
                <motion.div
                  animate={{
                    rotate: hoveredIndex === index ? [0, -10, 10, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {app.icon}
                </motion.div>

                {app.isActive && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  />
                )}

                {app.badge && app.badge > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {app.badge > 99 ? '99+' : app.badge}
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
