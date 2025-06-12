'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function SectionCaseStudies() {
    const caseStudies = [
        {
            id: 1,
            title: "نظام إدارة المحتوى لشركة تعليمية",
            description: "حلول برمجية متكاملة ساهمت في تحسين تجربة المستخدم بنسبة 40٪",
            imageUrl: "/images/education-cms.jpg",
            results: [
                "تحسين تجربة المستخدم بنسبة 40٪",
                "تقليل وقت التحميل بمقدار 60٪",
                "زيادة التفاعل مع المحتوى"
            ]
        },
        {
            id: 2,
            title: "منصة تجارة إلكترونية لبيع المنتجات",
            description: "زيادة في المبيعات وصلت إلى 75٪ خلال أول 3 أشهر",
            imageUrl: "/images/ecommerce-platform.jpg",
            results: [
                "زيادة المبيعات 75٪",
                "تحسين معدل التحويل",
                "واجهة إدارة مبسطة"
            ]
        },
        {
            id: 3,
            title: "تطبيق جوال لخدمة العملاء",
            description: "حصل على تقييم 4.9/5 في متاجر التطبيقات",
            imageUrl: "/images/mobile-app.jpg",
            results: [
                "تقييم 4.9/5",
                "أكثر من 100K تنزيل",
                "معدل احتفاظ عالي"
            ]
        }
    ]

    return (
        <section
            id="case-studies"
            className="min-h-screen w-full flex items-center bg-white text-black px-6 md:px-16 py-20 overflow-hidden"
        >
            <div className="container w-full max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        دراسات الحالة
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        مشاريع ناجحة قدمناها لعملائنا مع نتائج ملموسة وقابلة للقياس
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {caseStudies.map((study, index) => (
                        <motion.div
                            key={study.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: index * 0.15,
                                ease: "easeOut"
                            }}
                            viewport={{
                                once: true,
                                margin: "0px 0px -100px 0px"
                            }}
                            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="h-64 overflow-hidden relative">
                                <Image
                                    src={study.imageUrl}
                                    alt={`دراسة حالة - ${study.title}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    priority={index < 2}
                                />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-white mb-2">{study.title}</h3>
                                    <p className="text-gray-200 text-sm mb-3">{study.description}</p>
                                    <ul className="text-gray-300 text-xs space-y-1">
                                        {study.results.map((result, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="text-blue-400 mr-2">✓</span>
                                                {result}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    className="mt-4 text-white border border-white py-2 px-4 rounded-md hover:bg-white hover:text-black transition-colors duration-300 self-start text-sm font-medium"
                                    aria-label={`عرض تفاصيل ${study.title}`}
                                >
                                    عرض التفاصيل
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}