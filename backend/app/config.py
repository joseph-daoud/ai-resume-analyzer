from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+psycopg://resume_user:resume_pass@localhost:5432/resume_analyzer"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security — JWT
    # No default: application refuses to start if this is missing from .env
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI — Groq
    # No default: application refuses to start if this is missing from .env
    GROQ_API_KEY: str

    # File uploads
    MAX_UPLOAD_SIZE_MB: int = 5
    ALLOWED_EXTENSIONS: list[str] = ["pdf", "docx", "txt"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()