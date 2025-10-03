"""add_storyboards_scenes_shots_tables

Revision ID: a1b2c3d4e5f6
Revises: ecefd7ec2738
Create Date: 2025-10-03 20:10:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
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
        sqlmodel.Column('id', sqlmodel.String(), nullable=False),
        sqlmodel.Column('creation_date', sqlmodel.DateTime(), nullable=False),
        sqlmodel.Column('updated_date', sqlmodel.DateTime(), nullable=False),
        sqlmodel.Column('user_id', sqlmodel.String(), nullable=True),
        sqlmodel.Column('initial_line', sqlmodel.String(), nullable=False),
        sqlmodel.Column('title', sqlmodel.String(), nullable=True),
        sqlmodel.Column('status', sqlmodel.String(), nullable=False),
        sqlmodel.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_storyboards_user_id_users')),
        sqlmodel.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_storyboards_initial_line'), 'storyboards', ['initial_line'], unique=False)
    op.create_index(op.f('ix_storyboards_status'), 'storyboards', ['status'], unique=False)
    op.create_index(op.f('ix_storyboards_title'), 'storyboards', ['title'], unique=False)
    op.create_index(op.f('ix_storyboards_user_id'), 'storyboards', ['user_id'], unique=False)

    # Create storyboard_scenes table
    op.create_table(
        'storyboard_scenes',
        sqlmodel.Column('id', sqlmodel.String(), nullable=False),
        sqlmodel.Column('creation_date', sqlmodel.DateTime(), nullable=False),
        sqlmodel.Column('updated_date', sqlmodel.DateTime(), nullable=False),
        sqlmodel.Column('storyboard_id', sqlmodel.String(), nullable=False),
        sqlmodel.Column('scene_number', sqlmodel.Integer(), nullable=False),
        sqlmodel.Column('description', sqlmodel.String(), nullable=True),
        sqlmodel.Column('duration', sqlmodel.Float(), nullable=True),
        sqlmodel.ForeignKeyConstraint(['storyboard_id'], ['storyboards.id'], name=op.f('fk_storyboard_scenes_storyboard_id_storyboards')),
        sqlmodel.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_storyboard_scenes_scene_number'), 'storyboard_scenes', ['scene_number'], unique=False)
    op.create_index(op.f('ix_storyboard_scenes_storyboard_id'), 'storyboard_scenes', ['storyboard_id'], unique=False)

    # Create shots table
    op.create_table(
        'shots',
        sqlmodel.Column('id', sqlmodel.String(), nullable=False),
        sqlmodel.Column('creation_date', sqlmodel.DateTime(), nullable=False),
        sqlmodel.Column('updated_date', sqlmodel.DateTime(), nullable=False),
        sqlmodel.Column('scene_id', sqlmodel.String(), nullable=False),
        sqlmodel.Column('shot_number', sqlmodel.Integer(), nullable=False),
        sqlmodel.Column('user_prompt', sqlmodel.String(), nullable=False),
        sqlmodel.Column('start_image_url', sqlmodel.String(), nullable=True),
        sqlmodel.Column('end_image_url', sqlmodel.String(), nullable=True),
        sqlmodel.Column('video_url', sqlmodel.String(), nullable=True),
        sqlmodel.Column('status', sqlmodel.String(), nullable=False),
        sqlmodel.ForeignKeyConstraint(['scene_id'], ['storyboard_scenes.id'], name=op.f('fk_shots_scene_id_storyboard_scenes')),
        sqlmodel.PrimaryKeyConstraint('id')
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
