import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool, text
from alembic import context

# ---------------------------------------------------------------------------
# Make sure Python can find our 'app' package.
# This adds the 'backend/' folder to the path so that
# 'from app.xxx import yyy' works inside this file.
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ---------------------------------------------------------------------------
# Import our application's configuration and database Base.
# We import Base directly from our models to avoid the side-effect of
# session.py connecting to the database at import time.
# ---------------------------------------------------------------------------
from app.config import settings
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# ---------------------------------------------------------------------------
# Import ALL models so Alembic can detect them.
# If a model is not imported here, Alembic will not see it during autogenerate
# and will try to DROP the table, thinking it no longer exists.
# ---------------------------------------------------------------------------
from app.models.user import User                        # noqa: F401
from app.models.resume import Resume                    # noqa: F401
from app.models.job_description import JobDescription   # noqa: F401
from app.models.analysis import Analysis                # noqa: F401
from app.models.feedback_item import FeedbackItem       # noqa: F401

# ---------------------------------------------------------------------------
# Alembic Config object — gives access to values in alembic.ini
# ---------------------------------------------------------------------------
config = context.config

# Override the sqlalchemy.url with the value from our .env file.
# This means the URL is never hardcoded anywhere — it always comes from .env.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Set up Python logging using the alembic.ini configuration.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------------------------------------------------------------------------
# This is the key line. It points Alembic at all our models' metadata so
# autogenerate can compare what exists in the database against what our
# Python models define.
# ---------------------------------------------------------------------------
from app.db.session import Base as AppBase
target_metadata = AppBase.metadata


# ---------------------------------------------------------------------------
# Two migration modes: offline (generates SQL script) and
# online (connects to DB and runs migrations directly).
# We use online mode for development.
# ---------------------------------------------------------------------------
def run_migrations_offline() -> None:
    """Run migrations without a live database connection.
    Generates a SQL script instead."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live database connection."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # Ensure pgvector extension exists before running migrations.
        # This is required because our Resume and JobDescription models
        # use the Vector column type.
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        connection.commit()

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()