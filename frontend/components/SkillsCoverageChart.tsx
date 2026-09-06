"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useLanguage } from "./LanguageProvider";
import type { ScoreBreakdown } from "@/types";

interface SkillsCoverageChartProps {
  breakdown: ScoreBreakdown;
}

/**
 * Donut chart showing what fraction of the job's required skills the
 * resume covers. Visualizes the same number as the ATS score card above
 * it — just at a glance instead of as a bare percentage.
 */
export default function SkillsCoverageChart({ breakdown }: SkillsCoverageChartProps) {
  const { t } = useLanguage();
  const matched = breakdown.matched_skills.length;
  const missing = breakdown.missing_skills.length;
  const total = matched + missing;

  if (total === 0) {
    return (
      <p className="text-ink-faint text-sm text-center py-8">
        {t("chart.noSkills")}
      </p>
    );
  }

  const data = [
    { name: t("chart.matched"), value: matched },
    { name: t("chart.missing"), value: missing },
  ];

  return (
    <div className="relative w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
          >
            <Cell fill="var(--chart-matched)" />
            <Cell fill="var(--chart-missing)" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label sits over the donut's hole */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-ink">
          {matched}/{total}
        </span>
        <span className="text-xs text-ink-muted">{t("chart.skillsMatched")}</span>
      </div>
    </div>
  );
}
