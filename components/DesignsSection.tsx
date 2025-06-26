//components/DesignsSection.tsx
"use client";

import { motion } from "framer-motion";
import DesignCard from "./designs/DesignCard";
import { IDesign } from "../interfaces/Design";
import Link from "next/dist/client/link";

export default function DesignsSection({ designs }: { designs: IDesign[] }) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-tr from-purple-900/40 to-black dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        {/* العنوان */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          viewport={{ amount: 0.5 }} // ✅ تتكرر الحركة عند دخول جزء من العنصر في الشاشة
        >
          أحدث التصاميم
        </motion.h2>

        {/* شبكة البطاقات */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible" // ✅ الحركة تتكرر عند دخول القسم مجددًا
          viewport={{ amount: 0.3 }} // لا نضع once:true لكي تتكرر
        >
          {designs.map((design) => (
            <motion.div
              key={design.id}
              variants={cardVariants}
              whileHover={{
                scale: 1.03,
                transition: { type: "spring", stiffness: 200 },
              }}
            >
              <DesignCard design={design} />
            </motion.div>
          ))}
        </motion.div>
        <AnimatedLink />
      </div>
    </section>
  );
}

function AnimatedLink() {
  return (
    <Link href="/designs" className="relative text-blue-600 inline-block">
      شاهد التصاميم
      <motion.span
        className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
    </Link>
  );
}
