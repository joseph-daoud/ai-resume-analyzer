"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { jobDescriptionsApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";
import type { RankingItem, JobDescriptionDetail } from "@/types";

const STATUS_KEYS: Record<string, TranslationKey> = {
  completed: "status.completed",
  processing: "status.processing",
  pending: "status.pending",
  failed: "status.failed",
};

export default function RankingResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const { t } = useLanguage();

  const [jobDescription, setJobDescription] = useState<JobDescriptionDetail | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const intervalRef: { current: ReturnType<typeof setInterval> | null } = { current: null };

    async function poll() {
      try {
        const items = await jobDescriptionsApi.getRanking(jobId);
        setRanking(items);
        const stillWorking = items.some(
          (i) => i.status === "pending" || i.status === "processing"
        );
        if (!stillWorking && intervalRef.current) clearInterval(intervalRef.current);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("rankings.loadFailed"));
        if (intervalRef.current) clearInterval(intervalRef.current);
      } finally {
        setLoading(false);
      }
    }

    // The job title/content only needs to load once.
    jobDescriptionsApi.get(jobId).then(setJobDescription).catch(() => {});

    intervalRef.current = setInterval(poll, 2500);
    poll();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately runs once per jobId change
  }, [jobId, router]);

  function StatusBadge({ status }: { status: string }) {
    const colours: Record<string, string> = {
      completed:  "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      pending:    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      failed:     "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };
    const key = STATUS_KEYS[status];
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colours[status] ?? "bg-paper text-ink-muted"}`}>
        {key ? t(key) : status}
      </span>
    );
  }

  function medal(index: number) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
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

  const stillWorking = ranking.some(
    (i) => i.status === "pending" || i.status === "processing"
  );

  return (
    <div className="min-h-screen bg-paper transition-colors">
      <Navbar showBackLink />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6 animate-fade-in-up">

        <div>
          <h1 className="text-2xl font-bold text-ink">
            {t("rankings.title")}
          </h1>
          {jobDescription && (
            <p className="text-ink-muted mt-1">{jobDescription.title}</p>
          )}
        </div>

        <div className="bg-paper-raise rounded-2xl border border-line p-6 shadow-sm">
          {loading ? (
            <p className="text-ink-muted text-sm">{t("rankings.loading")}</p>
          ) : ranking.length === 0 ? (
            <p className="text-ink-faint text-sm">{t("rankings.empty")}</p>
          ) : (
            <>
              {stillWorking && (
                <div className="flex items-center gap-2 mb-4 text-sm text-ink-muted">
                  <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  {t("rankings.scoring")}
                </div>
              )}
              <ul className="space-y-2">
                {ranking.map((item, index) => (
                  <li key={item.analysis_id}>
                    <Link
                      href={`/analyses/${item.analysis_id}`}
                      className="flex items-center justify-between gap-4 p-3.5 bg-paper
                                 hover:bg-paper rounded-lg transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-semibold text-ink-faint w-6 shrink-0">
                          {medal(index) ?? index + 1}
                        </span>
                        <span className="text-sm text-ink truncate">
                          {item.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {item.fit_score !== null && (
                          <span className="text-sm text-ink-muted">
                            {t("dashboard.fitLabel")} <strong className="text-ink">{item.fit_score}</strong>
                            {item.ats_score !== null && <> · {t("dashboard.atsLabel")} <strong className="text-ink">{item.ats_score}</strong></>}
                          </span>
                        )}
                        <StatusBadge status={item.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <p className="text-xs text-ink-faint">
          {t("rankings.footerHint")}
        </p>

      </main>
    </div>
  );
}
