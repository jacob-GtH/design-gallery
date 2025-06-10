// components/HeroSection.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function HeroSection() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // سيظهر بعد 3 ثواني (توقيت اختفاء SplashScreen)
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-gradient-to-r from-blue-900 to-purple-800 text-white py-28"
                >
                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="max-w-3xl"
                        >
                            <motion.h1
                                className="text-4xl md:text-5xl font-bold mb-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.5 } }}
                            >
                                منصة لعرض إبداعات المصممين العرب
                            </motion.h1>
                            <motion.p
                                className="text-xl mb-8 opacity-90"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.7 } }}
                            >
                                اكتشف أفضل التصاميم، تواصل مع الموهوبين، واعرض أعمالك للعالم
                            </motion.p>
                            <motion.div
                                className="flex flex-wrap gap-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.9 } }}
                            >
                                <Button variant="primary">تصفح الأعمال</Button>
                                <Button variant="outline">انضم كمصمم</Button>
                            </motion.div>
                        </motion.div>
                    </div>

                    <motion.div
                        className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.2 } }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}