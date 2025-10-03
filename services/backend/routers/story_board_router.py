"""Generation router for image and video generation."""
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import Session, select
from models.generation import Generation
from schemas.auth_schemas import UserProfile

from dependencies.auth_dependencies import get_current_user
from db.session import get_session
from dependencies.llm_dependencies import generate_storyboard_options
from schemas.storyboard_schemas import StoryBoardRequest

story_board_router = r = APIRouter()


@r.post("/")
async def create_storyboard(
    request: StoryBoardRequest,
    # current_user: UserProfile = Depends(get_current_user),
    # session: Session = Depends(get_session),
):
    """
    Create a new storyboard for the authenticated user.

    Args:
        request: CreateStoryBoardRequest
        current_user: Authenticated user from dependency
        session: Database session
    """
    storyboard_options = await generate_storyboard_options(request.prompt)
    return storyboard_options

