// components/HeroSection.tsx
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
    return (
        <section className="relative h-screen bg-black text-white overflow-hidden">
            <motion.div
                className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/40 to-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            />

            <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
                <motion.h1
                    className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    معرض التصاميم الإبداعية
                </motion.h1>

                <motion.p
                    className="text-lg md:text-2xl text-gray-300 max-w-2xl mb-8"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                >
                    اكتشف أعمال المصممين الموهوبين من العالم العربي.
                </motion.p>

                <motion.div
                    className="flex gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Button variant="primary" className="text-lg px-6 py-3">ابدأ التصفح</Button>
                    <Button variant="outline" className="text-lg px-6 py-3">انضم كمصمم</Button>
                </motion.div>
            </div>
        </section>
    )
}
