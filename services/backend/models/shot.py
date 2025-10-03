from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from models.base_model import BasicModel

if TYPE_CHECKING:
    from models.storyboard_scene import StoryboardScene


class Shot(BasicModel, table=True):
    """Shot model - represents a shot within a scene."""
    __tablename__: str = "shots"

    scene_id: str = Field(..., foreign_key="storyboard_scenes.id", index=True)
    shot_number: int = Field(..., index=True)  # Order of the shot in the scene
    user_prompt: str = Field(..., index=True)  # User's prompt for this shot
    start_image_url: Optional[str] = Field(default=None)  # Link to starting image
    end_image_url: Optional[str] = Field(default=None)  # Link to ending image
    video_url: Optional[str] = Field(default=None)  # Link to generated video
    status: str = Field(default="pending", index=True)  # pending, processing, completed, failed

    # Many-to-one relationship: Shot belongs to one scene
    scene: Optional["StoryboardScene"] = Relationship(back_populates="shots")

