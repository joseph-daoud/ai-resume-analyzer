import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { LanguageProvider } from "@/components/LanguageProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Resume Analyzer",
  description: "Intelligent resume analysis powered by NLP and LLMs",
};

// Runs before React hydrates, so the correct theme and language direction
// are set on the very first paint. Without this, a user with dark mode or
// Arabic saved would see the page flash light/LTR for a moment, because
// localStorage isn't available during server rendering.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored ? stored === "dark" : prefersDark;
    if (isDark) document.documentElement.classList.add("dark");

    var locale = localStorage.getItem("locale");
    if (locale === "ar") {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.className} bg-paper text-ink transition-colors`}
      >
        <LanguageProvider>
          <ToastProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
