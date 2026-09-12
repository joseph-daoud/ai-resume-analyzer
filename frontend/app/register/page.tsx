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
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("job_seeker");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("register.errorShort"));
      return;
    }

    setLoading(true);

    try {
      await authApi.register({ email, password, full_name: fullName, role });
      const token = await authApi.login({ username: email, password });
      setToken(token.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register.error"));
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
              {t("register.title")}
            </h1>
            <p className="text-ink-muted mt-1.5 text-sm">
              {t("register.subtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-accent-soft border border-accent rounded-lg animate-fade-in-up">
              <p className="text-sm text-accent-strong">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-ink mb-1">
                {t("register.fullName")}
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("register.fullNamePlaceholder")}
                className="w-full px-4 py-2.5 bg-paper-raise border border-line
                           text-ink placeholder-ink-faint
                           rounded-lg focus:outline-none
                           focus:ring-2 focus:ring-accent
                           transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                {t("register.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-paper-raise border border-line
                           text-ink placeholder-ink-faint
                           rounded-lg focus:outline-none
                           focus:ring-2 focus:ring-accent
                           transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
                {t("register.password")}
              </label>
              <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("register.passwordPlaceholder")}
                className="w-full px-4 py-2.5 pr-10 bg-paper-raise border border-line
                           text-ink placeholder-ink-faint
                           rounded-lg focus:outline-none
                           focus:ring-2 focus:ring-accent
                           transition-colors"
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                {t("register.role")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("job_seeker")}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition ${
                    role === "job_seeker"
                      ? "bg-accent border-accent text-white"
                      : "bg-paper-raise border-line text-ink-muted hover:border-accent"
                  }`}
                >
                  {t("register.roleJobSeeker")}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("hiring_manager")}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition ${
                    role === "hiring_manager"
                      ? "bg-accent border-accent text-white"
                      : "bg-paper-raise border-line text-ink-muted hover:border-accent"
                  }`}
                >
                  {t("register.roleHiringManager")}
                </button>
              </div>
              {role === "hiring_manager" && (
                <p className="text-xs text-ink-faint mt-1.5">
                  {t("register.roleHiringManagerHelp")}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-strong
                         disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-semibold rounded-lg
                         transition-all hover:-translate-y-0.5"
            >
              {loading ? t("register.submitting") : t("register.submit")}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-8">
            {t("register.haveAccount")}{" "}
            <Link href="/login" className="font-medium hover:underline text-accent">
              {t("register.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
