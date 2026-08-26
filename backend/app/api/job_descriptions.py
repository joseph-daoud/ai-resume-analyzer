from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.schemas.job_description import (
    JobDescriptionCreate,
    JobDescriptionResponse,
    JobDescriptionDetailResponse
)
from app.services.job_description_service import (
    create_job_description,
    get_job_descriptions_by_user,
    get_job_description_by_id,
    delete_job_description
)

router = APIRouter(prefix="/job-descriptions", tags=["Job Descriptions"])


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