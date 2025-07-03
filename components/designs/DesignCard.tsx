"use client";

import { IDesign } from "@/interfaces/Design";
import Image from "next/image";
import Link from "next/link";
import { FiUser, FiUserCheck, FiUserMinus, FiUsers } from "react-icons/fi";

export default function DesignCardOverlay({ design }: { design: IDesign }) {
  return (
    <div className="relative h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-800 bg-black">
      {/* صورة التصميم */}
      {Array.isArray(design.media) && design.media[0].type === "image" ? (
        <Image
          src={design.media[0].url}
          alt={design.title}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <video
          src={design.media[0]?.url}
          muted
          loop
          playsInline
          autoPlay
          className="w-full h-full object-cover"
        />
      )}

      {/* التفاصيل فوق الصورة */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end">
        <h3 className="text-white text-xl font-bold">{design.title}</h3>
        <h3 className="text-gray-600/50 text-xl font-bold">
          {design.description}
        </h3>

        {design.designer && (
          <span className="flex items-center text-gray-300 text-sm gap-1">
            <FiUser />
            {typeof design.designer === "object" && design.designer !== null
              ? design.designer.name
              : "مصمم مجهول"}{" "}
          </span>
        )}
      </div>

      {/* رابط للعرض الكامل */}
      <Link href={`/designs/${design.id}`} className="absolute inset-0" />
    </div>
  );
}
