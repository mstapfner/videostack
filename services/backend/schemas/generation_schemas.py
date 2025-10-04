"""Generation schemas for API requests and responses."""
from typing import Optional
from pydantic import BaseModel, Field
from models.generation import Generation


class GenerationRequest(BaseModel):
    """Request schema for creating a new generation."""
    prompt: str = Field(..., min_length=1, max_length=1000, description="Text prompt for generation")
    first_frame: Optional[str] = Field(None, description="Optional URL to first frame image")
    last_frame: Optional[str] = Field(None, description="Optional URL to last frame image")
    generation_type: str = Field(..., pattern="^(image|video|audio)$", description="Type of generation: 'image', 'video', or 'audio'")
    model: Optional[str] = Field(None, description="Model to use for generation (e.g., 'seedance-1-0-lite-t2v-250428', 'google:4@1')")
    duration: Optional[int] = Field(None, ge=10, le=300, description="Duration in seconds for audio generation (10-300 seconds)")


class GenerationResponse(BaseModel):
    """Response schema for generation data."""
    id: str
    user_id: Optional[str]
    prompt: str
    first_frame: Optional[str]
    last_frame: Optional[str]
    generation_type: str
    status: str
    generated_content_url: Optional[str]
    error_message: Optional[str]
    creation_date: str
    updated_date: str

    class Config:
        from_attributes = True


class GenerationStatusResponse(BaseModel):
    """Response schema for generation status."""
    id: str
    status: str
    generated_content_url: Optional[str]
    error_message: Optional[str]


class GenerationListResponse(BaseModel):
    """Response schema for list of generations."""
    generations: list[GenerationResponse]
    total: int
