import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const services = [
  {
    id: "web",
    title: "Web Design",
    content:
      "We specialize in building modern web experiences that represent your brand powerfully.",
    tags: ["Responsive", "UX/UI", "CMS"],
  },
  {
    id: "branding",
    title: "Branding",
    content:
      "Crafting strong, memorable brands that stand out in competitive markets.",
    tags: ["Logo Design", "Typography", "Guidelines"],
  },
  {
    id: "graphic",
    title: "Graphic Design",
    content:
      "From social media to print, we create compelling visuals that communicate.",
    tags: ["Social Media", "Posters", "Packaging"],
  },
  {
    id: "packaging",
    title: "Packaging",
    content:
      "Unique, functional packaging designs that speak to your customers.",
    tags: ["Custom Boxes", "Labels", "Retail"],
  },
  {
    id: "video",
    title: "Video Production",
    content: "Videos that tell your brand story, from concept to delivery.",
    tags: ["Animation", "Promo", "Editing"],
  },
];

export default function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState(0); // نبدأ من العنصر الأول
  const [direction, setDirection] = useState("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleServiceChange = (newIndex: number) => {
    if (newIndex === activeIndex || isAnimating) return;

    setDirection(newIndex > activeIndex ? "right" : "left");
    setIsAnimating(true);

    setTimeout(() => {
      setActiveIndex(newIndex);
      setTimeout(() => setIsAnimating(false), 400);
    }, 200);
  };

  const getButtonClasses = (index: number) => {
    const baseClasses =
      "transition-all duration-300 cursor-pointer text-left min-w-max md:min-w-0 flex items-center py-3 2xl:py-4 ml-8 rounded-lg transform hover:scale-105";

    return index === activeIndex
      ? `${baseClasses} text-gray-500`
      : `${baseClasses} text-gray-500/50`;
  };

  return (
    <section
      id="services"
      className="min-h-screen w-full flex items-center px-6 md:px-16 py-6 md:py-20 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row w-full h-full max-w-8xl mx-auto md:gap-16">
        {/* Sidebar Titles */}
        <div className="w-full md:w-1/3 flex flex-row md:flex-col justify-start md:justify-center gap-1 md:gap-4 overflow-x-auto pb-4 md:pb-0">
          {services.map((service, index) => (
            <button
              key={service.id}
              className={getButtonClasses(index)}
              onMouseEnter={() => handleServiceChange(index)}
              onClick={() => handleServiceChange(index)}
              disabled={isAnimating}
              aria-current={index === activeIndex ? "true" : "false"}
            >
              <div className="flex flex-row">
                <span className="py-1 text-3xl mx-2 my-1 opacity-60">
                  0{index + 1}
                </span>
                <span className="py-2 text-3xl lg:text-4xl 2xl:text-5xl">
                  {service.title}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full md:w-2/3 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: direction === "right" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === "right" ? -50 : 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-gray-50/30 p-8 md:p-14 rounded-2xl shadow-sm"
            >
              <motion.h3
                key={`title-${activeIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl md:text-5xl font-bold mb-4"
              >
                {services[activeIndex].title}
              </motion.h3>

              <div className="flex flex-wrap gap-2 mb-10">
                {services[activeIndex].tags.map((tag, index) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="px-4 py-2 rounded-full text-gray-900 shadow-md border border-gray-500 transition-all duration-300"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>

              <motion.p
                key={`desc-${activeIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg leading-relaxed mb-8"
              >
                {services[activeIndex].content}
              </motion.p>

              <button
                className="inline-flex items-center text-red-600 hover:text-orange-800 font-medium transition-all duration-200 group hover:translate-x-1"
                aria-label={`Learn more about ${services[activeIndex].title}`}
              >
                Learn More
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                  →
                </span>
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
