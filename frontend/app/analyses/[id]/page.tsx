"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { analysesApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/components/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";
import type { AnalysisDetail } from "@/types";
import SkillsCoverageChart from "@/components/SkillsCoverageChart";

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-soft text-accent-strong shrink-0">
      {children}
    </span>
  );
}

// score_breakdown labels and feedback section/type are fixed backend enums —
// map them to translation keys rather than relying on the raw English string.
const SCORE_LABEL_KEYS: Record<string, TranslationKey> = {
  Excellent: "score.excellent",
  Good: "score.good",
  Fair: "score.fair",
  Poor: "score.poor",
};
const SECTION_KEYS: Record<string, TranslationKey> = {
  summary: "section.summary",
  experience: "section.experience",
  skills: "section.skills",
  education: "section.education",
  formatting: "section.formatting",
};
const TYPE_KEYS: Record<string, TranslationKey> = {
  improvement: "type.improvement",
  missing_keyword: "type.missing_keyword",
  strength: "type.strength",
};

export default function AnalysisResultsPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [error, setError] = useState("");
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

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
        setError(err instanceof Error ? err.message : t("analysis.loadFailed"));
        clearInterval(interval);
      }
    }

    const interval = setInterval(poll, 2000);
    poll();
    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately runs once per analysisId change
  }, [analysisId, router]);

  async function handleGenerateFeedback() {
    setGeneratingFeedback(true);
    try {
      const updated = await analysesApi.generateFeedback(analysisId);
      setAnalysis(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("analysis.generateFeedbackFailed"), "error");
    } finally {
      setGeneratingFeedback(false);
    }
  }

  function translateScoreLabel(label: string) {
    const key = SCORE_LABEL_KEYS[label];
    return key ? t(key) : label;
  }

  function ScoreBar({ label, score }: { label: string; score: number }) {
    return (
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-ink">{label}</span>
          <span className="text-sm font-semibold text-ink">{score}/100</span>
        </div>
        <div className="w-full h-2.5 bg-paper rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 bg-accent"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  }

  function priorityStyle(priority: number) {
    if (priority === 1) return "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300";
    if (priority === 2) return "bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-300";
    return "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper transition-colors">
        <Navbar showBackLink />
        <div className="flex items-center justify-center px-4 py-24">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Link href="/dashboard" className="text-accent hover:underline">
              {t("analysis.backToDashboard")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.status === "pending" || analysis.status === "processing") {
    return (
      <div className="min-h-screen bg-paper transition-colors">
        <Navbar showBackLink />
        <div className="flex items-center justify-center px-4 py-24">
          <div className="text-center">
            <div className="relative w-14 h-14 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-accent/30 animate-glow-pulse" />
              <div className="w-14 h-14 border-[3px] border-accent border-t-transparent
                              rounded-full animate-spin" />
            </div>
            <p className="text-ink-muted font-medium">
              {analysis?.status === "processing" ? t("analysis.analyzing") : t("analysis.starting")}
            </p>
            <p className="text-ink-faint text-sm mt-1">{t("analysis.eta")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (analysis.status === "failed") {
    return (
      <div className="min-h-screen bg-paper transition-colors">
        <Navbar showBackLink />
        <div className="flex items-center justify-center px-4 py-24">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">{t("analysis.failedTitle")}</p>
            <p className="text-ink-muted text-sm mb-4">
              {t("analysis.failedMsg")}
            </p>
            <Link href="/dashboard" className="text-accent hover:underline">
              {t("analysis.backToDashboard")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breakdown = analysis.score_breakdown;

  return (
    <div className="min-h-screen bg-paper transition-colors">
      <Navbar showBackLink />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-fade-in-up">

        <div className="bg-paper-raise rounded-2xl border border-line p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <SectionIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                <path d="M3 3v18h18" />
                <path d="M7 15l4-6 4 3 5-8" />
              </svg>
            </SectionIcon>
            <h2 className="text-lg font-semibold text-ink">{t("analysis.results")}</h2>
          </div>
          <div className="space-y-4">
            <ScoreBar
              label={`${t("analysis.fitScore")}${breakdown ? ` — ${translateScoreLabel(breakdown.fit_label)}` : ""}`}
              score={analysis.fit_score ?? 0}
            />
            <ScoreBar
              label={`${t("analysis.atsScore")}${breakdown ? ` — ${translateScoreLabel(breakdown.ats_label)}` : ""}`}
              score={analysis.ats_score ?? 0}
            />
          </div>
        </div>

        {breakdown && (
          <div className="bg-paper-raise rounded-2xl border border-line p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <SectionIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </SectionIcon>
              <h2 className="text-lg font-semibold text-ink">{t("analysis.skillsBreakdown")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <SkillsCoverageChart breakdown={breakdown} />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-ink mb-2">
                    {t("analysis.matched", { count: breakdown.matched_skills.length })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {breakdown.matched_skills.length === 0 ? (
                      <span className="text-ink-faint text-sm">{t("analysis.none")}</span>
                    ) : (
                      breakdown.matched_skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-xs
                                                       font-medium rounded-full border border-green-200 dark:border-green-900">
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink mb-2">
                    {t("analysis.missing", { count: breakdown.missing_skills.length })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {breakdown.missing_skills.length === 0 ? (
                      <span className="text-ink-faint text-sm">{t("analysis.greatCoverage")}</span>
                    ) : (
                      breakdown.missing_skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs
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

        <div className="bg-paper-raise rounded-2xl border border-line p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <SectionIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                <path d="M12 2l1.9 5.8L20 9.5l-5.6 2L12 17l-2.4-5.5L4 9.5l6.1-1.7z" />
              </svg>
            </SectionIcon>
            <h2 className="text-lg font-semibold text-ink">
              {t("analysis.feedback", { count: analysis.feedback_items.length })}
            </h2>
          </div>
          {analysis.feedback_items.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-ink-faint text-sm mb-3">
                {t("analysis.noFeedbackYet")}
              </p>
              <button
                onClick={handleGenerateFeedback}
                disabled={generatingFeedback}
                className="px-4 py-2 bg-accent hover:bg-accent-strong disabled:opacity-60
                           text-white text-sm font-semibold rounded-lg transition-all"
              >
                {generatingFeedback ? t("analysis.generating") : t("analysis.generateFeedback")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {analysis.feedback_items
                .slice()
                .sort((a, b) => a.priority - b.priority)
                .map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg border ${priorityStyle(item.priority)}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {SECTION_KEYS[item.section] ? t(SECTION_KEYS[item.section]) : item.section}
                      </span>
                      <span className="text-xs opacity-60">·</span>
                      <span className="text-xs opacity-80">
                        {TYPE_KEYS[item.type] ? t(TYPE_KEYS[item.type]) : item.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-ink">{item.content}</p>
                  </div>
                ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
