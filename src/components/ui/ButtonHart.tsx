import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function FloatingAddButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={() => {
        toast("إضافة", { description: "زر الإضافة العائم مفعّل" });
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={
        isHovered
          ? { scale: 1.5 } // عند التمرير لا يوجد نبض
          : { scale: [1, 1.18, 1] } // نبضة فقط
      }
      transition={{
        duration: 1,
        repeat: isHovered ? 0 : Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
      whileTap={{ scale: 0.95 }}
      className="fixed right-20 bottom-20 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:PlusCircle transition-colors items-center gap-2 z-50"
      
    >
      <PlusCircle size={24} />
    </motion.button>
  );
}
