// components/RevealTransition.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function RevealTransition({
    onComplete,
    duration = 2000,
    color = 'bg-black'
}: {
    onComplete?: () => void
    duration?: number
    color?: string
}) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            onComplete?.()
        }, duration)

        return () => clearTimeout(timer)
    }, [onComplete, duration])

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    className={`fixed inset-0 z-[9999] ${color}`}
                    initial={{ x: '0%' }}
                    animate={{
                        x: '100%',
                        transition: {
                            duration: 1.8,
                            ease: [0.76, 0, 0.24, 1]
                        }
                    }}
                    exit={{
                        opacity: 0,
                        transition: {
                            duration: 0.5
                        }
                    }}
                    onAnimationComplete={() => setIsVisible(false)}
                >
                    {/* Optional overlay content */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            transition: { delay: 0.3 }
                        }}
                    >
                        {'rrrrrrrrrrrrrrr'}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}