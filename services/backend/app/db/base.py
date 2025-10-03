#app/db/base.py
from sqlmodel import SQLModel

# Import all models here so Alembic can detect them for autogeneration
from app.models.user import User  # noqa: F401

# SQLModel uses SQLAlchemy's declarative base under the hood
# This is compatible with Alembic migrations
Base = SQLModel
