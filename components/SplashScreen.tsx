'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type SplashScreenProps = {
    onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [showSplash, setShowSplash] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false) // إخفاء الشاشة أولاً لتشغيل الـ exit animation
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence mode="wait" onExitComplete={onComplete}>
            {showSplash && (
                <motion.div
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-100%', opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-black to-gray-900/90 backdrop-blur-sm text-white"
                >
                    {/* الشعار */}
                    <motion.div
                        className="relative w-32 h-32 md:w-48 md:h-48 mb-8"
                        initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
                        animate={{
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.1, 1],
                            opacity: 1,
                        }}
                        transition={{
                            rotate: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                            scale: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' },
                            opacity: { duration: 0.8 }
                        }}
                    >
                        <Image
                            src="/logo-for-web-jakop.svg"
                            alt="Logo"
                            width={192}
                            height={192}
                            priority
                            className="object-contain"
                        />
                    </motion.div>

                    {/* النصوص */}
                    <motion.div
                        className="text-center"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: 'spring',
                                damping: 10,
                                stiffness: 100,
                                delay: 0.3
                            }
                        }}
                    >
                        <motion.h1
                            className="text-4xl md:text-6xl font-bold tracking-wide"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.6 } }}
                        >
                            Design Gallery
                        </motion.h1>

                        <motion.p
                            className="text-sm mt-4 tracking-widest text-gray-300"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.6 } }}
                        >
                            Discover stunning creations
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
