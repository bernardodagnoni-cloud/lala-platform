"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "./language-provider";
import type { Locale } from "@/lib/i18n/translations";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "es", label: "ES" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const router = useRouter();

  function switchTo(l: Locale) {
    document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000`;
    setLocale(l);
    router.refresh();
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchTo(code)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            locale === code
              ? "font-bold bg-white/20 text-current"
              : "opacity-50 hover:opacity-80"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
