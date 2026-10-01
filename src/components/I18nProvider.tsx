"use client";

import { ReactNode, useEffect } from "react";
import i18n from "@/i18n";
import { I18nextProvider } from "react-i18next";

export default function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // مزامنة اتجاه الصفحة واللغة مع i18n عند التحميل وعند تغيير اللغة
    const updateDirLang = () => {
      const lang = i18n.language || "en";
      const isRTL = lang.startsWith("ar");
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      if (document.body) {
        document.body.dir = isRTL ? "rtl" : "ltr";
      }
    };

    updateDirLang();

    // الاستماع لتغييرات اللغة من i18n
    i18n.on("languageChanged", updateDirLang);

    return () => {
      i18n.off("languageChanged", updateDirLang);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
