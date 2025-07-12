import DesignsPage from "@/app/designs/page";
import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function SectionCaseStudies() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

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
          const id = entry.target.getAttribute("data-id");

          if (entry.isIntersecting && id) {
            setVisibleItems((prev) => {
              const newSet = new Set(prev);
              newSet.add(id); // عند الدخول
              return newSet;
            });
          } else if (!entry.isIntersecting && id) {
            setVisibleItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(id); // عند الخروج من الشاشة نحذف العنصر
              return newSet;
            });
          }
        });
      },
      { threshold: 0.5 } // 50% من العنصر ظاهر
    );

    const elements = document.querySelectorAll("[data-case-study]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
            viewport={{ once: false, amount: 0.5 }}
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
            <motion.div
              className="relative w-full md:w-2/3 h-[450px] md:h-[700px] lg:h-[900px] rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              <img
                src={study.imageUrl}
                alt={`دراسة حالة - ${study.title}`}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* النصوص */}
            <div className="w-full md:w-1/2 flex flex-col justify-center text-right space-y-4">
              <motion.h3
                className="text-3xl font-bold text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                {study.title}
              </motion.h3>

              <motion.p
                className="text-gray-500 text-2xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                {study.description}
              </motion.p>

              {/* النتائج */}
              <div className="text-gray-500 text-lg space-y-2">
                {study.results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 2 + i * 0.7,
                      duration: 0.6,
                    }}
                    viewport={{ once: false, amount: 0.5 }}
                  >
                    ✓ {result}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
