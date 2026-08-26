from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
import uuid
from app.db.session import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)

    # Renamed from s3_key — stores local file path now, S3 key in Phase 5
    file_path: Mapped[str] = mapped_column(String(500), nullable=True)

    status: Mapped[str] = mapped_column(String(50), default="uploaded")

    # Stores the full extracted text from the resume file.
    # Eliminates the need to re-read the file on every analysis.
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    extracted_data: Mapped[dict] = mapped_column(JSONB, nullable=True)
    embedding: Mapped[list] = mapped_column(Vector(384), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(back_populates="resumes")
    ###analyses: Mapped[list["Analysis"]] = relationship(back_populates="resume")
    analyses: Mapped[list["Analysis"]] = relationship(
        back_populates="resume", cascade="all, delete-orphan"
    )