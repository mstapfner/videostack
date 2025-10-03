from typing import Optional, TYPE_CHECKING, List
from sqlmodel import Field, SQLModel, Relationship
from models.base_model import BasicModel

if TYPE_CHECKING:
    from models.asset import Asset


class User(BasicModel, table=True):
    """User model with SQLModel for database and Pydantic validation."""
    __tablename__: str = "users"

    workos_user_id: Optional[str] = Field(default=None, unique=True, index=True)
    name: Optional[str] = Field(default=None, index=True)
    email: Optional[str] = Field(default=None, unique=True, index=True)

    # One-to-many relationship: User can have multiple assets
    assets: List["Asset"] = Relationship(back_populates="user")
