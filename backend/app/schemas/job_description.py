from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid


class JobDescriptionCreate(BaseModel):
    title: str
    content: str


class RankRequest(BaseModel):
    """Resume IDs to score against a job description and rank."""
    resume_ids: list[uuid.UUID]


class RankingItemResponse(BaseModel):
    """
    One row of a ranking result — a resume scored against the job
    description, enough to render a sorted candidates table without an
    extra lookup. Sorting itself happens server-side (by fit_score);
    this is a plain response shape, not tied to the ORM, since it's
    built from a resume+analysis join.
    """
    analysis_id: uuid.UUID
    resume_id: uuid.UUID
    filename: str
    status: str
    fit_score: Optional[float]
    ats_score: Optional[float]


class JobDescriptionResponse(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class JobDescriptionDetailResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}