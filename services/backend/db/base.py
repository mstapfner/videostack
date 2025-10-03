#db/base.py
from sqlmodel import SQLModel

# Import all models here so Alembic can detect them for autogeneration
from models.user import User  # noqa: F401
from models.asset import Asset  # noqa: F401
from models.generation import Generation  # noqa: F401
from models.storyboard import Storyboard  # noqa: F401
from models.storyboard_scene import StoryboardScene  # noqa: F401
from models.shot import Shot  # noqa: F401

# SQLModel uses SQLAlchemy's declarative base under the hood
# This is compatible with Alembic migrations
Base = SQLModel
