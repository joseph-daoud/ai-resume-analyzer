from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid


class AnalysisCreate(BaseModel):
    resume_id: uuid.UUID
    job_description_id: uuid.UUID


class FeedbackItemResponse(BaseModel):
    id: uuid.UUID
    section: str
    type: str
    content: str
    priority: int

    model_config = {"from_attributes": True}


class AnalysisResponse(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    job_description_id: uuid.UUID
    status: str
    fit_score: Optional[float]
    ats_score: Optional[float]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AnalysisDetailResponse(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    job_description_id: uuid.UUID
    status: str
    fit_score: Optional[float]
    ats_score: Optional[float]
    score_breakdown: Optional[dict]      # NEW — full breakdown for frontend
    feedback_items: list[FeedbackItemResponse]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}