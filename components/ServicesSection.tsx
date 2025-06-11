'use client'

import { motion } from 'framer-motion'

export default function ServicesSection() {
    const services = [
        { title: 'تصميم المواقع', description: 'بناء واجهات مذهلة وحديثة' },
        { title: 'الهوية البصرية', description: 'شعارات، ألوان، خطوط، وكل ما يخص علامتك' },
        { title: 'إعلانات ومحتوى', description: 'خدمات تصميم إعلاني جذاب' }
    ]

    return (
        <section className="bg-white py-24">
            <div className="container mx-auto px-4 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl font-bold mb-16"
                >
                    خدماتنا
                </motion.h2>

                <div className="grid md:grid-cols-3 gap-10">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="bg-gray-100 p-8 rounded-xl shadow hover:shadow-lg transition"
                        >
                            <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                            <p className="text-gray-600">{service.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
