from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Literal
import uuid


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    # Chosen at signup. "hiring_manager" unlocks bulk resume ranking.
    role: Literal["job_seeker", "hiring_manager"] = "job_seeker"

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str