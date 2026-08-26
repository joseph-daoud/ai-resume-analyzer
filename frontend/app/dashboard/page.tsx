"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resumesApi, jobDescriptionsApi, analysesApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import type { Resume, JobDescription, Analysis } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const confirmAction = useConfirm();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [loadingPage, setLoadingPage] = useState(true);
  const [uploading, setUploading] = useState(false);

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
  }, []);

  async function loadDashboard() {
    try {
      const [resumeData, jobData, analysisData] = await Promise.all([
        resumesApi.list(),
        jobDescriptionsApi.list(),
        analysesApi.list(),
      ]);
      setResumes(resumeData);
      setJobDescriptions(jobData);
      setAnalyses(analysisData);
    } catch {
      showToast("Failed to load dashboard. Please refresh.", "error");
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
      showToast("Resume uploaded — processing now.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteResume(id: string) {
    const confirmed = await confirmAction({
      title: "Delete resume?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await resumesApi.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      showToast("Resume deleted.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete resume.", "error");
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
      showToast("Job description saved.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save job description.", "error");
    } finally {
      setSavingJob(false);
    }
  }

  async function handleDeleteJob(id: string) {
    const confirmed = await confirmAction({
      title: "Delete job description?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await jobDescriptionsApi.delete(id);
      setJobDescriptions((prev) => prev.filter((j) => j.id !== id));
      if (expandedJobId === id) setExpandedJobId(null);
      showToast("Job description deleted.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete job description.", "error");
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
        setJobContents((prev) => ({ ...prev, [id]: "Failed to load content." }));
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
      showToast(err instanceof Error ? err.message : "Failed to start analysis.", "error");
      setRunningAnalysis(false);
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
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colours[status] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
        {status}
      </span>
    );
  }

  const doneResumes = resumes.filter((r) => r.status === "done");

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resumes</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                           text-white text-sm font-medium rounded-lg transition"
              >
                {uploading ? "Uploading..." : "Upload Resume"}
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
              <p className="text-gray-400 text-sm">No resumes yet. Upload one to get started.</p>
            ) : (
              <ul className="space-y-2">
                {resumes.map((resume) => (
                  <li key={resume.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
                      {resume.filename}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={resume.status} />
                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        title="Delete resume"
                        className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-sm transition px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Job Descriptions</h2>

            <form onSubmit={handleCreateJob} className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Job title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                           text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                           rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <textarea
                placeholder="Paste the full job description here..."
                value={jobContent}
                onChange={(e) => setJobContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                           text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                           rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
              />
              <button
                type="submit"
                disabled={savingJob || !jobTitle.trim() || !jobContent.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                           text-white text-sm font-medium rounded-lg transition"
              >
                {savingJob ? "Saving..." : "Save Job Description"}
              </button>
            </form>

            {jobDescriptions.length === 0 ? (
              <p className="text-gray-400 text-sm">No job descriptions yet.</p>
            ) : (
              <ul className="space-y-2">
                {jobDescriptions.map((job) => (
                  <li key={job.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center justify-between p-3">
                      <button
                        onClick={() => handleToggleJob(job.id)}
                        className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-left flex-1"
                      >
                        {expandedJobId === job.id ? "▾" : "▸"} {job.title}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        title="Delete job description"
                        className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-sm transition px-1"
                      >
                        ✕
                      </button>
                    </div>
                    {expandedJobId === job.id && (
                      <div className="px-3 pb-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {loadingJobId === job.id ? "Loading..." : jobContents[job.id]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Run Analysis</h2>

          {doneResumes.length === 0 || jobDescriptions.length === 0 ? (
            <p className="text-gray-400 text-sm py-2">
              {doneResumes.length === 0 && jobDescriptions.length === 0
                ? "Upload a resume and add a job description to run your first analysis."
                : doneResumes.length === 0
                ? "Upload a resume and wait for processing to finish before running an analysis."
                : "Add a job description to run an analysis."}
            </p>
          ) : (
            <form onSubmit={handleRunAnalysis} className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700
                           text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="">Select a resume...</option>
                {doneResumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.filename}</option>
                ))}
              </select>

              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700
                           text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="">Select a job description...</option>
                {jobDescriptions.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={runningAnalysis || !selectedResumeId || !selectedJobId}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400
                           text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
              >
                {runningAnalysis ? "Starting..." : "Run Analysis →"}
              </button>
            </form>
          )}
        </div>

        {analyses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Past Analyses</h2>
            <ul className="space-y-2">
              {analyses.map((analysis) => (
                <li key={analysis.id}>
                  <Link
                    href={`/analyses/${analysis.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700
                               hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <StatusBadge status={analysis.status} />
                      {analysis.fit_score !== null && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Fit: <strong>{analysis.fit_score}</strong> · ATS: <strong>{analysis.ats_score}</strong>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
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