'use client';

import { motion } from 'framer-motion';
import DesignCard from './designs/DesignCard';
import { IDesign } from '@/interfaces/Design';

export default function DesignsSection({ designs }: { designs: IDesign[] }) {
    return (
        <section className="relative py-24 overflow-hidden bg-white dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-4">
                <motion.h2
                    className="text-4xl md:text-5xl font-bold text-center mb-16 text-black dark:text-white"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    أحدث التصاميم
                </motion.h2>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                    initial="hidden"
                    whileInView="visible"
                    transition={{ staggerChildren: 0.2 }}
                    viewport={{ once: true }}
                >
                    {designs.map((design, index) => (
                        <motion.div
                            key={design.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <DesignCard design={design} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
