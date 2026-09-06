"use client";

import { useLanguage } from "./LanguageProvider";

/**
 * EN / AR toggle, icon-only to match ThemeToggle. Sits next to it in the
 * navbar and on the auth pages.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  function toggle() {
    setLocale(locale === "en" ? "ar" : "en");
  }

  return (
    <button
      onClick={toggle}
      aria-label={t("lang.switch")}
      title={t("lang.switch")}
      className="group p-2 rounded-lg border border-transparent text-ink-muted hover:text-white hover:bg-accent hover:border-accent hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </button>
  );
}
