import Logo from "./Logo";
import { useLanguage } from "./LanguageProvider";

/**
 * Warm branding panel shown on the left of auth pages (lg+ only) — a
 * lighter, calmer counterpart to the form side, with slow drifting
 * background blobs as the page's one ambient animated moment.
 */
export default function AuthBrandPanel() {
  const { t } = useLanguage();
  const features = [t("brand.feature1"), t("brand.feature2"), t("brand.feature3")];

  return (
    <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-paper-raise px-12 py-12 min-h-screen">
      <div
        className="absolute rounded-full pointer-events-none animate-drift1"
        style={{
          width: 260, height: 260, top: -60, left: -60,
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          opacity: 0.22, filter: "blur(50px)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none animate-drift2"
        style={{
          width: 240, height: 240, bottom: -50, right: -30,
          background: "radial-gradient(circle, #cf9a3e 0%, transparent 70%)",
          opacity: 0.18, filter: "blur(50px)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none animate-drift3"
        style={{
          width: 200, height: 200, bottom: 80, left: "40%",
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          opacity: 0.14, filter: "blur(50px)",
        }}
      />

      <div className="relative">
        <Logo size="md" />
      </div>

      <div className="relative max-w-sm">
        <h2 className="text-3xl font-bold text-ink leading-tight">
          {t("brand.headline1")}{" "}
          <span style={{ color: "var(--accent)" }}>{t("brand.headline2")}</span>
        </h2>
        <p className="text-ink-muted text-sm mt-3 leading-relaxed">
          {t("brand.copy")}
        </p>

        <ul className="mt-8 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-ink-muted">
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-ink-faint">
        {t("brand.copyright", { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}
