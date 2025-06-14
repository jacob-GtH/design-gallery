'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const services = [
    {
        id: 'web',
        title: 'Web Design',
        content: 'We specialize in building modern web experiences that represent your brand powerfully.',
        tags: ['Responsive', 'UX/UI', 'CMS'],

    },
    {
        id: 'branding',
        title: 'Branding',
        content: 'Crafting strong, memorable brands that stand out in competitive markets.',
        tags: ['Logo Design', 'Typography', 'Guidelines'],

    },
    {
        id: 'graphic',
        title: 'Graphic Design',
        content: 'From social media to print, we create compelling visuals that communicate.',
        tags: ['Social Media', 'Posters', 'Packaging'],

    },
    {
        id: 'packaging',
        title: 'Packaging',
        content: 'Unique, functional packaging designs that speak to your customers.',
        tags: ['Custom Boxes', 'Labels', 'Retail'],

    },
    {
        id: 'video',
        title: 'Video Production',
        content: 'Videos that tell your brand story, from concept to delivery.',
        tags: ['Animation', 'Promo', 'Editing'],

    },
]

export default function ServicesSection() {
    const [activeIndex, setActiveIndex] = useState(1)
    const [direction, setDirection] = useState<'left' | 'right'>('right')

    const handleServiceChange = (newIndex: number) => {
        setDirection(newIndex > activeIndex ? 'right' : 'left')
        setActiveIndex(newIndex)
    }

    return (
        <section
            id="services"
            className="min-h-screen w-full flex items-center bg-white text-black px-6 md:px-16 py-20 overflow-hidden"
        >
            <div className="flex flex-col md:flex-row w-full h-full max-w-7xl mx-auto gap-8 md:gap-16">

                {/* Sidebar Titles - Vertical on desktop, horizontal on mobile */}
                <div className="w-full md:w-1/3 flex flex-row md:flex-col justify-start md:justify-center gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0">
                    {services.map((service, index) => (
                        <motion.button
                            key={service.id}
                            className={clsx(
                                'transition-colors duration-300 cursor-pointer text-left min-w-max md:min-w-0',
                                'flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 rounded-lg',
                                index === activeIndex
                                    ? 'bg-gray-100 text-black font-bold'
                                    : 'text-gray-500 hover:text-black hover:bg-gray-50'
                            )}
                            onMouseEnter={() => handleServiceChange(index)}
                            onClick={() => handleServiceChange(index)}

                        >
                            <div className="flex flex-row">
                                <span className="text-sm mx-1 my-1 opacity-60">0{index + 1}</span>
                                <span className="text-lg">{service.title}</span>
                            </div>
                        </motion.button>

                    ))}
                </div>

                {/* Content Area */}
                <div className="w-full md:w-2/3 flex flex-col justify-center relative">
                    <AnimatePresence mode="popLayout" custom={direction}>
                        <motion.div
                            key={activeIndex}
                            custom={direction}
                            initial={{ opacity: 0, x: direction === 'right' ? 100 : -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction === 'right' ? -100 : 100 }}
                            transition={{
                                duration: 0.4,
                                ease: [0.33, 1, 0.68, 1],
                                type: 'spring',
                                stiffness: 300,
                                damping: 30
                            }}
                            className="bg-gray-50 p-8 md:p-12 rounded-2xl shadow-sm"
                        >
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                {services[activeIndex].title}
                            </h3>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {services[activeIndex].tags.map(tag => (
                                    <motion.span
                                        key={tag}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white text-sm px-4 py-2 rounded-full text-gray-800 shadow-xs border border-gray-200"
                                    >
                                        {tag}
                                    </motion.span>
                                ))}
                            </div>

                            <motion.p
                                className="text-lg text-gray-700 leading-relaxed mb-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {services[activeIndex].content}
                            </motion.p>

                            <motion.button
                                className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium transition-all duration-200 group"
                                whileHover={{ x: 4 }}
                                aria-label={`Learn more about ${services[activeIndex].title}`}
                            >
                                Learn More
                                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                                    →
                                </span>
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}