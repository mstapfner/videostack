"""Initial migration

Revision ID: 0542eb271efc
Revises: 
Create Date: 2025-10-03 13:27:39.264633+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '0542eb271efc'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create users table
    op.create_table('users',
        sqlmodel.Column('id', sqlmodel.String(), nullable=False),
        sqlmodel.Column('creation_date', sqlmodel.DateTime(), nullable=False),
        sqlmodel.Column('updated_date', sqlmodel.DateTime(), nullable=False),
        sqlmodel.Column('workos_user_id', sqlmodel.String(), nullable=True),
        sqlmodel.Column('name', sqlmodel.String(), nullable=True),
        sqlmodel.Column('email', sqlmodel.String(), nullable=True),
        sqlmodel.PrimaryKeyConstraint('id'),
        sqlmodel.UniqueConstraint('workos_user_id'),
        sqlmodel.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_workos_user_id'), 'users', ['workos_user_id'], unique=True)
    op.create_index(op.f('ix_users_name'), 'users', ['name'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_name'), table_name='users')
    op.drop_index(op.f('ix_users_workos_user_id'), table_name='users')
    op.drop_table('users')
