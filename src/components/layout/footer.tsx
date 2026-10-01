"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiInstagram, FiTwitter, FiLinkedin, FiGithub } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // إصلاح Hydration: قبل التركيب العميل، نستخدم نفس قيمة SSR
  const isRTL = mounted && i18n.language?.startsWith("ar");
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: t("nav.home"), href: "#home" },
      { name: t("caseStudies.title"), href: "#case-studies" },
      { name: t("nav.designs"), href: "#designs" },
      { name: t("nav.services"), href: "#services" },
    ],
    company: [
      { name: t("nav.about"), href: "/about" },
      { name: t("nav.contact"), href: "#contact" },
      { name: t("footer.privacy"), href: "/privacy" },
    ],
    social: [
      { icon: <FiInstagram />, href: "#", label: "Instagram" },
      { icon: <FiTwitter />, href: "#", label: "Twitter" },
      { icon: <FiLinkedin />, href: "#", label: "LinkedIn" },
      { icon: <FiGithub />, href: "#", label: "GitHub" },
    ],
  };

  return (
    <footer className="relative bg-white dark:bg-[#050505] pt-24 pb-12 overflow-hidden border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/3 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />

      <div className="container mx-auto px-6 relative z-10">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 ${isRTL ? "text-right" : "text-left"}`}>
          
          {/* Brand Column */}
          <div className="lg:col-span-1 text-center md:text-start">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-400 uppercase tracking-tighter">{t("footer.brand")}</span>
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-500 leading-relaxed max-w-xs mx-auto md:mx-0 transition-colors duration-500">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-start">
            <h4 className="text-black dark:text-white font-bold mb-6 transition-colors duration-500">{t("footer.explore")}</h4>
            <ul className="space-y-4">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="text-center md:text-start">
            <h4 className="text-black dark:text-white font-bold mb-6 transition-colors duration-500">{t("footer.company")}</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter/Contact */}
          <div className="text-center md:text-start">
            <h4 className="text-black dark:text-white font-bold mb-6 transition-colors duration-500">{t("footer.contactTitle")}</h4>
            <p className="text-gray-600 dark:text-gray-500 mb-6 transition-colors duration-500">
              {t("footer.newsletter")}
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              {footerLinks.social.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  whileHover={{ y: -4, color: "#818cf8" }}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all duration-500"
                  aria-label={item.label}
                >
                  {item.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-500">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-500 text-sm transition-colors duration-500">
            <span>{t("footer.rights")} © {currentYear}</span>
            <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-700 transition-colors duration-500" />
            <span className="font-bold text-gray-500 dark:text-gray-400 transition-colors duration-500">jacob Studio</span>
          </div>
          
          <div className="flex gap-8">
            <Link href="#" className="text-gray-600 dark:text-gray-600 hover:text-purple-600 dark:hover:text-purple-400 text-xs transition-colors">{t("footer.privacy")}</Link>
            <Link href="#" className="text-gray-600 dark:text-gray-600 hover:text-purple-600 dark:hover:text-purple-400 text-xs transition-colors">{t("footer.terms")}</Link>
          </div>
        </div>

        {/* Decorative Side Elements */}
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 opacity-[0.05] dark:opacity-[0.02] text-[10vw] font-black text-black dark:text-white select-none pointer-events-none uppercase tracking-tighter transition-colors duration-500">
          Creative
        </div>
      </div>
    </footer>
  );
}