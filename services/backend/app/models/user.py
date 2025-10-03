from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from .base_model import BasicModel


class User(BasicModel, table=True):
    """User model with SQLModel for database and Pydantic validation."""
    __tablename__: str = "users"

    workos_user_id: Optional[str] = Field(default=None, unique=True, index=True)
    name: Optional[str] = Field(default=None, index=True)
    email: Optional[str] = Field(default=None, unique=True, index=True)
