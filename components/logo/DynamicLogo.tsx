// components/ui/DynamicLogo.tsx
"use client";

import Image from "next/image";

export default function DynamicLogo() {
  return (
    <div
      className="fixed top-6 left-16 z-[9999] pointer-events-none select-none mix-blend-difference transition-all duration-500"
    >
      <Image
        src="/motto-flag-white.webp"
        alt="Logo"
        width={80}
        height={80}
        className="w-20 h-20 object-contain"
        priority
      />
    </div>
  );
}
