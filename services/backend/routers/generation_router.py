"""Generation router for image and video generation."""
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import Session, select
from models.generation import Generation
from schemas.auth_schemas import UserProfile
from schemas.generation_schemas import (
    GenerationRequest,
    GenerationResponse,
    GenerationStatusResponse,
    GenerationListResponse,
)
from dependencies.auth_dependencies import get_current_user
from db.session import get_session
from dependencies.runware_dependencies import generate_image, generate_video

generation_router = r = APIRouter()


@r.post("/", response_model=GenerationResponse)
async def create_generation(
    request: GenerationRequest,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Create a new generation request for image or video generation.

    Args:
        request: Generation request with prompt and optional frame URLs
        current_user: Authenticated user from dependency

    Returns:
        Created generation information
    """
    try:
        # Create new generation
        new_generation = Generation(
            user_id=current_user.id,
            prompt=request.prompt,
            first_frame=request.first_frame,
            last_frame=request.last_frame,
            generation_type=request.generation_type,
            status="pending",
        )

        session.add(new_generation)
        session.commit()
        session.refresh(new_generation)

        # TODO: pick the actual model to use with the correct parameters:
        model = "runware:101@1"
        width = 1024
        height = 1024

        if new_generation.generation_type == "image":
            generated_content_url = await generate_image(new_generation.prompt, model, width, height)
        elif new_generation.generation_type == "video":
            generated_content_url = await generate_video(new_generation.prompt, model, width, height)


        return GenerationResponse(
            id=str(new_generation.id),
            user_id=new_generation.user_id,
            prompt=new_generation.prompt,
            first_frame=new_generation.first_frame,
            last_frame=new_generation.last_frame,
            generation_type=new_generation.generation_type,
            status=new_generation.status,
            generated_content_url=generated_content_url,
            error_message=new_generation.error_message,
            creation_date=new_generation.creation_date.isoformat() if new_generation.creation_date else "",
            updated_date=new_generation.updated_date.isoformat() if new_generation.updated_date else "",
        )

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create generation: {str(e)}",
        )


@r.get("/", response_model=GenerationListResponse)
async def get_user_generations(
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 50,
):
    """
    Get all generations for the authenticated user.

    Args:
        current_user: Authenticated user from dependency
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return

    Returns:
        List of user generations with total count
    """
    try:
        # Query generations for the current user
        statement = select(Generation).where(Generation.user_id == current_user.id)
        generations = session.exec(statement).all()

        # Apply pagination
        total = len(generations)
        paginated_generations = generations[skip:skip + limit]

        # Convert to response format
        generation_list = [
            GenerationResponse(
                id=str(gen.id),
                user_id=gen.user_id,
                prompt=gen.prompt,
                first_frame=gen.first_frame,
                last_frame=gen.last_frame,
                generation_type=gen.generation_type,
                status=gen.status,
                generated_content_url=gen.generated_content_url,
                error_message=gen.error_message,
                creation_date=gen.creation_date.isoformat() if gen.creation_date else "",
                updated_date=gen.updated_date.isoformat() if gen.updated_date else "",
            )
            for gen in paginated_generations
        ]

        return GenerationListResponse(
            generations=generation_list,
            total=total,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve generations: {str(e)}",
        )


@r.get("/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get a specific generation by ID.

    Args:
        generation_id: ID of the generation to retrieve
        current_user: Authenticated user from dependency

    Returns:
        Generation information
    """
    try:
        # Query generation by ID and user
        statement = select(Generation).where(
            Generation.id == generation_id,
            Generation.user_id == current_user.id
        )
        generation = session.exec(statement).first()

        if not generation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Generation not found",
            )

        return GenerationResponse(
            id=str(generation.id),
            user_id=generation.user_id,
            prompt=generation.prompt,
            first_frame=generation.first_frame,
            last_frame=generation.last_frame,
            generation_type=generation.generation_type,
            status=generation.status,
            generated_content_url=generation.generated_content_url,
            error_message=generation.error_message,
            creation_date=generation.creation_date.isoformat() if generation.creation_date else "",
            updated_date=generation.updated_date.isoformat() if generation.updated_date else "",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve generation: {str(e)}",
        )


@r.get("/{generation_id}/status", response_model=GenerationStatusResponse)
async def get_generation_status(
    generation_id: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get the status of a specific generation.

    Args:
        generation_id: ID of the generation to check
        current_user: Authenticated user from dependency

    Returns:
        Generation status information
    """
    try:
        # Query generation by ID and user
        statement = select(Generation).where(
            Generation.id == generation_id,
            Generation.user_id == current_user.id
        )
        generation = session.exec(statement).first()

        if not generation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Generation not found",
            )

        return GenerationStatusResponse(
            id=str(generation.id),
            status=generation.status,
            generated_content_url=generation.generated_content_url,
            error_message=generation.error_message,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve generation status: {str(e)}",
        )
