//  // components/designs/DesignCard.tsx
"use client";

import { motion } from "framer-motion";
import { IDesign } from "../../interfaces/Design";
import Link from "next/link";

export default function DesignCard({ design }: { design: IDesign }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <Link href={`/designs/${design.id}`}>
        <div className="relative h-64">
          {design.mediaType === "image" ? (
            <img
              src={design.mediaUrl}
              alt={design.title}
              className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <video
              src={design.mediaUrl}
              className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
              autoPlay
              loop
              muted
            />
          )}
        </div>

        <div className="p-5">
          <h3 className="font-bold text-xl mb-2">{design.title}</h3>
          {design.designer && (
            <p className="text-gray-600 mb-3">بواسطة {design.designer}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(design.tags) &&
              design.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">
              {design.publishedAt &&
                new Date(design.publishedAt).toLocaleDateString("ar-SA")}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-gray-800">❤️</span>
              <span>{design.likes}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
