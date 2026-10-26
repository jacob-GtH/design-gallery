// src/components/sections/ContactPageContent.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FiMail, FiPhone } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function ContactPageContent() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language?.startsWith("ar");
    const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                toast.success(t('contact.sentSuccess'));
                setForm({ name: '', email: '', message: '', website: '' });
            } else if (res.status === 400) {
                toast.error(t('contact.invalid'));
            } else if (res.status === 429) {
                toast.error(t('contact.tooMany'));
            } else {
                toast.error(t('contact.sendError'));
            }
        } catch {
            toast.error(t('contact.sendError'));
        } finally {
            setSending(false);
        }
    };
    return (
        <section className="relative min-h-screen w-full flex items-center justify-end overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500">
            
            {/* Background Image - Full screen, matching HeroSection */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-left md:bg-[left_center] bg-no-repeat opacity-100 dark:opacity-60 transition-opacity duration-500"
                style={{ backgroundImage: `url("/images/bgHome.png")` }}
            />
            
            {/* Gradient Overlays - Darken the right side for content clarity */}
            <div className="absolute inset-0 z-1 bg-gradient-to-r from-transparent via-black/5 dark:via-black/20  dark:to-black/90 hidden md:block" />
            <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-white/5 dark:via-black/10  dark:to-[#050505]" />

            {/* Content Container - Pushed to the right */}
            
            <div className={`relative z-10 w-full flex flex-col items-center px-6 md:px-12 lg:px-24 py-20 ${isRTL ? "md:items-end text-center md:text-right" : "md:items-start text-center md:text-left"}`}>
                <div className={`max-w-xl flex flex-col items-center ${isRTL ? "md:items-end" : "md:items-start"}`}>
                    <SectionHeader
                        align={isRTL ? "right" : "left"}
                        badge={t("contact.badge")}
                        title={t("contact.title")}
                        gradientTitle={t("contact.gradientTitle")}
                        className="mb-10"
                    />

                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-gray-300 dark:text-gray-400 text-lg mb-10 leading-relaxed text-center transition-colors duration-500 ${isRTL ? "md:text-right" : "md:text-left"}`}
                    >
                        {t("contact.description")}
                    </motion.p>

                    {/* النموذج المبسط */}
                    <form onSubmit={handleSubmit} className="space-y-6 w-full">
                        {/* honeypot: مخفي عن المستخدمين، البوتات تملؤه */}
                        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                            <input
                                type="text"
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                value={form.website}
                                onChange={(e) => setForm({ ...form, website: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="name"
                                required
                                minLength={2}
                                maxLength={100}
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder={t("contact.namePlaceholder")}
                                className="w-full rounded-xl bg-black/60 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-200 dark:placeholder:text-gray-00 text-center md:text-right text-black dark:text-white"
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                name="email"
                                required
                                maxLength={254}
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder={t("contact.emailPlaceholder")}
                                className="w-full rounded-xl bg-black/60 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-200 dark:placeholder:text-gray-600 text-center md:text-right text-black dark:text-white"
                            />
                        </div>
                        <div>
                            <textarea
                                rows={4}
                                name="message"
                                required
                                minLength={10}
                                maxLength={5000}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder={t("contact.messagePlaceholder")}
                                className="w-full rounded-xl bg-black/60 dark:bg-white/5 border border-black/10 dark:border-white/10 px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-200 dark:placeholder:text-gray-600 text-center md:text-right text-black dark:text-white resize-none"
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={sending}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-60"
                        >
                            {sending ? t("contact.sending") : t("contact.sendMessage")}
                        </motion.button>
                    </form>

                    {/* معلومات التواصل السريعة */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 w-full pt-10 border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
                        <div className={`flex items-center gap-4 justify-center ${isRTL ? "md:justify-end" : "md:justify-start"}`}>
                            <div className={isRTL ? "text-right" : "text-left"}>
                                <p className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1">{t("contact.emailLabel")}</p>
                                <p className="text-black dark:text-white font-medium text-sm transition-colors duration-500">hello@designgallery.com</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/50 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 flex items-center justify-center text-indigo-400 dark:text-indigo-400 transition-colors duration-500">
                                <FiMail size={16} />
                            </div>
                        </div>
                        <div className={`flex items-center gap-4 justify-center ${isRTL ? "md:justify-end" : "md:justify-start"}`}>
                            <div className={isRTL ? "text-right" : "text-left"}>
                                <p className="text-[10px] text-purple-300 uppercase tracking-widest mb-1">{t("contact.phoneLabel")}</p>
                                <p className="text-black dark:text-white font-medium text-sm transition-colors duration-500">+967 7xx xxx xxx</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-purple-500/50 dark:bg-purple-500/10 border border-purple-500/10 dark:border-purple-500/20 flex items-center justify-center text-purple-300 dark:text-purple-400 transition-colors duration-500">
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
