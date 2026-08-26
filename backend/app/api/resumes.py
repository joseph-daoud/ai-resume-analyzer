from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.schemas.resume import ResumeResponse, ResumeDetailResponse
from app.services.resume_service import (
    save_file_locally,
    create_resume_record,
    get_resumes_by_user,
    get_resume_by_id,
    delete_resume
)
from app.tasks.analysis_tasks import process_resume

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeResponse, status_code=201)
def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a resume file. Accepts PDF, DOCX, or TXT.
    The file is saved and a database record is created immediately.
    The AI parsing pipeline runs in the background after the response
    is returned — poll GET /resumes/{id} until status = 'done'.
    """
    unique_filename, _ = save_file_locally(file, str(current_user.id))

    resume = create_resume_record(
        db=db,
        user_id=current_user.id,
        filename=file.filename or unique_filename,
        file_path=unique_filename
    )

    # FastAPI runs this after the HTTP response is sent.
    # No daemon threads — the framework manages the lifecycle.
    background_tasks.add_task(process_resume, str(resume.id))

    return resume


@router.get("", response_model=list[ResumeResponse])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all resumes uploaded by the current user."""
    return get_resumes_by_user(db, str(current_user.id))


@router.get("/{resume_id}", response_model=ResumeDetailResponse)
def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single resume by ID including its extracted data.
    Only returns the resume if it belongs to the current user.
    """
    resume = get_resume_by_id(db, resume_id, str(current_user.id))
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.delete("/{resume_id}", status_code=204)
def remove_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume and its file from disk."""
    resume = get_resume_by_id(db, resume_id, str(current_user.id))
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    delete_resume(db, resume)