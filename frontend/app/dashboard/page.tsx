"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resumesApi, jobDescriptionsApi, analysesApi, authApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useLanguage } from "@/components/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";
import type { Resume, JobDescription, Analysis, User } from "@/types";

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-soft text-accent-strong shrink-0">
      {children}
    </span>
  );
}

const STATUS_KEYS: Record<string, TranslationKey> = {
  done: "status.done",
  completed: "status.completed",
  processing: "status.processing",
  uploaded: "status.uploaded",
  pending: "status.pending",
  failed: "status.failed",
};

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const confirmAction = useConfirm();
  const { t } = useLanguage();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [loadingPage, setLoadingPage] = useState(true);
  const [uploading, setUploading] = useState(false);

  // ── Bulk ranking form state (hiring managers only) ────────────────────────────
  const [bulkUploading, setBulkUploading] = useState(false);
  const [selectedForRanking, setSelectedForRanking] = useState<Set<string>>(new Set());
  const [rankingJobId, setRankingJobId] = useState("");
  const [startingRanking, setStartingRanking] = useState(false);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // ── Job description form + detail-view state ─────────────────────────────────
  const [jobTitle, setJobTitle] = useState("");
  const [jobContent, setJobContent] = useState("");
  const [savingJob, setSavingJob] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [jobContents, setJobContents] = useState<Record<string, string>>({});
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);

  // ── Analysis form state ──────────────────────────────────────────────────────
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [runningAnalysis, setRunningAnalysis] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately runs once on mount only
  }, []);

  async function loadDashboard() {
    try {
      const [user, resumeData, jobData, analysisData] = await Promise.all([
        authApi.me(),
        resumesApi.list(),
        jobDescriptionsApi.list(),
        analysesApi.list(),
      ]);
      setCurrentUser(user);
      setResumes(resumeData);
      setJobDescriptions(jobData);
      setAnalyses(analysisData);
    } catch {
      showToast(t("dashboard.loadFailed"), "error");
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    const resumesPending = resumes.some(
      (r) => r.status === "uploaded" || r.status === "processing"
    );
    const analysesPending = analyses.some(
      (a) => a.status === "pending" || a.status === "processing"
    );

    if (!resumesPending && !analysesPending) return;

    const interval = setInterval(async () => {
      try {
        const [updatedResumes, updatedAnalyses] = await Promise.all([
          resumesApi.list(),
          analysesApi.list(),
        ]);
        setResumes(updatedResumes);
        setAnalyses(updatedAnalyses);
      } catch {
        // A failed background refresh shouldn't interrupt the user with an error.
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [resumes, analyses]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const newResume = await resumesApi.upload(file);
      setResumes((prev) => [newResume, ...prev]);
      showToast(t("dashboard.uploadSuccess"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("dashboard.uploadFailed"), "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteResume(id: string) {
    const confirmed = await confirmAction({
      title: t("dashboard.deleteResumeTitle"),
      message: t("dashboard.deleteResumeMsg"),
      confirmLabel: t("confirm.delete"),
      danger: true,
    });
    if (!confirmed) return;
    try {
      await resumesApi.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      showToast(t("dashboard.resumeDeleted"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("dashboard.resumeDeleteFailed"), "error");
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    if (!jobTitle.trim() || !jobContent.trim()) return;

    setSavingJob(true);
    try {
      const newJob = await jobDescriptionsApi.create({
        title: jobTitle,
        content: jobContent,
      });
      setJobDescriptions((prev) => [newJob, ...prev]);
      setJobTitle("");
      setJobContent("");
      showToast(t("dashboard.jobSaved"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("dashboard.jobSaveFailed"), "error");
    } finally {
      setSavingJob(false);
    }
  }

  async function handleDeleteJob(id: string) {
    const confirmed = await confirmAction({
      title: t("dashboard.deleteJobTitle"),
      message: t("dashboard.deleteResumeMsg"),
      confirmLabel: t("confirm.delete"),
      danger: true,
    });
    if (!confirmed) return;
    try {
      await jobDescriptionsApi.delete(id);
      setJobDescriptions((prev) => prev.filter((j) => j.id !== id));
      if (expandedJobId === id) setExpandedJobId(null);
      showToast(t("dashboard.jobDeleted"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("dashboard.jobDeleteFailed"), "error");
    }
  }

  async function handleToggleJob(id: string) {
    if (expandedJobId === id) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(id);

    if (!jobContents[id]) {
      setLoadingJobId(id);
      try {
        const detail = await jobDescriptionsApi.get(id);
        setJobContents((prev) => ({ ...prev, [id]: detail.content }));
      } catch {
        setJobContents((prev) => ({ ...prev, [id]: t("dashboard.contentLoadFailed") }));
      } finally {
        setLoadingJobId(null);
      }
    }
  }

  async function handleRunAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedResumeId || !selectedJobId) return;

    setRunningAnalysis(true);
    try {
      const analysis = await analysesApi.create({
        resume_id: selectedResumeId,
        job_description_id: selectedJobId,
      });
      router.push(`/analyses/${analysis.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("dashboard.analysisFailed"), "error");
      setRunningAnalysis(false);
    }
  }

  async function handleBulkFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setBulkUploading(true);
    try {
      const newResumes = await resumesApi.bulkUpload(files);
      setResumes((prev) => [...newResumes, ...prev]);
      // Pre-select the ones just uploaded so they're ready to rank.
      setSelectedForRanking((prev) => {
        const next = new Set(prev);
        newResumes.forEach((r) => next.add(r.id));
        return next;
      });
      showToast(t("dashboard.bulkUploadSuccess", { count: newResumes.length }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("dashboard.bulkUploadFailed"), "error");
    } finally {
      setBulkUploading(false);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
    }
  }

  function toggleResumeForRanking(id: string) {
    setSelectedForRanking((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleStartRanking(e: React.FormEvent) {
    e.preventDefault();
    if (!rankingJobId || selectedForRanking.size === 0) return;

    setStartingRanking(true);
    try {
      await jobDescriptionsApi.rank(rankingJobId, Array.from(selectedForRanking));
      router.push(`/rankings/${rankingJobId}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("dashboard.rankingFailed"), "error");
      setStartingRanking(false);
    }
  }

  function StatusBadge({ status }: { status: string }) {
    const colours: Record<string, string> = {
      done:       "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      completed:  "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      uploaded:   "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
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

  const doneResumes = resumes.filter((r) => r.status === "done");

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-muted text-sm">{t("dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-fade-in-up">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Resumes */}
          <div className="bg-paper-raise rounded-2xl border border-line p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <SectionIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M9 13h6M9 17h6" />
                  </svg>
                </SectionIcon>
                <h2 className="text-lg font-semibold text-ink">{t("dashboard.resumes")}</h2>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-accent hover:bg-accent-strong disabled:opacity-60
                           text-white text-sm font-semibold rounded-lg transition-all"
              >
                {uploading ? t("dashboard.uploading") : t("dashboard.upload")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {resumes.length === 0 ? (
              <p className="text-ink-faint text-sm">{t("dashboard.noResumes")}</p>
            ) : (
              <ul className="space-y-2">
                {resumes.map((resume) => (
                  <li key={resume.id}
                      className="flex items-center justify-between p-3 bg-paper rounded-lg transition-colors">
                    <span className="text-sm text-ink truncate max-w-[160px]">
                      {resume.filename}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={resume.status} />
                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        title={t("dashboard.deleteResume")}
                        className="text-ink-faint hover:text-red-600 dark:hover:text-red-400 text-sm transition px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Job Descriptions */}
          <div className="bg-paper-raise rounded-2xl border border-line p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <SectionIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </SectionIcon>
              <h2 className="text-lg font-semibold text-ink">{t("dashboard.jobDescriptions")}</h2>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 mb-4">
              <input
                type="text"
                placeholder={t("dashboard.jobTitlePlaceholder")}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 bg-paper-raise border border-line
                           text-ink placeholder-ink-faint
                           rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
              />
              <textarea
                placeholder={t("dashboard.jobContentPlaceholder")}
                value={jobContent}
                onChange={(e) => setJobContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-paper-raise border border-line
                           text-ink placeholder-ink-faint
                           rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-colors"
              />
              <button
                type="submit"
                disabled={savingJob || !jobTitle.trim() || !jobContent.trim()}
                className="w-full py-2 bg-accent hover:bg-accent-strong disabled:opacity-60
                           text-white text-sm font-semibold rounded-lg transition-all"
              >
                {savingJob ? t("dashboard.saving") : t("dashboard.saveJob")}
              </button>
            </form>

            {jobDescriptions.length === 0 ? (
              <p className="text-ink-faint text-sm">{t("dashboard.noJobs")}</p>
            ) : (
              <ul className="space-y-2">
                {jobDescriptions.map((job) => (
                  <li key={job.id} className="bg-paper rounded-lg transition-colors">
                    <div className="flex items-center justify-between p-3">
                      <button
                        onClick={() => handleToggleJob(job.id)}
                        className="text-sm text-ink hover:text-accent transition text-left flex-1"
                      >
                        {expandedJobId === job.id ? "▾" : "▸"} {job.title}
                      </button>
                      {currentUser?.role === "hiring_manager" && (
                        <Link
                          href={`/rankings/${job.id}`}
                          title={t("dashboard.viewRanking")}
                          className="text-xs text-ink-faint hover:text-accent transition px-1 whitespace-nowrap"
                        >
                          {t("dashboard.viewRankingLink")}
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        title={t("dashboard.deleteJob")}
                        className="text-ink-faint hover:text-red-600 dark:hover:text-red-400 text-sm transition px-1"
                      >
                        ✕
                      </button>
                    </div>
                    {expandedJobId === job.id && (
                      <div className="px-3 pb-3 text-sm text-ink-muted whitespace-pre-wrap">
                        {loadingJobId === job.id ? t("dashboard.contentLoading") : jobContents[job.id]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Run Analysis */}
        <div className="bg-paper-raise rounded-2xl border border-line p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <SectionIcon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                <path d="M12 2l1.9 5.8L20 9.5l-5.6 2L12 17l-2.4-5.5L4 9.5l6.1-1.7z" />
              </svg>
            </SectionIcon>
            <h2 className="text-lg font-semibold text-ink">{t("dashboard.runAnalysis")}</h2>
          </div>

          {doneResumes.length === 0 || jobDescriptions.length === 0 ? (
            <p className="text-ink-faint text-sm py-2">
              {doneResumes.length === 0 && jobDescriptions.length === 0
                ? t("dashboard.emptyBoth")
                : doneResumes.length === 0
                ? t("dashboard.emptyResume")
                : t("dashboard.emptyJob")}
            </p>
          ) : (
            <form onSubmit={handleRunAnalysis} className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="flex-1 px-3 py-2 border border-line rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent bg-paper-raise
                           text-ink transition-colors"
              >
                <option value="">{t("dashboard.selectResume")}</option>
                {doneResumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.filename}</option>
                ))}
              </select>

              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="flex-1 px-3 py-2 border border-line rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent bg-paper-raise
                           text-ink transition-colors"
              >
                <option value="">{t("dashboard.selectJob")}</option>
                {jobDescriptions.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={runningAnalysis || !selectedResumeId || !selectedJobId}
                className="px-6 py-2 bg-accent hover:bg-accent-strong disabled:opacity-60
                           text-white text-sm font-semibold rounded-lg
                           transition-all whitespace-nowrap"
              >
                {runningAnalysis ? t("dashboard.starting") : t("dashboard.runAnalysisBtn")}
              </button>
            </form>
          )}
        </div>

        {/* Rank Candidates (hiring managers only) */}
        {currentUser?.role === "hiring_manager" && (
          <div className="bg-paper-raise rounded-2xl border border-line p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <SectionIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                    <path d="M8 21h8M12 17v4M17 3H7v6a5 5 0 0 0 10 0V3z" />
                    <path d="M17 5h3a2 2 0 0 1-2 4M7 5H4a2 2 0 0 0 2 4" />
                  </svg>
                </SectionIcon>
                <div>
                  <h2 className="text-lg font-semibold text-ink">{t("dashboard.rankCandidates")}</h2>
                  <p className="text-sm text-ink-faint mt-0.5">
                    {t("dashboard.rankCandidatesSubtitle")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => bulkFileInputRef.current?.click()}
                disabled={bulkUploading}
                className="px-4 py-2 bg-accent hover:bg-accent-strong disabled:opacity-60
                           text-white text-sm font-semibold rounded-lg transition-all whitespace-nowrap"
              >
                {bulkUploading ? t("dashboard.uploading") : t("dashboard.uploadResumes")}
              </button>
              <input
                ref={bulkFileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                multiple
                className="hidden"
                onChange={handleBulkFileChange}
              />
            </div>

            {resumes.length === 0 ? (
              <p className="text-ink-faint text-sm py-2">{t("dashboard.rankingNeedsUpload")}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-ink mb-2">
                  {t("dashboard.candidatesSelected", { count: selectedForRanking.size })}
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1 mb-4 pr-1">
                  {resumes.map((resume) => (
                    <label
                      key={resume.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors ${
                        resume.status === "done"
                          ? "bg-paper cursor-pointer"
                          : "bg-paper opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedForRanking.has(resume.id)}
                        disabled={resume.status !== "done"}
                        onChange={() => toggleResumeForRanking(resume.id)}
                        className="rounded accent-accent"
                      />
                      <span className="text-ink truncate flex-1">{resume.filename}</span>
                      <StatusBadge status={resume.status} />
                    </label>
                  ))}
                </div>

                <form onSubmit={handleStartRanking} className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={rankingJobId}
                    onChange={(e) => setRankingJobId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-line rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-accent bg-paper-raise
                               text-ink transition-colors"
                  >
                    <option value="">{t("dashboard.selectJob")}</option>
                    {jobDescriptions.map((j) => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={startingRanking || !rankingJobId || selectedForRanking.size === 0}
                    className="px-6 py-2 bg-accent hover:bg-accent-strong disabled:opacity-60
                               text-white text-sm font-semibold rounded-lg transition-all whitespace-nowrap"
                  >
                    {startingRanking
                      ? t("dashboard.starting")
                      : selectedForRanking.size > 0
                      ? t("dashboard.rankButton", { count: selectedForRanking.size })
                      : t("dashboard.rankButtonEmpty")}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {analyses.length > 0 && (
          <div className="bg-paper-raise rounded-2xl border border-line p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <SectionIcon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <path d="M3 3v18h18" />
                  <path d="M7 15l4-6 4 3 5-8" />
                </svg>
              </SectionIcon>
              <h2 className="text-lg font-semibold text-ink">{t("dashboard.pastAnalyses")}</h2>
            </div>
            <ul className="space-y-2">
              {analyses.map((analysis) => (
                <li key={analysis.id}>
                  <Link
                    href={`/analyses/${analysis.id}`}
                    className="flex items-center justify-between p-3 bg-paper
                               hover:bg-paper rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <StatusBadge status={analysis.status} />
                      {analysis.fit_score !== null && (
                        <span className="text-sm text-ink-muted">
                          {t("dashboard.fitLabel")} <strong className="text-ink">{analysis.fit_score}</strong> · {t("dashboard.atsLabel")} <strong className="text-ink">{analysis.ats_score}</strong>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink-faint">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

      </main>
    </div>
  );
}
