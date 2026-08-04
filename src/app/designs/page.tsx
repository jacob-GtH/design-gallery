// src/app/designs/page.tsx
import { IDesign } from "@/interfaces/Design";
import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default async function DesignsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/designs`, {
    cache: "no-store",
  });
  const designs: IDesign[] = await res.json();

  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white relative overflow-hidden transition-colors duration-500">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/3 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/3 dark:bg-purple-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />

      <div className="max-w-[1900px] mx-auto px-6 py-20 relative z-10">
        
        {/* SectionHeader الموحد الفاخر */}
        <SectionHeader
          align="center"
          badge="معرض التصاميم"
          title="استكشف الإبداع"
          gradientTitle="بكامل تفاصيله"
          description="تصفح أعمالنا الاستثنائية التي تم تصميمها وتطويرها بشغف كامل واحترافية فائقة."
          className="mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {designs.map((design) => (
            <Link href={`/designs/${design.id}`} key={design.id} className="block group hover-target">
              <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-900/20 backdrop-blur-md shadow-2xl transition-all duration-700 hover:border-indigo-500/30 transform hover:scale-[1.01] transition-colors duration-500">
                
                {/* Media Container with Zoom Hover Effect */}
                <div className="relative w-full h-[45vh] md:h-[70vh] overflow-hidden">
                  {design.media[0]?.type === "image" ? (
                    <Image
                      src={design.media[0]?.url}
                      alt={design.title}
                      fill
                      unoptimized
                      className="object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                  ) : (
                    <video
                      src={design.media[0]?.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                  )}
                  
                  {/* Premium Hover Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-100/90 dark:from-gray-950 via-gray-100/20 dark:via-gray-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 transition-colors duration-500" />
                </div>

                {/* Info Overlay (Always visible but enhances on hover) */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-right flex flex-col justify-end">
                  <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3 block transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 transition-colors duration-500">
                    أعمال مختارة
                  </span>
                  <h2 className="text-2xl md:text-3.5xl font-black text-black dark:text-white leading-tight mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-500">
                    {design.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-400 text-sm md:text-base leading-relaxed line-clamp-2 max-w-2xl mr-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 transition-colors duration-500">
                    {design.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
