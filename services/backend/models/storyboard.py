from typing import Optional, TYPE_CHECKING, List
from sqlmodel import Field, Relationship
from models.base_model import BasicModel

if TYPE_CHECKING:
    from models.user import User
    from models.storyboard_scene import StoryboardScene


class Storyboard(BasicModel, table=True):
    """Storyboard model with SQLModel for database and Pydantic validation."""
    __tablename__: str = "storyboards"

    user_id: Optional[str] = Field(default=None, foreign_key="users.id", index=True)
    initial_line: str = Field(..., index=True)  # Required field - the initial concept/line for the storyboard
    storyline: Optional[str] = Field(default=None)  # The expanded storyline/story content
    title: Optional[str] = Field(default=None, index=True)  # Optional title for the storyboard
    status: str = Field(default="draft", index=True)  # draft, in_progress, completed

    # Many-to-one relationship: Storyboard belongs to one user
    user: Optional["User"] = Relationship(back_populates="storyboards")

    # One-to-many relationship: Storyboard has many scenes
    scenes: List["StoryboardScene"] = Relationship(back_populates="storyboard", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

