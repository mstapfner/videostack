"""Storyboard v2 schemas for API requests and responses."""
from typing import Optional, List
from pydantic import BaseModel, Field


# ============= Shot Schemas =============

class ShotRequest(BaseModel):
    """Request schema for creating/updating a shot."""
    shot_number: int = Field(..., ge=1, description="Order of the shot in the scene")
    user_prompt: str = Field(..., min_length=1, max_length=2000, description="User's prompt for this shot")
    start_image_url: Optional[str] = Field(None, description="URL to starting image")
    end_image_url: Optional[str] = Field(None, description="URL to ending image")
    video_url: Optional[str] = Field(None, description="URL to generated video")
    status: Optional[str] = Field("pending", pattern="^(pending|processing|completed|failed)$", description="Shot status")


class ShotResponse(BaseModel):
    """Response schema for shot data."""
    id: str
    scene_id: str
    shot_number: int
    user_prompt: str
    start_image_url: Optional[str]
    end_image_url: Optional[str]
    video_url: Optional[str]
    status: str
    creation_date: str
    updated_date: str

    class Config:
        from_attributes = True


# ============= Scene Schemas =============

class StoryboardSceneRequest(BaseModel):
    """Request schema for creating/updating a scene."""
    scene_number: int = Field(..., ge=1, description="Order of the scene in the storyboard")
    description: Optional[str] = Field(None, max_length=2000, description="Description of the scene")
    duration: Optional[float] = Field(None, ge=0, description="Expected duration in seconds")
    shots: Optional[List[ShotRequest]] = Field(default=None, description="Shots in this scene")


class StoryboardSceneResponse(BaseModel):
    """Response schema for scene data."""
    id: str
    storyboard_id: str
    scene_number: int
    description: Optional[str]
    duration: Optional[float]
    shots: List[ShotResponse]
    creation_date: str
    updated_date: str

    class Config:
        from_attributes = True


# ============= Storyboard Schemas =============

class StoryboardCreateRequest(BaseModel):
    """Request schema for creating a new storyboard."""
    initial_line: str = Field(..., min_length=1, max_length=2000, description="Initial concept/line for the storyboard")
    title: Optional[str] = Field(None, max_length=500, description="Title for the storyboard")
    status: Optional[str] = Field("draft", pattern="^(draft|in_progress|completed)$", description="Storyboard status")
    scenes: Optional[List[StoryboardSceneRequest]] = Field(default=None, description="Scenes in this storyboard")


class StoryboardUpdateRequest(BaseModel):
    """Request schema for updating a storyboard."""
    initial_line: Optional[str] = Field(None, min_length=1, max_length=2000, description="Initial concept/line for the storyboard")
    title: Optional[str] = Field(None, max_length=500, description="Title for the storyboard")
    status: Optional[str] = Field(None, pattern="^(draft|in_progress|completed)$", description="Storyboard status")


class StoryboardResponse(BaseModel):
    """Response schema for storyboard data."""
    id: str
    user_id: Optional[str]
    initial_line: str
    title: Optional[str]
    status: str
    scenes: List[StoryboardSceneResponse]
    creation_date: str
    updated_date: str

    class Config:
        from_attributes = True


class StoryboardSummaryResponse(BaseModel):
    """Response schema for storyboard summary (without scenes)."""
    id: str
    user_id: Optional[str]
    initial_line: str
    title: Optional[str]
    status: str
    scene_count: int
    creation_date: str
    updated_date: str

    class Config:
        from_attributes = True


class StoryboardListResponse(BaseModel):
    """Response schema for list of storyboards."""
    storyboards: List[StoryboardSummaryResponse]
    total: int


# ============= Scene-specific Schemas =============

class SceneAddRequest(BaseModel):
    """Request schema for adding a scene to a storyboard."""
    scene_number: int = Field(..., ge=1, description="Order of the scene in the storyboard")
    description: Optional[str] = Field(None, max_length=2000, description="Description of the scene")
    duration: Optional[float] = Field(None, ge=0, description="Expected duration in seconds")


class SceneUpdateRequest(BaseModel):
    """Request schema for updating a scene."""
    scene_number: Optional[int] = Field(None, ge=1, description="Order of the scene in the storyboard")
    description: Optional[str] = Field(None, max_length=2000, description="Description of the scene")
    duration: Optional[float] = Field(None, ge=0, description="Expected duration in seconds")


# ============= Shot-specific Schemas =============

class ShotAddRequest(BaseModel):
    """Request schema for adding a shot to a scene."""
    shot_number: int = Field(..., ge=1, description="Order of the shot in the scene")
    user_prompt: str = Field(..., min_length=1, max_length=2000, description="User's prompt for this shot")
    start_image_url: Optional[str] = Field(None, description="URL to starting image")
    end_image_url: Optional[str] = Field(None, description="URL to ending image")


class ShotUpdateRequest(BaseModel):
    """Request schema for updating a shot."""
    shot_number: Optional[int] = Field(None, ge=1, description="Order of the shot in the scene")
    user_prompt: Optional[str] = Field(None, min_length=1, max_length=2000, description="User's prompt for this shot")
    start_image_url: Optional[str] = Field(None, description="URL to starting image")
    end_image_url: Optional[str] = Field(None, description="URL to ending image")
    video_url: Optional[str] = Field(None, description="URL to generated video")
    status: Optional[str] = Field(None, pattern="^(pending|processing|completed|failed)$", description="Shot status")

