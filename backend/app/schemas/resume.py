from pydantic import BaseModel
from datetime import datetime
import uuid


class ResumeResponse(BaseModel):
    id: uuid.UUID
    filename: str
    status: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class ResumeDetailResponse(BaseModel):
    id: uuid.UUID
    filename: str
    status: str
    extracted_data: dict | None
    uploaded_at: datetime

    model_config = {"from_attributes": True}