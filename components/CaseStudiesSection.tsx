import DesignsPage from "@/app/designs/page";
import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function SectionCaseStudies() {
  const [visibleItems, setVisibleItems] = useState(new Set());

  const caseStudies = [
    {
      id: 1,
      title: "نظام إدارة المحتوى لشركة تعليمية",
      description:
        "حلول برمجية متكاملة ساهمت في تحسين تجربة المستخدم بنسبة 40٪",
      imageUrl:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
      results: [
        "تحسين تجربة المستخدم بنسبة 40٪",
        "تقليل وقت التحميل بمقدار 60٪",
        "زيادة التفاعل مع المحتوى",
      ],
    },
    {
      id: 2,
      title: "منصة تجارة إلكترونية لبيع المنتجات",
      description: "زيادة في المبيعات وصلت إلى 75٪ خلال أول 3 أشهر",
      imageUrl:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
      results: [
        "زيادة المبيعات 75٪",
        "تحسين معدل التحويل",
        "واجهة إدارة مبسطة",
      ],
    },
    {
      id: 3,
      title: "تطبيق جوال لخدمة العملاء",
      description: "حصل على تقييم 4.9/5 في متاجر التطبيقات",
      imageUrl:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
      results: ["تقييم 4.9/5", "أكثر من 100K تنزيل", "معدل احتفاظ عالي"],
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            setVisibleItems((prev) => {
              const newSet = new Set(prev);
              newSet.add(id);
              return newSet;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const elements = document.querySelectorAll("[data-case-study]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  function TypeWriter({
    text = "",
    speed = 50,
    delay = 0,
    className = "",
    tag = "p",
  }: {
    text?: string;
    speed?: number;
    delay?: number;
    className?: string;
    tag?: React.ElementType;
  }) {
    const [displayedText, setDisplayedText] = useState("");
    const [started, setStarted] = useState(false);

    useEffect(() => {
      const startTimer = setTimeout(() => {
        setStarted(true);
      }, delay);

      return () => clearTimeout(startTimer);
    }, [delay]);

    useEffect(() => {
      if (!started) return;

      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.substring(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, [started, text, speed]);

    const Tag = tag as React.ElementType;
    return <Tag className={className}>{displayedText}</Tag>;
  }

  return (
    <section
      id="case-studies"
      className="w-full flex flex-col items-center px-6 md:px-12 py-20 space-y-24 "
    >
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-500 mb-4">
          دراسات الحالة
        </h2>
        <p className="text-lg text-gray-500">
          مشاريع ناجحة قدمناها لعملائنا مع نتائج ملموسة وقابلة للقياس
        </p>
      </div>

      {caseStudies.map((study, index) => {
        const baseDelay = index * 0.5;
        const descDelay = baseDelay + 1.5;
        const resultDelay = descDelay + 1;

        return (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: index * 0.1,
              ease: "easeOut",
            }}
            data-case-study
            data-id={study.id}
            className={`w-full flex flex-col md:flex-row ${
              index % 2 !== 0 ? "md:flex-row-reverse" : ""
            } items-center mb-10 gap-16`}
          >
            {/* الصورة */}
            <div
              className={`relative w-full  md:w-2/3 h-[450px] md:h-[700px] lg:h-[900px] rounded-xl overflow-hidden shadow-lg transition-all duration-700 ${
                visibleItems.has(study.id.toString())
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <img
                src={study.imageUrl}
                alt={`دراسة حالة - ${study.title}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* النص */}
            <div className="w-full md:w-1/2 flex flex-col justify-center text-right">
              {visibleItems.has(study.id.toString()) && (
                <>
                  <TypeWriter
                    text={study.title}
                    speed={50}
                    delay={500}
                    tag="h3"
                    className="text-3xl md:text-3xl font-bold text-gray-400 mb-4"
                  />

                  <TypeWriter
                    text={study.description}
                    speed={30}
                    delay={2000}
                    className="text-gray-500 mb-6 text-2xl leading-relaxed"
                  />

                  <div className="text-gray-500 text-lg space-y-2 mb-6">
                    {study.results.map((result, i) => (
                      <TypeWriter
                        key={i}
                        text={`✓ ${result}`}
                        speed={40}
                        delay={3500 + i * 800}
                        className="block"
                      />
                    ))}
                  </div>

                  {/* <div
                  className={`transition-all duration-500 ${
                    visibleItems.has(study.id.toString())
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  style={{
                    transitionDelay: `${
                      3500 + study.results.length * 800 + 500
                    }ms`,
                  }}
                >
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: (3500 + study.results.length * 800 + 500) / 1000,
                    }}
                    className="text-white bg-black px-5 py-2 rounded-md w-max hover:bg-gray-800 transition-colors"
                  >
                    عرض التفاصيل
                  </motion.button>
                </div> */}
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
