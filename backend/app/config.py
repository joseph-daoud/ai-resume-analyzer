from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+psycopg://resume_user:resume_pass@localhost:5432/resume_analyzer"

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

    # CORS — comma-separated list of allowed frontend origins. Defaults to
    # local dev; set this on the deployed backend to add the production
    # frontend's URL, without needing a code change to do it.
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()