// app/loading.tsx
import Image from "next/image";

export default function Loading() {
  return (
    <div className="loading-wrapper">
      <div className="loading-screen">
        <div className="logo-container">
          <Image
            src="/motto-flag-white.webp"
            alt="Logo"
            width={100}
            height={100}
            className="object-contain"
            unoptimized
            priority
          />
        </div>
      </div>
    </div>
  );
}
