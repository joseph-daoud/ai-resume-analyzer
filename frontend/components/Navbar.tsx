"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authApi.me().then(setUser).catch(() => {});
  }, []);

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          AI Resume Analyzer
        </h1>
        <div className="flex items-center gap-4">
          {showBackLink && (
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              ← Back to dashboard
            </Link>
          )}
          {user && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </span>
          )}
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}