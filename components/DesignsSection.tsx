"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DesignCard from "./designs/DesignCard";
import { IDesign } from "../interfaces/Design";

export default function DesignsSection({ designs }: { designs: IDesign[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const infiniteDesigns = [...designs, ...designs, ...designs]; // ✅ للتكرار

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const third = container.scrollWidth / 3;
    container.scrollLeft = third;

    const interval = setInterval(() => {
      container.scrollBy({ left: container.offsetWidth, behavior: "smooth" });
    }, 4000);

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      if (scrollLeft <= 1) container.scrollLeft = third;
      if (scrollLeft >= third * 2 - 1) container.scrollLeft = third;
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="relative h-screen py-24 bg-gradient-to-tr from-purple-900/40 to-black">
      <div className="relative">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          viewport={{ amount: 0.5 }}
        >
          أحدث التصاميم
        </motion.h2>
      </div>

      <div className="overflow-x-auto px-8 h-full">
        <div ref={scrollRef} className="flex gap-10  ">
          {infiniteDesigns.map((design, index) => (
            <motion.div
              key={`${design.id}-${index}`}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              viewport={{ amount: 0.5 }}
              className="w-[900px] flex-shrink-0"
            >
              <DesignCard design={design} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
