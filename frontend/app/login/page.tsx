"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import AuthBrandPanel from "@/components/AuthBrandPanel";
import { useLanguage } from "@/components/LanguageProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Form field state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await authApi.login({
        username: email,
        password: password,
      });
      setToken(token.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper transition-colors">
      <AuthBrandPanel />

      <div className="relative flex items-center justify-center px-4 py-12">
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6 flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">

          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink">
              {t("login.title")}
            </h1>
            <p className="text-ink-muted mt-1.5 text-sm">
              {t("login.subtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-accent-soft border border-accent rounded-lg animate-fade-in-up">
              <p className="text-sm text-accent-strong">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-paper-raise border border-line
                           text-ink rounded-lg
                           placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-accent
                           transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-paper-raise border border-line
                           text-ink rounded-lg
                           placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-accent
                           transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-strong
                         disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-semibold rounded-lg
                         transition-all hover:-translate-y-0.5"
            >
              {loading ? t("login.submitting") : t("login.submit")}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-8">
            {t("login.noAccount")}{" "}
            <Link href="/register" className="font-medium hover:underline text-accent">
              {t("login.createOne")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
