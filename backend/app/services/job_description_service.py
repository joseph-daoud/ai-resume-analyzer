from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.job_description import JobDescription


def create_job_description(
    db: Session,
    user_id: str,
    title: str,
    content: str
) -> JobDescription:
    """
    Create a new job description record in the database.
    The embedding is not generated here — it gets generated
    lazily when the first analysis is run against it.
    """
    job_description = JobDescription(
        user_id=user_id,
        title=title,
        content=content,
    )
    db.add(job_description)
    db.commit()
    db.refresh(job_description)
    return job_description


def get_job_descriptions_by_user(
    db: Session,
    user_id: str
) -> list[JobDescription]:
    """
    Get all job descriptions created by a user.
    """
    return db.query(JobDescription).filter(
        JobDescription.user_id == user_id
    ).all()


def get_job_description_by_id(
    db: Session,
    job_description_id: str,
    user_id: str
) -> JobDescription | None:
    """
    Get a single job description by ID.
    Only returns it if it belongs to the requesting user.
    """
    return db.query(JobDescription).filter(
        JobDescription.id == job_description_id,
        JobDescription.user_id == user_id
    ).first()


def delete_job_description(db: Session, job_description: JobDescription):
    """
    Delete a job description from the database.
    """
    ###db.delete(job_description)
    ###db.commit()
    db.delete(job_description)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not delete this job description due to a data "
                   "conflict. Please try again or contact support if this "
                   "persists.",
        )