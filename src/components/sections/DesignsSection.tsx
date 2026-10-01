"use client";

import { motion } from "framer-motion";
import { IDesign } from "@/interfaces/Design";
import DesignCarousel from "@/components/designs/subcomponents/DesignCarousel";
import { useTranslation } from "react-i18next";

interface DesignsSectionProps {
  designs: IDesign[];
}

export default function DesignsSection({ designs }: DesignsSectionProps) {
  const { t } = useTranslation();
  if (!designs || designs.length === 0) {
    return (
      <section className="relative h-[60vh] flex items-center justify-center bg-white dark:bg-[#050505] overflow-hidden transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <h3 className="text-black dark:text-white text-2xl font-bold mb-2">{t("designs.noDesigns")}</h3>
          <p className="text-gray-600 dark:text-gray-500 max-w-xs mx-auto">{t("designs.noDesignsDesc")}</p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen py-24 bg-white dark:bg-[#050505] transition-colors duration-500">
      {/* Background Decorative Elements */}

      <div className="relative z-10 container mx-auto px-6 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white leading-tight">
            {t("designs.latest")} <span className="text-transparent bg-clip-text bg-hero-gradient">{t("designs.designsWord")}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("designs.description")}
          </p>
        </motion.div>
      </div>

      <div className="relative z-10">
        <DesignCarousel designs={designs} />
      </div>
    </section>
  );
}
