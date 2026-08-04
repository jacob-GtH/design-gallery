// src/components/sections/ContactPageContent.tsx
'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FiMail, FiPhone } from 'react-icons/fi';

export default function ContactPageContent() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-end overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500">
            
            {/* Background Image - Full screen, matching HeroSection */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-left md:bg-[left_center] bg-no-repeat opacity-100 dark:opacity-60 transition-opacity duration-500"
                style={{ backgroundImage: `url("/images/bgHome.png")` }}
            />
            
            {/* Gradient Overlays - Darken the right side for content clarity */}
            <div className="absolute inset-0 z-1 bg-gradient-to-r from-transparent via-black/5 dark:via-black/20 to-white/90 dark:to-black/90 hidden md:block" />
            <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-white/5 dark:via-black/10 to-white/40 dark:to-[#050505]" />

            {/* Content Container - Pushed to the right */}
            <div className="relative z-10 w-full flex flex-col items-center md:items-end text-center md:text-right px-6 md:px-12 lg:px-24 py-20">
                <div className="max-w-xl flex flex-col items-center md:items-end">
                    <SectionHeader
                        align="right"
                        badge="تواصل معنا"
                        title="دعنا نبدأ"
                        gradientTitle="شيئاً عظيماً"
                        className="mb-10"
                    />

                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-900 dark:text-gray-400 text-lg mb-10 leading-relaxed text-center md:text-right transition-colors duration-500"
                    >
                        نحن هنا للإجابة على استفساراتك ومساعدتك في تحويل رؤيتك إلى واقع ملموس. املأ النموذج أدناه وسنقوم بالرد عليك في أقرب وقت.
                    </motion.p>

                    {/* النموذج المبسط */}
                    <form className="space-y-6 w-full">
                        <div>
                            <input
                                type="text"
                                placeholder="الاسم الكامل"
                                className="w-full rounded-xl bg-black/60 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-200 dark:placeholder:text-gray-00 text-center md:text-right text-black dark:text-white"
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                placeholder="البريد الإلكتروني"
                                className="w-full rounded-xl bg-black/60 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-200 dark:placeholder:text-gray-600 text-center md:text-right text-black dark:text-white"
                            />
                        </div>
                        <div>
                            <textarea
                                rows={4}
                                placeholder="رسالتك..."
                                className="w-full rounded-xl bg-black/60 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-200 dark:placeholder:text-gray-600 text-center md:text-right text-black dark:text-white resize-none"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            إرسال الرسالة
                        </motion.button>
                    </form>

                    {/* معلومات التواصل السريعة */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 w-full pt-10 border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
                        <div className="flex items-center gap-4 justify-center md:justify-end">
                            <div className="text-right">
                                <p className="text-[10px] text-indigo-500 uppercase tracking-widest mb-1">البريد الإلكتروني</p>
                                <p className="text-black dark:text-white font-medium text-sm transition-colors duration-500">hello@designgallery.com</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors duration-500">
                                <FiMail size={16} />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 justify-center md:justify-end">
                            <div className="text-right">
                                <p className="text-[10px] text-purple-900 uppercase tracking-widest mb-1">رقم الهاتف</p>
                                <p className="text-black dark:text-white font-medium text-sm transition-colors duration-500">+967 7xx xxx xxx</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 transition-colors duration-500">
                                <FiPhone size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Branding Mini Text */}
            <div className="absolute left-10 bottom-10 opacity-20 dark:opacity-10 hidden md:block rotate-[-90deg] origin-left">
                <span className="text-sm font-bold text-black dark:text-white uppercase tracking-[0.5em] whitespace-nowrap transition-colors duration-500">
                    The Art of Excellence
                </span>
            </div>
        </section>
    );
}
