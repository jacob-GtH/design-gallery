
'use client'


import { motion } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'

export default function ContactSection() {
    return (
        <section
            id="contact"
            className="relative  to-black text-white py-32 overflow-hidden"
        >
            {/* Decorative elements */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center "
                aria-hidden="true"
            />
            <div className="container mx-auto px-4 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                    className="max-w-3xl mx-auto"
                >
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        دعنا نتحدث
                    </motion.h2>

                    <motion.p
                        className="text-lg md:text-xl text-purple-100 mb-10 leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        مهتم بالتعاون معنا؟ نحن دائماً نبحث عن شركاء جدد ومشاريع ملهمة.
                        <br className="hidden md:block" /> تواصل معنا وسنرد عليك خلال 24 ساعة.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <motion.a
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-900 rounded-full font-semibold text-lg hover:bg-opacity-90 transition-all group"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.1)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="انتقل إلى صفحة التواصل"
                        >
                            تواصل معنا الآن
                            <FiArrowLeft className="group-hover:translate-x-1 transition-transform" />
                        </motion.a>
                    </motion.div>
                </motion.div>
            </div>

            {/* Animated floating elements فقاعات */}
            <motion.div
                className="absolute top-20 left-20 w-16 h-16  bg-purple-500 opacity-20"
                animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.3, 1]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                aria-hidden="true"
            />
            <motion.div
                className="absolute bottom-20 right-20 w-24 h-24 rounded-sm bg-white opacity-10"
                animate={{
                    y: [0, 20, 0],
                    scale: [1, 1.3, 1]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                aria-hidden="true"
            />
        </section>
    )
}