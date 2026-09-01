"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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
  const matched = breakdown.matched_skills.length;
  const missing = breakdown.missing_skills.length;
  const total = matched + missing;

  if (total === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        No required skills were detected in the job description.
      </p>
    );
  }

  const data = [
    { name: "Matched", value: matched },
    { name: "Missing", value: missing },
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
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {matched}/{total}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">skills matched</span>
      </div>
    </div>
  );
}