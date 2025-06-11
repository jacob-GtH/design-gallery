'use client'

import { motion } from 'framer-motion'

export default function ContactSection() {
    return (
        <section className="bg-gradient-to-br from-purple-700 to-black text-white py-24">
            <div className="container mx-auto px-4 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl font-bold mb-8"
                >
                    دعنا نتحدث
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-lg mb-6"
                >
                    مهتم بالتعاون معنا؟ نحن دائماً نبحث عن شركاء جدد ومشاريع ملهمة.
                </motion.p>

                <motion.a
                    href="#"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block px-6 py-3 bg-white text-black rounded-full font-semibold transition"
                >
                    تواصل معنا الآن
                </motion.a>
            </div>
        </section>
    )
}
