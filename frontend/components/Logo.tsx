interface LogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showWordmark?: boolean;
  className?: string;
}

const SIZES = {
  sm: { badge: 38, mark: 22, radius: 11, strokeLeg: 2.8, strokeCheck: 2.6, word: "13.5px" },
  md: { badge: 52, mark: 30, radius: 14, strokeLeg: 2.6, strokeCheck: 2.4, word: "16px" },
  lg: { badge: 68, mark: 40, radius: 18, strokeLeg: 2.4, strokeCheck: 2.2, word: "1.5rem" },
};

/**
 * Brand mark: an "A" (Analyzer) with a checkmark woven into its crossbar.
 * The legs stay static ink so the mark reads calm at rest; the checkmark
 * draws itself in on a loop as the one signature animated detail, backed
 * by a soft glow pulse and a gentle tilt/scale wobble on the whole mark.
 */
export default function Logo({
  size = "md",
  animated = true,
  showWordmark = true,
  className = "",
}: LogoProps) {
  const { badge, mark, radius, strokeLeg, strokeCheck, word } = SIZES[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`logo-badge relative flex items-center justify-center bg-paper-raise border border-line ${
          animated ? "animate-badge-glint" : ""
        }`}
        style={{ width: badge, height: badge, borderRadius: radius }}
      >
        {animated && (
          <span
            className="glow absolute rounded-[inherit] pointer-events-none animate-glow-pulse"
            style={{
              inset: -Math.round(badge * 0.15),
              background: "radial-gradient(circle, var(--accent) 0%, transparent 72%)",
              opacity: 0.5,
            }}
          />
        )}
        <svg
          width={mark}
          height={mark}
          viewBox="0 0 32 32"
          fill="none"
          className={`relative ${animated ? "animate-mark-motion" : ""}`}
          style={{ transformOrigin: "50% 60%" }}
        >
          <path d="M9 25L16 7" stroke="var(--ink)" strokeWidth={strokeLeg} strokeLinecap="round" />
          <path d="M23 25L16 7" stroke="var(--ink)" strokeWidth={strokeLeg} strokeLinecap="round" />
          <path
            className={animated ? "a-check animate-draw-check" : ""}
            d="M11.5 18.5L14.5 21.5L21 14"
            stroke="var(--accent)"
            strokeWidth={strokeCheck}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={animated ? { strokeDasharray: 1, strokeDashoffset: 1 } : undefined}
          />
        </svg>
      </div>

      {showWordmark && (
        <span
          className="font-semibold tracking-tight text-ink whitespace-nowrap"
          style={{ fontSize: word }}
        >
          AI <span style={{ color: "var(--accent)" }}>Resume</span> Analyzer
        </span>
      )}
    </div>
  );
}
