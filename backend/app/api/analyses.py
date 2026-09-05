from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.feedback_item import FeedbackItem
from app.api.auth import get_current_user
from app.schemas.analysis import AnalysisCreate, AnalysisResponse, AnalysisDetailResponse
from app.tasks.analysis_tasks import run_analysis
from app.ai.feedback import generate_feedback

router = APIRouter(prefix="/analyses", tags=["Analyses"])


@router.post("", response_model=AnalysisResponse, status_code=202)
def create_analysis(
    analysis_data: AnalysisCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new analysis by pairing a resume with a job description.
    Returns 202 Accepted immediately.
    The AI pipeline runs in the background after the response is sent.
    Poll GET /analyses/{id} until status = 'completed' to get results.
    """
    # Verify the resume exists and belongs to the current user
    resume = db.query(Resume).filter(
        Resume.id == analysis_data.resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Verify the resume has been fully processed before running analysis
    if resume.status != "done":
        raise HTTPException(
            status_code=400,
            detail="Resume is still being processed. "
                   "Please wait until status is 'done'."
        )

    # Verify the job description exists and belongs to the current user
    job_desc = db.query(JobDescription).filter(
        JobDescription.id == analysis_data.job_description_id,
        JobDescription.user_id == current_user.id
    ).first()
    if not job_desc:
        raise HTTPException(
            status_code=404,
            detail="Job description not found"
        )

    # Create the analysis record in pending state
    analysis = Analysis(
        resume_id=analysis_data.resume_id,
        job_description_id=analysis_data.job_description_id,
        status="pending"
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # FastAPI runs this after the HTTP response is sent.
    background_tasks.add_task(run_analysis, str(analysis.id))

    return analysis


@router.get("/{analysis_id}", response_model=AnalysisDetailResponse)
def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get analysis results by ID.
    Poll until status = 'completed' to receive scores and feedback.
    """
    analysis = db.query(Analysis).join(Resume).filter(
        Analysis.id == analysis_id,
        Resume.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.post("/{analysis_id}/feedback", response_model=AnalysisDetailResponse)
def generate_analysis_feedback(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate narrative LLM feedback for an analysis that was scored
    without it — i.e. one created through the bulk ranking flow, where
    feedback is intentionally skipped to stay within Groq's free-tier
    rate limit (see run_analysis). Runs synchronously since it's a
    single on-demand Groq call for one candidate, not a batch.
    """
    analysis = db.query(Analysis).join(Resume).filter(
        Analysis.id == analysis_id,
        Resume.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Analysis must be completed before generating feedback."
        )
    if analysis.feedback_items:
        raise HTTPException(
            status_code=400,
            detail="Feedback has already been generated for this analysis."
        )

    resume = analysis.resume
    job_description = analysis.job_description

    feedback_items = generate_feedback(
        resume.raw_text or "",
        job_description.content,
        analysis.score_breakdown
    )
    for item in feedback_items:
        db.add(FeedbackItem(
            analysis_id=analysis.id,
            section=item["section"],
            type=item["type"],
            content=item["content"],
            priority=item["priority"]
        ))
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("", response_model=list[AnalysisResponse])
def list_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all analyses for the current user."""
    analyses = db.query(Analysis).join(Resume).filter(
        Resume.user_id == current_user.id
    ).all()
    return analyses