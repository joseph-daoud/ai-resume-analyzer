from app.ai.embedder import compute_similarity
from app.ai.extractor import extract_skills


def compute_fit_score(
    resume_embedding: list[float],
    job_embedding: list[float]
) -> float:
    """
    Compute semantic similarity between a resume and a job description.
    Uses cosine similarity on their vector embeddings.
    Returns a score from 0 to 100.
    """
    return compute_similarity(resume_embedding, job_embedding)


def compute_ats_score(
    resume_skills: list[str],
    job_text: str
) -> float:
    """
    Compute ATS (Applicant Tracking System) compatibility score.

    Measures what percentage of the JOB'S required skills the candidate
    possesses. This answers: "How many of the employer's requirements
    does this resume meet?"

    A higher score means the resume covers more of the job's requirements.

    Note: Previously this measured what % of the candidate's skills appear
    in the job — which answered the wrong question entirely.
    """
    job_skills = extract_skills(job_text)

    if not job_skills:
        return 0.0

    matched = [skill for skill in job_skills if skill in resume_skills]
    score = (len(matched) / len(job_skills)) * 100
    return round(score, 2)


def generate_score_breakdown(
    fit_score: float,
    ats_score: float,
    resume_skills: list[str],
    job_text: str
) -> dict:
    """
    Generate a detailed breakdown of the scores for storage and display.

    matched_skills — skills the job requires that the candidate HAS
    missing_skills — skills the job requires that the candidate LACKS

    Both lists are derived from the job description's requirements,
    not from the candidate's resume. This is the correct frame of reference
    for giving a candidate actionable improvement advice.
    """
    job_skills = extract_skills(job_text)

    matched_skills = [
        skill for skill in job_skills
        if skill in resume_skills       # job requires it AND candidate has it
    ]
    missing_skills = [
        skill for skill in job_skills
        if skill not in resume_skills   # job requires it BUT candidate lacks it
    ]

    def get_label(score: float) -> str:
        if score >= 80:
            return "Excellent"
        elif score >= 60:
            return "Good"
        elif score >= 40:
            return "Fair"
        else:
            return "Poor"

    return {
        "fit_score": fit_score,
        "fit_label": get_label(fit_score),
        "ats_score": ats_score,
        "ats_label": get_label(ats_score),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "total_resume_skills": len(resume_skills),
        "total_job_skills": len(job_skills),
        "total_skills_matched": len(matched_skills),
    }