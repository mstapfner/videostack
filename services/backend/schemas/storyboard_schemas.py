from pydantic import BaseModel, Field


class StoryBoardRequest(BaseModel):
    """Request schema for creating a new generation."""
    prompt: str = Field(..., min_length=1, max_length=3000, description="Text prompt for generation")
