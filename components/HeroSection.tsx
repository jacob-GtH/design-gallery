// components/HeroSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function HeroSection() {
    return (
        <div className="relative bg-gradient-to-r from-blue-900 to-purple-800 text-white py-28">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        منصة لعرض إبداعات المصممين العرب
                    </h1>
                    <p className="text-xl mb-8 opacity-90">
                        اكتشف أفضل التصاميم، تواصل مع الموهوبين، واعرض أعمالك للعالم
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline">انضم كمصمم</Button>
                    </div>
                </motion.div>
            </div>

            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px]"></div>
        </div>
    );
}