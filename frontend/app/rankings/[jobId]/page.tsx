"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { jobDescriptionsApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import type { RankingItem, JobDescriptionDetail } from "@/types";

export default function RankingResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [jobDescription, setJobDescription] = useState<JobDescriptionDetail | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    let interval: ReturnType<typeof setInterval>;

    async function poll() {
      try {
        const items = await jobDescriptionsApi.getRanking(jobId);
        setRanking(items);
        const stillWorking = items.some(
          (i) => i.status === "pending" || i.status === "processing"
        );
        if (!stillWorking) clearInterval(interval);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ranking.");
        clearInterval(interval);
      } finally {
        setLoading(false);
      }
    }

    // The job title/content only needs to load once.
    jobDescriptionsApi.get(jobId).then(setJobDescription).catch(() => {});

    interval = setInterval(poll, 2500);
    poll();
    return () => clearInterval(interval);
  }, [jobId, router]);

  function StatusBadge({ status }: { status: string }) {
    const colours: Record<string, string> = {
      completed:  "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      pending:    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      failed:     "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colours[status] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
        {status}
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

  const stillWorking = ranking.some(
    (i) => i.status === "pending" || i.status === "processing"
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar showBackLink />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Candidate Ranking
          </h1>
          {jobDescription && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">{jobDescription.title}</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading ranking...</p>
          ) : ranking.length === 0 ? (
            <p className="text-gray-400 text-sm">No candidates have been ranked against this job description yet.</p>
          ) : (
            <>
              {stillWorking && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Scoring candidates — this list will keep updating.
                </div>
              )}
              <ul className="space-y-2">
                {ranking.map((item, index) => (
                  <li key={item.analysis_id}>
                    <Link
                      href={`/analyses/${item.analysis_id}`}
                      className="flex items-center justify-between gap-4 p-3.5 bg-gray-50 dark:bg-gray-700
                                 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 w-6 shrink-0">
                          {medal(index) ?? index + 1}
                        </span>
                        <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                          {item.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {item.fit_score !== null && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Fit: <strong>{item.fit_score}</strong>
                            {item.ats_score !== null && <> · ATS: <strong>{item.ats_score}</strong></>}
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

        <p className="text-xs text-gray-400">
          Click a candidate to see their full skills breakdown, or to generate detailed written feedback for them.
        </p>

      </main>
    </div>
  );
}
