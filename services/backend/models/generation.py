from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from models.base_model import BasicModel

if TYPE_CHECKING:
    from models.user import User


class Generation(BasicModel, table=True):
    """Generation model with SQLModel for database and Pydantic validation."""
    __tablename__: str = "generations"

    user_id: Optional[str] = Field(default=None, foreign_key="users.id", index=True)
    prompt: str = Field(..., index=True)  # Required field
    first_frame: Optional[str] = Field(default=None)  # Optional first frame image URL
    last_frame: Optional[str] = Field(default=None)  # Optional last frame image URL
    generation_type: str = Field(..., index=True)  # Required field - values: "image", "video"
    status: str = Field(default="pending", index=True)  # Required field with default - values: "pending", "processing", "completed", "failed"
    generated_content_url: Optional[str] = Field(default=None)  # URL where the generated content is stored
    error_message: Optional[str] = Field(default=None)  # Error message if generation failed

    # Many-to-one relationship: Generation belongs to one user
    user: Optional["User"] = Relationship(back_populates="generations")

