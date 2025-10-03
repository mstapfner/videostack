"""add_storyboards_scenes_shots_tables

Revision ID: a1b2c3d4e5f6
Revises: ecefd7ec2738
Create Date: 2025-10-03 20:10:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'ecefd7ec2738'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create storyboards table
    op.create_table(
        'storyboards',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('creation_date', sa.DateTime(), nullable=False),
        sa.Column('updated_date', sa.DateTime(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('initial_line', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_storyboards_user_id_users')),
        sa.PrimaryKeyConstraint('id', name=op.f('storyboards_pkey'))
    )
    op.create_index(op.f('ix_storyboards_initial_line'), 'storyboards', ['initial_line'], unique=False)
    op.create_index(op.f('ix_storyboards_status'), 'storyboards', ['status'], unique=False)
    op.create_index(op.f('ix_storyboards_title'), 'storyboards', ['title'], unique=False)
    op.create_index(op.f('ix_storyboards_user_id'), 'storyboards', ['user_id'], unique=False)

    # Create storyboard_scenes table
    op.create_table(
        'storyboard_scenes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('creation_date', sa.DateTime(), nullable=False),
        sa.Column('updated_date', sa.DateTime(), nullable=False),
        sa.Column('storyboard_id', sa.String(), nullable=False),
        sa.Column('scene_number', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['storyboard_id'], ['storyboards.id'], name=op.f('fk_storyboard_scenes_storyboard_id_storyboards')),
        sa.PrimaryKeyConstraint('id', name=op.f('storyboard_scenes_pkey'))
    )
    op.create_index(op.f('ix_storyboard_scenes_scene_number'), 'storyboard_scenes', ['scene_number'], unique=False)
    op.create_index(op.f('ix_storyboard_scenes_storyboard_id'), 'storyboard_scenes', ['storyboard_id'], unique=False)

    # Create shots table
    op.create_table(
        'shots',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('creation_date', sa.DateTime(), nullable=False),
        sa.Column('updated_date', sa.DateTime(), nullable=False),
        sa.Column('scene_id', sa.String(), nullable=False),
        sa.Column('shot_number', sa.Integer(), nullable=False),
        sa.Column('user_prompt', sa.String(), nullable=False),
        sa.Column('start_image_url', sa.String(), nullable=True),
        sa.Column('end_image_url', sa.String(), nullable=True),
        sa.Column('video_url', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['scene_id'], ['storyboard_scenes.id'], name=op.f('fk_shots_scene_id_storyboard_scenes')),
        sa.PrimaryKeyConstraint('id', name=op.f('shots_pkey'))
    )
    op.create_index(op.f('ix_shots_scene_id'), 'shots', ['scene_id'], unique=False)
    op.create_index(op.f('ix_shots_shot_number'), 'shots', ['shot_number'], unique=False)
    op.create_index(op.f('ix_shots_status'), 'shots', ['status'], unique=False)
    op.create_index(op.f('ix_shots_user_prompt'), 'shots', ['user_prompt'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop shots table
    op.drop_index(op.f('ix_shots_user_prompt'), table_name='shots')
    op.drop_index(op.f('ix_shots_status'), table_name='shots')
    op.drop_index(op.f('ix_shots_shot_number'), table_name='shots')
    op.drop_index(op.f('ix_shots_scene_id'), table_name='shots')
    op.drop_table('shots')

    # Drop storyboard_scenes table
    op.drop_index(op.f('ix_storyboard_scenes_storyboard_id'), table_name='storyboard_scenes')
    op.drop_index(op.f('ix_storyboard_scenes_scene_number'), table_name='storyboard_scenes')
    op.drop_table('storyboard_scenes')

    # Drop storyboards table
    op.drop_index(op.f('ix_storyboards_user_id'), table_name='storyboards')
    op.drop_index(op.f('ix_storyboards_title'), table_name='storyboards')
    op.drop_index(op.f('ix_storyboards_status'), table_name='storyboards')
    op.drop_index(op.f('ix_storyboards_initial_line'), table_name='storyboards')
    op.drop_table('storyboards')

