import os
import uuid
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.resume import Resume
from app.config import settings


UPLOAD_DIR = "uploads"


def ensure_upload_dir():
    """Create the uploads folder if it doesn't exist."""
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)


def validate_file(file: UploadFile):
    """
    Check the file is an allowed type.
    Raises HTTPException if validation fails.
    """
    filename = file.filename or ""
    extension = filename.rsplit(".", 1)[-1].lower()
    if extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type .{extension} not allowed. Use PDF, DOCX, or TXT."
        )
    return extension


def save_file_locally(file: UploadFile, user_id: str) -> tuple[str, str]:
    """
    Save the uploaded file to disk with size validation.
    Reads file in chunks to avoid loading large files into memory.
    Returns (saved_filename, file_path).
    """
    ensure_upload_dir()
    extension = validate_file(file)

    unique_filename = f"{user_id}_{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    bytes_written = 0

    with open(file_path, "wb") as f:
        # Read in 64KB chunks — avoids loading the whole file into RAM
        while chunk := file.file.read(65536):
            bytes_written += len(chunk)
            if bytes_written > max_bytes:
                # Clean up the partial file before raising
                f.close()
                os.remove(file_path)
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size is "
                           f"{settings.MAX_UPLOAD_SIZE_MB}MB."
                )
            f.write(chunk)

    return unique_filename, file_path


def create_resume_record(
    db: Session,
    user_id: str,
    filename: str,
    file_path: str          # renamed from s3_key
) -> Resume:
    """
    Create a new resume record in the database.
    """
    resume = Resume(
        user_id=user_id,
        filename=filename,
        file_path=file_path,    # renamed from s3_key
        status="uploaded"
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


def get_resumes_by_user(db: Session, user_id: str) -> list[Resume]:
    return db.query(Resume).filter(Resume.user_id == user_id).all()


def get_resume_by_id(
    db: Session,
    resume_id: str,
    user_id: str
) -> Resume | None:
    return db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()


def delete_resume(db: Session, resume: Resume):
    """
    Delete a resume record from the database and its file from disk.
    The file is only removed after the database change is confirmed,
    so a failed delete never leaves the DB row pointing at a file that
    no longer exists.
    """
    file_path = resume.file_path                           # renamed from s3_key

    db.delete(resume)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not delete this resume due to a data conflict. "
                   "Please try again or contact support if this persists.",
        )

    if file_path:
        full_path = os.path.join(UPLOAD_DIR, file_path)
        if os.path.exists(full_path):
            os.remove(full_path)