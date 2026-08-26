from datetime import datetime, timezone
from sqlalchemy import Float, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from app.db.session import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    resume_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id"),
        nullable=False
    )
    job_description_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("job_descriptions.id"),
        nullable=False
    )
    fit_score: Mapped[float] = mapped_column(Float, nullable=True)
    ats_score: Mapped[float] = mapped_column(Float, nullable=True)

    # Stores the full scoring breakdown for frontend visualizations.
    # Includes matched_skills, missing_skills, labels, and counts.
    score_breakdown: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    resume: Mapped["Resume"] = relationship(back_populates="analyses")
    job_description: Mapped["JobDescription"] = relationship(
        back_populates="analyses"
    )
    ###feedback_items: Mapped[list["FeedbackItem"]] = relationship(
    ###    back_populates="analysis"
    ###)
    feedback_items: Mapped[list["FeedbackItem"]] = relationship(
        back_populates="analysis", cascade="all, delete-orphan"
    )