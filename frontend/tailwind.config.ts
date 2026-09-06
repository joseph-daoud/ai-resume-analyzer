import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-raise": "var(--paper-raise)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "ink-faint": "var(--ink-faint)",
        line: "var(--line)",
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          soft: "var(--accent-soft)",
        },
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift1: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(30px,-20px) scale(1.08)" },
        },
        drift2: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(-25px,25px) scale(0.94)" },
        },
        drift3: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(15px,20px) scale(1.05)" },
        },
        "draw-check": {
          "0%": { strokeDashoffset: "1", opacity: "0" },
          "12%": { opacity: "1" },
          "48%": { strokeDashoffset: "0", opacity: "1" },
          "82%": { strokeDashoffset: "0", opacity: "1" },
          "100%": { strokeDashoffset: "0", opacity: "0" },
        },
        "mark-motion": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg) scale(1)" },
          "25%": { transform: "translateY(-1.5px) rotate(-3deg) scale(1.04)" },
          "50%": { transform: "translateY(0) rotate(0deg) scale(1)" },
          "75%": { transform: "translateY(1px) rotate(3deg) scale(0.97)" },
        },
        "glow-pulse": {
          "0%": { transform: "scale(0.82)", opacity: "0.45" },
          "70%, 100%": { transform: "scale(1.7)", opacity: "0" },
        },
        "badge-glint": {
          "0%, 100%": { boxShadow: "0 0 0 0 transparent" },
          "50%": { boxShadow: "0 0 14px 1px color-mix(in srgb, var(--accent) 35%, transparent)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        drift1: "drift1 13s ease-in-out infinite",
        drift2: "drift2 16s ease-in-out infinite",
        drift3: "drift3 11s ease-in-out infinite",
        "draw-check": "draw-check 3.4s cubic-bezier(0.65, 0, 0.35, 1) infinite",
        "mark-motion": "mark-motion 4.2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3.4s ease-out infinite",
        "badge-glint": "badge-glint 3.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
