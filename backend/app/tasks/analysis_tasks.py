import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.resume import Resume
from app.models.analysis import Analysis
from app.models.feedback_item import FeedbackItem
from app.ai.parser import parse_resume
from app.ai.extractor import extract_resume_data
from app.ai.embedder import generate_embedding
from app.ai.scorer import compute_fit_score, compute_ats_score, generate_score_breakdown
from app.ai.feedback import generate_feedback

UPLOAD_DIR = "uploads"


def process_resume(resume_id: str):
    """
    Run the full AI pipeline on a resume after upload.

    Pipeline steps:
    1. Load resume from database
    2. Parse file to extract raw text
    3. Extract structured data using NLP
    4. Generate semantic embedding
    5. Save raw text, extracted data, and embedding to database
    """
    db: Session = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            print(f"Resume {resume_id} not found")
            return

        resume.status = "processing"
        db.commit()

        # Step 2 — Parse file to raw text
        file_path = os.path.join(UPLOAD_DIR, resume.file_path)   # renamed
        raw_text = parse_resume(file_path)

        # Step 3 — Extract structured data
        extracted_data = extract_resume_data(raw_text)

        # Step 4 — Generate embedding
        embedding = generate_embedding(raw_text)

        # Step 5 — Save everything, including raw_text for reuse in analysis
        resume.raw_text = raw_text              # NEW: stored for later reuse
        resume.extracted_data = extracted_data
        resume.embedding = embedding
        resume.status = "done"
        db.commit()

        print(f"Resume {resume_id} processed successfully")

    except Exception as e:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            resume.status = "failed"
            db.commit()
        print(f"Error processing resume {resume_id}: {e}")
    finally:
        db.close()


def run_analysis(analysis_id: str, generate_feedback_step: bool = True):
    """
    Run the full analysis pipeline for a resume + job description pair.

    Pipeline steps:
    1. Load analysis, resume, and job description from database
    2. Generate job description embedding if not already done
    3. Compute fit score and ATS score
    4. Generate detailed score breakdown
    5. Generate LLM feedback (skippable — see generate_feedback_step)
    6. Save all results to database

    generate_feedback_step controls step 5, which is the only step that
    calls the Groq API. Steps 1-4 (embeddings + score breakdown) run
    entirely locally via sentence-transformers, so they're free and have
    no rate limit regardless of this flag.

    Bulk ranking (see bulk_run_analyses) passes False here: scoring many
    resumes against one job description only needs fit_score/ats_score
    to sort candidates, and generating narrative feedback for every one
    of them at once would risk hitting Groq's free-tier requests-per-minute
    limit. Feedback for an individual candidate can still be generated
    afterwards, on demand, via POST /analyses/{id}/feedback.
    """
    db: Session = SessionLocal()
    try:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            print(f"Analysis {analysis_id} not found")
            return

        analysis.status = "processing"
        db.commit()

        resume = analysis.resume
        job_description = analysis.job_description

        # Step 2 — Generate job description embedding if missing
        if job_description.embedding is None:
            job_embedding = generate_embedding(job_description.content)
            job_description.embedding = job_embedding
            db.commit()
        else:
            job_embedding = job_description.embedding

        # Step 3 — Compute scores
        resume_embedding = resume.embedding
        fit_score = compute_fit_score(resume_embedding, job_embedding)

        extracted_data = resume.extracted_data or {}
        resume_skills = extracted_data.get("skills", [])
        ats_score = compute_ats_score(resume_skills, job_description.content)

        # Step 4 — Generate score breakdown (now persisted, not discarded)
        score_breakdown = generate_score_breakdown(
            fit_score, ats_score, resume_skills, job_description.content
        )

        # Step 5 — Generate LLM feedback, unless this is a bulk/ranking run
        feedback_items = []
        if generate_feedback_step:
            # Use stored raw_text instead of re-parsing the file
            raw_text = resume.raw_text
            if not raw_text:
                # Fallback: re-parse the file if raw_text was not stored
                file_path = os.path.join(UPLOAD_DIR, resume.file_path)
                raw_text = parse_resume(file_path)

            feedback_items = generate_feedback(
                raw_text, job_description.content, score_breakdown
            )

        # Step 6 — Save all results to database
        analysis.fit_score = fit_score
        analysis.ats_score = ats_score
        analysis.score_breakdown = score_breakdown    # NEW: persisted breakdown
        analysis.status = "completed"
        analysis.completed_at = datetime.now(timezone.utc)
        db.commit()

        for item in feedback_items:
            feedback = FeedbackItem(
                analysis_id=analysis.id,
                section=item["section"],
                type=item["type"],
                content=item["content"],
                priority=item["priority"]
            )
            db.add(feedback)
        db.commit()

        print(f"Analysis {analysis_id} completed successfully")

    except Exception as e:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if analysis:
            analysis.status = "failed"
            db.commit()
        print(f"Error running analysis {analysis_id}: {e}")
    finally:
        db.close()


def bulk_process_resumes(resume_ids: list[str]):
    """
    Process multiple uploaded resumes ONE AT A TIME (not concurrently).

    Used by the hiring-manager bulk-upload endpoint. Deliberately
    sequential rather than scheduling N background tasks: the free-tier
    instance this runs on has very limited CPU, and this process already
    holds spaCy + sentence-transformers + torch in memory. Running many
    embedding/NLP jobs at once would queue up on that single thin CPU and
    could slow the whole app down for other users mid-batch. Processing
    one resume at a time trades wall-clock time (a 20-resume batch will
    take a while) for not degrading the service for everyone else.
    """
    for resume_id in resume_ids:
        process_resume(resume_id)


def bulk_run_analyses(analysis_ids: list[str], generate_feedback_step: bool = False):
    """
    Run multiple analyses ONE AT A TIME (not concurrently) — same
    rationale as bulk_process_resumes. Used by the ranking endpoint.

    generate_feedback_step defaults to False here: ranking only needs
    fit_score/ats_score (computed locally, free), and generating Groq
    feedback for every resume in a large batch at once would risk
    hitting the free-tier rate limit. See run_analysis() for details.
    """
    for analysis_id in analysis_ids:
        run_analysis(analysis_id, generate_feedback_step=generate_feedback_step)