// src/components/designs/LazyVideo.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  className?: string;
};

/**
 * فيديو لا يُحمَّل ولا يعمل إلا عند ظهوره في الشاشة:
 * - قبل الظهور: صورة الغلاف فقط (بلا طلب للفيديو).
 * - عند الظهور: يبدأ التحميل والتشغيل (صامت، متكرر).
 * - عند الخروج: يتوقف.
 * - من يفضّل تقليل الحركة: لا تشغيل تلقائي، وتظهر أزرار التحكم.
 */
export default function LazyVideo({ src, poster, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true); // أول ظهور: يُضبط src مع autoPlay
          if (el.src) el.play().catch(() => {}); // الظهور التالي: استئناف
        } else {
          el.pause();
        }
      },
      { threshold: 0.4, rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={active ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      autoPlay={active && !reduceMotion}
      controls={reduceMotion}
      className={className}
    />
  );
}
