from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database and models — imported to register them with SQLAlchemy metadata
from app.db.session import Base  # noqa: F401

# All models must be imported before any DB operations
from app.models.user import User                        # noqa: F401
from app.models.resume import Resume                    # noqa: F401
from app.models.job_description import JobDescription   # noqa: F401
from app.models.analysis import Analysis                # noqa: F401
from app.models.feedback_item import FeedbackItem       # noqa: F401

# API routers
from app.api import auth, resumes, job_descriptions, analyses

app = FastAPI(
    title="AI Resume Analyzer",
    description="Intelligent resume analysis powered by NLP and LLMs",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(job_descriptions.router)
app.include_router(analyses.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Confirms the API is running."""
    return {"status": "ok", "service": "AI Resume Analyzer"}