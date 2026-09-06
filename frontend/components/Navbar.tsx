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
              className="text-sm text-ink-muted hover:text-accent transition flex items-center gap-1"
            >
              <span aria-hidden className="rtl:rotate-180">←</span> {t("nav.backToDashboard")}
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
            className="text-sm font-medium text-ink-muted hover:text-red-600 dark:hover:text-red-400 transition"
          >
            {t("nav.signOut")}
          </button>
        </div>
      </div>
    </nav>
  );
}
