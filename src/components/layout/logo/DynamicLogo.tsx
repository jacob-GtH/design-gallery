// components/ui/DynamicLogo.tsx
"use client";

import Image from "next/image";

export default function DynamicLogo() {
  return (
    <div
      className="fixed top-4 left-3 md:top-6 md:left-16 z-[9999] pointer-events-none select-none mix-blend-difference transition-all duration-500"
    >
      <Image
        src="/motto-flag-white.webp"
        alt="Logo"
        width={80}
        height={80}
        className="w-12 md:w-20 h-10 md:h-20 object-contain"
        unoptimized
        priority
      />
    </div>
  );
}
