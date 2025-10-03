from typing import Optional, TYPE_CHECKING, List
from sqlmodel import Field, Relationship
from models.base_model import BasicModel

if TYPE_CHECKING:
    from models.storyboard import Storyboard
    from models.shot import Shot


class StoryboardScene(BasicModel, table=True):
    """StoryboardScene model - represents a scene within a storyboard."""
    __tablename__: str = "storyboard_scenes"

    storyboard_id: str = Field(..., foreign_key="storyboards.id", index=True)
    scene_number: int = Field(..., index=True)  # Order of the scene in the storyboard
    description: Optional[str] = Field(default=None)  # Description of the scene
    duration: Optional[float] = Field(default=None)  # Expected duration in seconds

    # Many-to-one relationship: Scene belongs to one storyboard
    storyboard: Optional["Storyboard"] = Relationship(back_populates="scenes")

    # One-to-many relationship: Scene has many shots
    shots: List["Shot"] = Relationship(back_populates="scene", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

