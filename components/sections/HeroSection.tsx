import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export default function HeroSection({
  animateStart,
}: {
  animateStart: boolean;
}) {
  return (
    <motion.section
      className="relative h-screen text-white overflow-hidden"
      initial={{ y: "100%" }}
      animate={animateStart ? { y: 0 } : {}} // يبدأ فقط إذا وصلت الإشارة من splash
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      <div className="relative z-0 flex flex-col justify-center items-center h-full text-center px-6">
        <motion.h1
          className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={animateStart ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          معرض التصاميم الإبداعية
        </motion.h1>

        <motion.p
          className="text-lg md:text-2xl text-gray-300 max-w-2xl"
          initial={{ y: 30, opacity: 0 }}
          animate={animateStart ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 1 }}
        >
          اكتشف أعمال المصممين الموهوبين من العالم العربي.
        </motion.p>

        <motion.div
          className="flex gap-4 mt-8"
          initial={{ opacity: 0 }}
          animate={animateStart ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <Button variant="primary" className="text-lg px-6 py-3">
            ابدأ التصفح
          </Button>
          <Button variant="outline" className="text-lg px-6 py-3">
            انضم كمصمم
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
