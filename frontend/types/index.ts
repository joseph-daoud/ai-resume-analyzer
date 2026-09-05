// =============================================================================
// Authentication
// =============================================================================

export type UserRole = "job_seeker" | "hiring_manager";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string; // FastAPI OAuth2 uses 'username', not 'email'
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

// =============================================================================
// Resumes
// =============================================================================

export interface ExtractedData {
  skills: string[];
  email: string | null;
  phone: string | null;
  organizations: string[];
  locations: string[];
  dates: string[];
  word_count: number;
}

export interface Resume {
  id: string;
  filename: string;
  status: "uploaded" | "processing" | "done" | "failed";
  uploaded_at: string;
}

export interface ResumeDetail extends Resume {
  // 'extends' means ResumeDetail has everything Resume has, plus these fields.
  // This mirrors how ResumeDetailResponse extends ResumeResponse in the backend.
  extracted_data: ExtractedData | null;
}

// =============================================================================
// Job Descriptions
// =============================================================================

export interface JobDescription {
  id: string;
  title: string;
  created_at: string;
}

export interface JobDescriptionDetail extends JobDescription {
  content: string;
}

export interface JobDescriptionCreate {
  title: string;
  content: string;
}

// =============================================================================
// Analyses
// =============================================================================

export interface ScoreBreakdown {
  fit_score: number;
  fit_label: "Excellent" | "Good" | "Fair" | "Poor";
  ats_score: number;
  ats_label: "Excellent" | "Good" | "Fair" | "Poor";
  matched_skills: string[];
  missing_skills: string[];
  total_resume_skills: number;
  total_job_skills: number;
  total_skills_matched: number;
}

export interface FeedbackItem {
  id: string;
  section: string;
  type: "improvement" | "missing_keyword" | "strength";
  content: string;
  priority: 1 | 2 | 3;
}

export interface Analysis {
  id: string;
  resume_id: string;
  job_description_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  fit_score: number | null;
  ats_score: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface AnalysisDetail extends Analysis {
  score_breakdown: ScoreBreakdown | null;
  feedback_items: FeedbackItem[];
}

export interface AnalysisCreate {
  resume_id: string;
  job_description_id: string;
}

// =============================================================================
// Ranking — hiring manager feature: many resumes vs. one job description
// =============================================================================

export interface RankingItem {
  analysis_id: string;
  resume_id: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  fit_score: number | null;
  ats_score: number | null;
}

// =============================================================================
// API Error shape — what FastAPI returns on validation errors
// =============================================================================

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}