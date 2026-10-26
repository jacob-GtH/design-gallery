"use client";

import { ReactNode, useEffect } from "react";
import i18n from "@/i18n";
import { I18nextProvider } from "react-i18next";

const STORAGE_KEY = "lang";

export default function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const applyDir = () => {
      const lang = i18n.language || "en";
      const isRTL = lang.startsWith("ar");
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      if (document.body) {
        document.body.dir = isRTL ? "rtl" : "ltr";
      }
    };

    // عند أي تغيير للغة: طبّق الاتجاه واحفظ الاختيار
    const onChange = () => {
      applyDir();
      try {
        localStorage.setItem(STORAGE_KEY, i18n.language || "en");
      } catch {}
    };
    i18n.on("languageChanged", onChange);

    // استرجاع اللغة المحفوظة من الزيارة السابقة
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if ((saved === "ar" || saved === "en") && saved !== i18n.language) {
      i18n.changeLanguage(saved); // يطلق languageChanged
    } else {
      applyDir();
    }

    return () => {
      i18n.off("languageChanged", onChange);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
