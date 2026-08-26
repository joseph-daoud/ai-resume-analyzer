from pydantic import BaseModel
from datetime import datetime
import uuid


class JobDescriptionCreate(BaseModel):
    title: str
    content: str


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