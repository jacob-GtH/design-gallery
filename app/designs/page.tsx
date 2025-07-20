// app/designs/page.tsx
import { IDesign } from "@/interfaces/Design";
import Link from "next/link";
import Image from "next/image";
import CustomCursor from "@/components/ui/CustomCursor";

export default async function DesignsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/designs`, {
    cache: "no-store",
  });
  const designs: IDesign[] = await res.json();

  return (
    <main className="min-h-screen  text-white ">
      <CustomCursor />

      <div className="max-w-[1900px] mx-auto px-4 py-12">
        <div className="text-center items-center justify-center py-20 min-h-96">
          <h1 className="text-4xl font-bold mb-4">معرض التصاميم</h1>
          <p className="text-gray-400 mb-12">
            استعرض أعمال المصممين بتنسيق بصري جذّاب.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
          {designs.map((design) => (
            <Link href={`/designs/${design.id}`} key={design.id}>
              <div className="group relative overflow-hidden rounded-lg shadow-lg hover-target cursor-pointer transform transition duration-700 hover:scale-[1.01] opacity-0 animate-fade-in">
                <div className="relative w-full h-[40vh] md:h-[80vh]">
                  {design.media[0]?.type === "image" ? (
                    <Image
                      src={design.media[0]?.url}
                      alt={design.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={design.media[0]?.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <h2 className="text-3xl font-bold mb-2">{design.title}</h2>
                  <p className="text-gray-300 text-sm line-clamp-2">
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
