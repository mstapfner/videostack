from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from models.base_model import BasicModel

if TYPE_CHECKING:
    from models.user import User


class Asset(BasicModel, table=True):
    """Asset model with SQLModel for database and Pydantic validation."""
    __tablename__: str = "assets"

    user_id: Optional[str] = Field(default=None, foreign_key="users.id", index=True)
    link: str = Field(..., index=True)  # Required field
    type: str = Field(..., index=True)  # Required field - values: "image", "audio", "video"
    status: str = Field(default="active", index=True)  # Required field with default - values: "active", "deleted"

    # Many-to-one relationship: Asset belongs to one user
    user: Optional["User"] = Relationship(back_populates="assets")
