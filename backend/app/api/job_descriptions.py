from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.api.auth import get_current_user
from app.schemas.job_description import (
    JobDescriptionCreate,
    JobDescriptionResponse,
    JobDescriptionDetailResponse,
    RankRequest,
    RankingItemResponse
)
from app.services.job_description_service import (
    create_job_description,
    get_job_descriptions_by_user,
    get_job_description_by_id,
    get_ranking_for_job_description,
    delete_job_description
)
from app.tasks.analysis_tasks import bulk_run_analyses

router = APIRouter(prefix="/job-descriptions", tags=["Job Descriptions"])

# Same cap as resumes.MAX_BULK_UPLOAD — keeps one ranking run from
# overwhelming a free-tier instance's limited CPU.
MAX_RANK_BATCH = 30


@router.post("", response_model=JobDescriptionResponse, status_code=201)
def create_job_desc(
    job_data: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a new job description to match resumes against.
    """
    return create_job_description(
        db=db,
        user_id=current_user.id,
        title=job_data.title,
        content=job_data.content
    )


@router.get("", response_model=list[JobDescriptionResponse])
def list_job_descriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all job descriptions saved by the current user.
    """
    return get_job_descriptions_by_user(db, str(current_user.id))


@router.get("/{job_description_id}", response_model=JobDescriptionDetailResponse)
def get_job_description(
    job_description_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single job description including its full content.
    """
    job_desc = get_job_description_by_id(
        db, job_description_id, str(current_user.id)
    )
    if not job_desc:
        raise HTTPException(status_code=404, detail="Job description not found")
    return job_desc


@router.post(
    "/{job_description_id}/rank",
    response_model=list[RankingItemResponse],
    status_code=202
)
def rank_resumes(
    job_description_id: str,
    rank_data: RankRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Hiring-manager feature: score multiple resumes against one job
    description and rank them by fit.

    Creates one Analysis per resume — reusing the exact same scoring
    pipeline as a single analysis — and runs them sequentially in the
    background WITHOUT generating narrative LLM feedback, so a large
    batch stays within Groq's free-tier rate limit. Feedback for an
    individual candidate can be generated afterwards via
    POST /analyses/{id}/feedback once you've picked who to look at closer.

    Returns 202 immediately with the current (mostly pending) ranking —
    poll GET /job-descriptions/{id}/ranking until every row is 'completed'.
    """
    if current_user.role != "hiring_manager":
        raise HTTPException(
            status_code=403,
            detail="Ranking multiple resumes is available to hiring manager accounts."
        )

    job_desc = get_job_description_by_id(
        db, job_description_id, str(current_user.id)
    )
    if not job_desc:
        raise HTTPException(status_code=404, detail="Job description not found")

    if not rank_data.resume_ids:
        raise HTTPException(status_code=400, detail="No resumes selected.")
    if len(rank_data.resume_ids) > MAX_RANK_BATCH:
        raise HTTPException(
            status_code=400,
            detail=f"Too many resumes. Rank at most {MAX_RANK_BATCH} at a time."
        )

    new_analyses = []
    for resume_id in rank_data.resume_ids:
        # Only rank resumes that belong to this user and have finished
        # the upload pipeline (embedding/skills extraction complete).
        resume = db.query(Resume).filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id
        ).first()
        if not resume or resume.status != "done":
            continue

        analysis = Analysis(
            resume_id=resume.id,
            job_description_id=job_desc.id,
            status="pending"
        )
        db.add(analysis)
        new_analyses.append(analysis)

    db.commit()

    background_tasks.add_task(
        bulk_run_analyses,
        [str(a.id) for a in new_analyses],
        False  # generate_feedback_step — off for bulk ranking, see analysis_tasks.py
    )

    return get_ranking_for_job_description(db, job_description_id)


@router.get(
    "/{job_description_id}/ranking",
    response_model=list[RankingItemResponse]
)
def get_ranking(
    job_description_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current ranking of resumes scored against this job
    description, sorted by fit score (highest first). Poll this while
    rows are still 'pending'/'processing' after calling rank_resumes.
    """
    job_desc = get_job_description_by_id(
        db, job_description_id, str(current_user.id)
    )
    if not job_desc:
        raise HTTPException(status_code=404, detail="Job description not found")

    return get_ranking_for_job_description(db, job_description_id)


@router.delete("/{job_description_id}", status_code=204)
def remove_job_description(
    job_description_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a job description.
    """
    job_desc = get_job_description_by_id(
        db, job_description_id, str(current_user.id)
    )
    if not job_desc:
        raise HTTPException(status_code=404, detail="Job description not found")
    delete_job_description(db, job_desc)