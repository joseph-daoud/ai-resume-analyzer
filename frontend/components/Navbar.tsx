"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { useLanguage } from "./LanguageProvider";
import type { User } from "@/types";

interface NavbarProps {
  /**
   * Shows a "← Back to dashboard" link next to the sign-out button.
   * Used on pages that are NOT the dashboard itself.
   */
  showBackLink?: boolean;
}

export default function Navbar({ showBackLink = false }: NavbarProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authApi.me().then(setUser).catch(() => {});
  }, []);

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-40 bg-paper-raise/80 backdrop-blur-md border-b border-line px-6 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="transition hover:opacity-80">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-4">
          {showBackLink && (
            <Link
              href="/dashboard"
              aria-label={t("nav.backToDashboard")}
              title={t("nav.backToDashboard")}
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
                className="w-5 h-5 rtl:rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5"
              >
                <path d="M9 6L3 12l6 6" />
                <path d="M3 12h13a5 5 0 0 0 5-5V6" />
              </svg>
            </Link>
          )}
          {user && (
            <span className="hidden sm:inline text-sm text-ink-muted">
              {user.email}
            </span>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={handleLogout}
            aria-label={t("nav.signOut")}
            title={t("nav.signOut")}
            className="group p-2 rounded-lg border border-transparent text-ink-muted hover:text-white hover:bg-red-600 hover:border-red-600 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 rtl:-scale-x-100 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
