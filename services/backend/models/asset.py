from typing import Optional, TYPE_CHECKING, Literal
from sqlmodel import Field, SQLModel, Relationship
from models.base_model import BasicModel

if TYPE_CHECKING:
    from models.user import User


class Asset(BasicModel, table=True):
    """Asset model with SQLModel for database and Pydantic validation."""
    __tablename__: str = "assets"

    user_id: Optional[str] = Field(default=None, foreign_key="users.id", index=True)
    link: str = Field(..., index=True)  # Required field
    type: Literal["image", "audio", "video"] = Field(..., index=True)  # Required enum field
    status: Literal["active", "deleted"] = Field(default="active", index=True)  # Required enum field with default

    # Many-to-one relationship: Asset belongs to one user
    user: Optional["User"] = Relationship(back_populates="assets")
