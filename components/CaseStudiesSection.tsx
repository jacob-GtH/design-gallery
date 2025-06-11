'use client'

import { motion } from 'framer-motion'

export default function CaseStudiesSection() {
    return (
        <section className="bg-black text-white py-24">
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl font-bold text-center mb-16"
                >
                    دراسات الحالة
                </motion.h2>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* يمكنك تكرار هذا العنصر حسب عدد المشاريع */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="group relative overflow-hidden rounded-lg shadow-lg"
                    >
                        <img
                            src="/images/case-study-1.jpg"
                            alt="Case Study"
                            className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-6">
                            <h3 className="text-2xl font-semibold mb-2">مشروع برمجي مميز</h3>
                            <p className="text-gray-300 text-sm">وصف موجز للمشروع وكيف تم حله بذكاء إبداعي.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
