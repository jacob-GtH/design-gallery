"use client";

import { motion } from "framer-motion";
import { IDesign } from "@/interfaces/Design";
import DesignCarousel from "@/components/designs/subcomponents/DesignCarousel";

interface DesignsSectionProps {
  designs: IDesign[];
}

export default function DesignsSection({ designs }: DesignsSectionProps) {
  if (!designs || designs.length === 0) {
    return (
      <section className="relative h-screen py-24 bg-gradient-to-tr from-purple-900/40 to-black">
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-xl">لا توجد تصاميم لعرضها</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen py-4 ">
      <div className="relative mb-16">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          viewport={{ amount: 0.5 }}
        >
          أحدث التصاميم
        </motion.h2>
      </div>
      <DesignCarousel designs={designs} />
    </section>
  );
}
