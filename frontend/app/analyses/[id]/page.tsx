"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { analysesApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import type { AnalysisDetail } from "@/types";
import SkillsCoverageChart from "@/components/SkillsCoverageChart";

export default function AnalysisResultsPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    async function poll() {
      try {
        const data = await analysesApi.get(analysisId);
        setAnalysis(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analysis.");
        clearInterval(interval);
      }
    }

    const interval = setInterval(poll, 2000);
    poll();
    return () => clearInterval(interval);

  }, [analysisId, router]);

  function ScoreBar({ label, score, colour }: { label: string; score: number; colour: string }) {
    return (
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{score}/100</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${colour}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  }

  function priorityStyle(priority: number) {
    if (priority === 1) return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300";
    if (priority === 2) return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-300";
    return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar showBackLink />
        <div className="flex items-center justify-center px-4 py-24">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.status === "pending" || analysis.status === "processing") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar showBackLink />
        <div className="flex items-center justify-center px-4 py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-blue-600 dark:border-blue-400 border-t-transparent
                            rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              {analysis?.status === "processing" ? "Analyzing your resume..." : "Starting analysis..."}
            </p>
            <p className="text-gray-400 text-sm mt-1">This usually takes a few seconds.</p>
          </div>
        </div>
      </div>
    );
  }

  if (analysis.status === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar showBackLink />
        <div className="flex items-center justify-center px-4 py-24">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">Analysis failed.</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Something went wrong while processing this analysis.
            </p>
            <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breakdown = analysis.score_breakdown;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar showBackLink />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5">Analysis Results</h2>
          <div className="space-y-4">
            <ScoreBar
              label={`Fit Score${breakdown ? ` — ${breakdown.fit_label}` : ""}`}
              score={analysis.fit_score ?? 0}
              colour="bg-blue-600"
            />
            <ScoreBar
              label={`ATS Score${breakdown ? ` — ${breakdown.ats_label}` : ""}`}
              score={analysis.ats_score ?? 0}
              colour="bg-green-600"
            />
          </div>
        </div>

        {breakdown && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Skills Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <SkillsCoverageChart breakdown={breakdown} />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matched ({breakdown.matched_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {breakdown.matched_skills.length === 0 ? (
                      <span className="text-gray-400 text-sm">None</span>
                    ) : (
                      breakdown.matched_skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-xs
                                                       font-medium rounded-full border border-green-200 dark:border-green-900">
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Missing ({breakdown.missing_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {breakdown.missing_skills.length === 0 ? (
                      <span className="text-gray-400 text-sm">None — great coverage!</span>
                    ) : (
                      breakdown.missing_skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs
                                                       font-medium rounded-full border border-red-200 dark:border-red-900">
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Feedback ({analysis.feedback_items.length})
          </h2>
          {analysis.feedback_items.length === 0 ? (
            <p className="text-gray-400 text-sm">No feedback items were generated.</p>
          ) : (
            <div className="space-y-3">
              {analysis.feedback_items
                .slice()
                .sort((a, b) => a.priority - b.priority)
                .map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg border ${priorityStyle(item.priority)}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {item.section}
                      </span>
                      <span className="text-xs opacity-60">·</span>
                      <span className="text-xs opacity-80">{item.type.replace("_", " ")}</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{item.content}</p>
                  </div>
                ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}