import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";

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

const serviceIcons: Record<string, React.ReactNode> = {
  web: (
    <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  branding: (
    <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  ),
  graphic: (
    <svg className="w-12 h-12 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  packaging: (
    <svg className="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  video: (
    <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

export default function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState(0); // نبدأ من العنصر الأول
  const [direction, setDirection] = useState("right");

  const handleServiceChange = (newIndex: number) => {
    if (newIndex === activeIndex) return;
    setDirection(newIndex > activeIndex ? "right" : "left");
    setActiveIndex(newIndex);
  };

  const getButtonClasses = (index: number) => {
    const baseClasses =
      "relative transition-all duration-300 cursor-pointer text-left min-w-max md:min-w-0 flex items-center py-4 px-6 md:ml-4 rounded-xl select-none outline-none group overflow-hidden w-full";

    return index === activeIndex
      ? `${baseClasses} text-black dark:text-white`
      : `${baseClasses} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300`;
  };

  return (
    <section
      id="services"
      className="min-h-screen w-full flex flex-col items-center px-6 md:px-16 py-12 md:py-24 overflow-hidden relative bg-white dark:bg-black transition-colors duration-500"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto relative z-10 mb-12">
        <SectionHeader
          align="right"
          badge="خدماتنا الإبداعية"
          title="نحول الأفكار إلى"
          gradientTitle="تجارب استثنائية"
        />
      </div>

      <div className="flex flex-col md:flex-row w-full h-full max-w-7xl mx-auto md:gap-16 relative z-10">
        
        {/* Sidebar Titles */}
        <div className="w-full md:w-1/3 flex flex-row md:flex-col justify-start md:justify-center gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible pb-6 md:pb-0 scrollbar-none">
          {services.map((service, index) => (
            <button
              key={service.id}
              className={getButtonClasses(index)}
              onMouseEnter={() => handleServiceChange(index)}
              onClick={() => handleServiceChange(index)}
              aria-current={index === activeIndex ? "true" : "false"}
            >
              {/* Animated Background Selector */}
              {index === activeIndex && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-service-gradient border-l-4 border-indigo-500 rounded-xl"
                  transition={{ type: "spring", stiffness: 450, damping: 38 }}
                />
              )}

              <div className="flex flex-row items-center relative z-20 w-full">
                <span className={`py-1 text-2xl lg:text-3xl mx-2 my-1 transition-colors duration-300 font-mono ${
                  index === activeIndex ? "text-indigo-400 font-bold" : "text-gray-600 group-hover:text-gray-400"
                }`}>
                  0{index + 1}
                </span>
                <span className={`py-2 text-2xl lg:text-3xl 2xl:text-4xl font-semibold transition-all duration-300 ${
                  index === activeIndex ? "translate-x-2 text-black dark:text-white" : "group-hover:translate-x-1"
                }`}>
                  {service.title}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full md:w-2/3 flex flex-col justify-center relative min-h-[420px]">
          {/* Static Glass Container */}
          <div className="bg-gray-100 dark:bg-gray-900/40 backdrop-blur-md p-8 md:p-14 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-500 w-full h-full">
            {/* Card Inner Glow Accent */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl pointer-events-none rounded-full" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                className="relative z-10 w-full h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-400 tracking-tight">
                      {services[activeIndex].title}
                    </h3>

                    {/* Service Icon */}
                    <div className="p-3 bg-white dark:bg-gray-950/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner shrink-0 ml-4">
                      {serviceIcons[services[activeIndex].id]}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {services[activeIndex].tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 rounded-full text-indigo-300 bg-indigo-950/30 border border-indigo-900/50 shadow-md backdrop-blur-sm text-sm font-medium hover:border-indigo-500/40 transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
                    {services[activeIndex].content}
                  </p>
                </div>

                {/* Action Button */}
                <div>
                  <button
                    className="inline-flex items-center gap-3 text-indigo-400 hover:text-white font-semibold group transition-all duration-300 px-6 py-3 rounded-xl bg-indigo-950/20 hover:bg-indigo-600 border border-indigo-900/60 hover:border-indigo-500 shadow-lg"
                    aria-label={`Learn more about ${services[activeIndex].title}`}
                  >
                    Learn More
                    <span className="transform group-hover:translate-x-1.5 transition-transform duration-300 text-lg">
                      →
                    </span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
