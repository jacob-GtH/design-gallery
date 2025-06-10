// components/SplashScreen.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 3000) // اختفاء بعد 3 ثوانٍ

        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: {
                            duration: 0.8,
                            ease: "easeInOut"
                        }
                    }}
                >
                    <motion.div
                        className="relative w-32 h-32 md:w-48 md:h-48"
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
                            src="/logo-for-web-jakop.svg" // تأكد من وجود الملف في مجلد public
                            alt="DD.NYC Logo"
                            width={192}
                            height={192}
                            priority
                            className="object-contain"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: "spring",
                                damping: 10,
                                stiffness: 100
                            }
                        }}
                        className="text-center"
                    >
                        <motion.h1
                            className="text-4xl md:text-6xl font-bold tracking-wide"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                transition: { delay: 0.2 }
                            }}
                        >
                            Design Gallery
                        </motion.h1>
                        <motion.p
                            className="text-sm mt-2 tracking-widest text-gray-300"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                transition: { delay: 0.4 }
                            }}
                        >
                            Discover stunning creations
                        </motion.p>

                        {/* مؤشر تحميل إضافي */}
                        <motion.div
                            className="mt-8 mx-auto h-1 w-32 bg-gray-700 rounded-full overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{
                                width: "8rem",
                                transition: { duration: 2.8 }
                            }}
                        >
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: 0 }}
                                animate={{
                                    width: "100%",
                                    transition: { duration: 2.8 }
                                }}
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}