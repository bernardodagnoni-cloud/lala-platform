"use client";

import { createContext, useContext, useState } from "react";
import { translations, type Locale, type Translations } from "@/lib/i18n/translations";

type LanguageContextType = {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: string;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>((initialLocale as Locale) || "en");

  function setLocale(l: Locale) {
    setLocaleState(l);
  }

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
