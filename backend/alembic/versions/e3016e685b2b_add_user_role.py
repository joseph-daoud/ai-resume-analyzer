"""add_user_role

Revision ID: e3016e685b2b
Revises: 765cca160f4d
Create Date: 2026-09-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e3016e685b2b'
down_revision: Union[str, None] = '765cca160f4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # server_default backfills existing rows as 'job_seeker' at migration
    # time; the ORM-level default in the model handles new rows going
    # forward, so the server_default is not strictly needed after this
    # migration runs but is harmless to leave in place.
    op.add_column(
        'users',
        sa.Column('role', sa.String(length=20), nullable=False, server_default='job_seeker')
    )


def downgrade() -> None:
    op.drop_column('users', 'role')
