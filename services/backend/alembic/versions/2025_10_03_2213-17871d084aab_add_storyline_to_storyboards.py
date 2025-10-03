"""add_storyline_to_storyboards

Revision ID: 17871d084aab
Revises: a1b2c3d4e5f6
Create Date: 2025-10-03 22:13:18.242067+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '17871d084aab'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add storyline column to storyboards table
    op.add_column('storyboards', sa.Column('storyline', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove storyline column from storyboards table
    op.drop_column('storyboards', 'storyline')
