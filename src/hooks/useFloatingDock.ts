import { useState, useCallback, useEffect, useRef } from "react";

export interface App {
  name: string;
  icon: React.ReactNode;
  color?: string;
  action?: () => void;
  badge?: number;
  isActive?: boolean;
}

interface UseDockConfig {
  apps: App[];
  autoHide?: boolean;
  position?: "bottom" | "top" | "left" | "right";
  hideOnScroll?: boolean;
  scrollThreshold?: number;
}

export function useFloatingDock({
  apps: initialApps,
  autoHide = true,
  position = "bottom",
  hideOnScroll = true,
  scrollThreshold = 50,
}: UseDockConfig) {
  const [apps, setApps] = useState<App[]>(initialApps);
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // إخفاء/إظهار عند التمرير
  const handleScroll = useCallback(() => {
    if (!autoHide || !hideOnScroll) return;

    const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY;

    if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
      setIsVisible(!isScrollingDown || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    }
  }, [lastScrollY, autoHide, hideOnScroll, scrollThreshold]);

  useEffect(() => {
    if (autoHide && hideOnScroll) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, autoHide, hideOnScroll]);

  // إدارة التطبيقات
  const updateApp = useCallback((index: number, updates: Partial<App>) => {
    setApps((prev) =>
      prev.map((app, i) => (i === index ? { ...app, ...updates } : app))
    );
  }, []);

  const addApp = useCallback((app: App, index?: number) => {
    setApps((prev) => {
      if (index !== undefined) {
        const newApps = [...prev];
        newApps.splice(index, 0, app);
        return newApps;
      }
      return [...prev, app];
    });
  }, []);

  const removeApp = useCallback((index: number) => {
    setApps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setBadge = useCallback(
    (index: number, badge: number) => {
      updateApp(index, { badge });
    },
    [updateApp]
  );

  const setActiveApp = useCallback((index: number) => {
    setApps((prev) =>
      prev.map((app, i) => ({
        ...app,
        isActive: i === index,
      }))
    );
  }, []);

  const clearActiveBadges = useCallback(() => {
    setApps((prev) =>
      prev.map((app) => ({
        ...app,
        isActive: false,
      }))
    );
  }, []);

  // رؤية dock
  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible((prev) => !prev), []);
  const setHovered = useCallback((index: number | null) => {
    setHoveredIndex(index);
  }, []);

  return {
    // الحالة
    apps,
    isVisible,
    hoveredIndex,
    isDragging,

    // دوال
    updateApp,
    addApp,
    removeApp,
    setBadge,
    setActiveApp,
    clearActiveBadges,
    setApps,

    // رؤية
    show,
    hide,
    toggle,
    setHovered,
    setIsDragging,

    // معلومات إضافية
    appCount: apps.length,
    hasActiveBadges: apps.some((app) => app.badge && app.badge > 0),
    activeAppIndex: apps.findIndex((app) => app.isActive),
  };
}

// اختصارات لوحة المفاتيح
export function useDockKeyboardShortcuts(
  apps: App[],
  onAppActivate: (index: number) => void
) {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < apps.length) {
          onAppActivate(index);
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [apps, onAppActivate]);
}

// التخزين المحلي
export function useDockPersistence(
  apps: App[],
  setApps: (apps: App[]) => void,
  storageKey = "floating-dock-state"
) {
  const saveState = useCallback(() => {
    const state = {
      apps: apps.map((app) => ({
        name: app.name,
        badge: app.badge,
        isActive: app.isActive,
      })),
      timestamp: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [apps, storageKey]);

  const loadState = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        const merged = apps.map((app, index) => ({
          ...app,
          ...state.apps[index],
          icon: app.icon,
          action: app.action,
        }));
        setApps(merged);
      }
    } catch (error) {
      console.error("Error loading dock state:", error);
    }
  }, [storageKey, setApps]);

  useEffect(() => {
    saveState();
  }, [apps, saveState]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  return { saveState, loadState };
}
