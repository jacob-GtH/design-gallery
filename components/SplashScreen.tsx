// components/SplashScreen.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function SplashScreen() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 3000); // مدة العرض 3 ثوانٍ

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {showSplash && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-black to-gray-900/90 backdrop-blur-sm text-white"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        y: -100,
                        transition: {
                            duration: 1.2,
                            ease: [0.83, 0, 0.17, 1] // Cubic-bezier smooth
                        }
                    }}

                    transition={{ duration: 0.5 }}
                >
                    {/* Logo Animation */}
                    <motion.div
                        className="relative w-32 h-32 md:w-48 md:h-48 mb-8"
                        initial={{
                            rotate: -15,
                            scale: 0.8,
                            opacity: 0
                        }}
                        animate={{
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.1, 1],
                            opacity: 1
                        }}
                        transition={{
                            rotate: {
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut"
                            },
                            scale: {
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse"
                            },
                            opacity: {
                                duration: 0.8
                            }
                        }}
                    >
                        <Image
                            src="/logo-for-web-jakop.svg"
                            alt="DD.NYC Logo"
                            width={192}
                            height={192}
                            priority
                            className="object-contain"
                        />
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        className="text-center"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: "spring",
                                damping: 10,
                                stiffness: 100,
                                delay: 0.3
                            }
                        }}
                    >
                        <motion.h1
                            className="text-4xl md:text-6xl font-bold tracking-wide"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    delay: 0.5,
                                    duration: 0.6
                                }
                            }}
                        >
                            Design Gallery
                        </motion.h1>

                        <motion.p
                            className="text-sm mt-4 tracking-widest text-gray-300"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    delay: 0.7,
                                    duration: 0.6
                                }
                            }}
                        >
                            Discover stunning creations
                        </motion.p>

                        {/* Progress Bar */}

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}