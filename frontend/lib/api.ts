import { getToken } from "./auth";
import type {
  User,
  AuthToken,
  LoginRequest,
  RegisterRequest,
  Resume,
  ResumeDetail,
  JobDescription,
  JobDescriptionDetail,
  JobDescriptionCreate,
  Analysis,
  AnalysisDetail,
  AnalysisCreate,
  RankingItem,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =============================================================================
// Core request function
// All API calls flow through here. It handles:
// - Attaching the JWT token automatically
// - Parsing the JSON response
// - Extracting readable error messages from FastAPI's error format
// =============================================================================

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Attach the token to every request that has one.
  // Public endpoints (login, register) have no token yet — that is fine.
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type to JSON if we're actually sending a JSON body.
  // GET/DELETE calls have no body at all, and file uploads use FormData
  // (which sets its own Content-Type automatically) — neither should
  // declare a JSON content type they don't have.
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle responses with no body (e.g. DELETE returning 204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  // If the response was not OK (4xx or 5xx), extract the error message
  // and throw it so the calling component can display it to the user.
  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
        ? data.detail.map((e: { msg: string }) => e.msg).join(", ")
        : "An unexpected error occurred";
    throw new Error(message);
  }

  return data as T;
}

// =============================================================================
// Authentication
// =============================================================================

export const authApi = {
  /**
   * Register a new user account.
   */
  register: (data: RegisterRequest): Promise<User> =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Log in and receive a JWT token.
   * NOTE: FastAPI's OAuth2 login requires form-encoded data, not JSON.
   * This is the one endpoint that does NOT send JSON.
   */
  login: (data: LoginRequest): Promise<AuthToken> => {
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    return request<AuthToken>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
  },

  /**
   * Get the currently logged-in user's profile.
   */
  me: (): Promise<User> => request<User>("/auth/me"),
};

// =============================================================================
// Resumes
// =============================================================================

export const resumesApi = {
  /**
   * Upload a resume file. Uses FormData for multipart file upload.
   */
  upload: (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append("file", file);
    return request<Resume>("/resumes/upload", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Upload multiple resume files at once (hiring-manager ranking flow).
   * FastAPI expects each file under the same "files" field name.
   */
  bulkUpload: (files: File[]): Promise<Resume[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return request<Resume[]>("/resumes/bulk-upload", {
      method: "POST",
      body: formData,
    });
  },

  list: (): Promise<Resume[]> => request<Resume[]>("/resumes"),

  get: (id: string): Promise<ResumeDetail> =>
    request<ResumeDetail>(`/resumes/${id}`),

  delete: (id: string): Promise<void> =>
    request<void>(`/resumes/${id}`, { method: "DELETE" }),
};

// =============================================================================
// Job Descriptions
// =============================================================================

export const jobDescriptionsApi = {
  create: (data: JobDescriptionCreate): Promise<JobDescription> =>
    request<JobDescription>("/job-descriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (): Promise<JobDescription[]> =>
    request<JobDescription[]>("/job-descriptions"),

  get: (id: string): Promise<JobDescriptionDetail> =>
    request<JobDescriptionDetail>(`/job-descriptions/${id}`),

  delete: (id: string): Promise<void> =>
    request<void>(`/job-descriptions/${id}`, { method: "DELETE" }),

  /**
   * Hiring-manager feature: score multiple resumes against this job
   * description and rank them. Returns immediately with a mostly-pending
   * ranking — poll getRanking() until every row is 'completed'.
   */
  rank: (jobDescriptionId: string, resumeIds: string[]): Promise<RankingItem[]> =>
    request<RankingItem[]>(`/job-descriptions/${jobDescriptionId}/rank`, {
      method: "POST",
      body: JSON.stringify({ resume_ids: resumeIds }),
    }),

  getRanking: (jobDescriptionId: string): Promise<RankingItem[]> =>
    request<RankingItem[]>(`/job-descriptions/${jobDescriptionId}/ranking`),
};

// =============================================================================
// Analyses
// =============================================================================

export const analysesApi = {
  create: (data: AnalysisCreate): Promise<Analysis> =>
    request<Analysis>("/analyses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (id: string): Promise<AnalysisDetail> =>
    request<AnalysisDetail>(`/analyses/${id}`),

  list: (): Promise<Analysis[]> => request<Analysis[]>("/analyses"),

  /**
   * Generate narrative feedback for an analysis that was scored without
   * it (e.g. one created via bulk ranking). One-off Groq call for a
   * single candidate, not a batch — safe to call on demand.
   */
  generateFeedback: (id: string): Promise<AnalysisDetail> =>
    request<AnalysisDetail>(`/analyses/${id}/feedback`, { method: "POST" }),
};