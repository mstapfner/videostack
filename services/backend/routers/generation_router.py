"""Generation router for image and video generation."""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import Session, select, desc
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
from dependencies.runware_dependencies import generate_image, generate_audio, generate_video
from dependencies.bytedance_dependencies import generate_video as generate_bytedance_video

logger = logging.getLogger(__name__)
generation_router = r = APIRouter()


@r.post("/", response_model=GenerationResponse)
async def create_generation(
    request: GenerationRequest,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Create a new generation request for image, video, or audio generation.

    Args:
        request: Generation request with prompt and optional frame URLs
        current_user: Authenticated user from dependency

    Returns:
        Created generation information
    """
    try:
        # Generate content based on type
        if request.generation_type == "image":
            # Image generation parameters
            model = request.model if request.model else "google:4@1"

            width = request.width if request.width else 1024
            height = request.height if request.height else 1024

            generated_content_url = await generate_image(request.prompt, model, width, height)
            
            # Create new generation with the generated content URL
            new_generation = Generation(
                user_id=current_user.database_id,
                prompt=request.prompt,
                first_frame=request.first_frame,
                last_frame=request.last_frame,
                generation_type=request.generation_type,
                status="completed",
                generated_content_url=generated_content_url,
            )
            
        elif request.generation_type == "video":
            # Get model from request or use appropriate default
            model = request.model if request.model else "seedance-1-0-lite-t2v-250428"

            # Check if this is a ByteDance seedance model
            is_seedance_model = model.startswith("seedance") or "seedance" in model

            if is_seedance_model:
                # Handle ByteDance seedance models using ByteDance API directly
                duration = request.duration if request.duration else 5

                # Map resolution parameters to ByteDance format
                resolution = "720p"  # Default resolution

                if request.width and request.height:
                    # Map common width/height combinations to ByteDance resolution
                    width_height_map = {
                        (864, 480): "720p",
                        (1024, 576): "1080p",
                        (1280, 720): "720p",
                        (1920, 1080): "1080p",
                    }
                    resolution = width_height_map.get((request.width, request.height), "720p")
                elif request.aspect_ratio:
                    # Map aspect ratio to resolution (all map to 720p for now as per API)
                    aspect_ratio_map = {
                        "16:9": "720p",
                        "9:16": "720p",
                        "1:1": "720p",
                        "3:4": "720p",
                        "4:3": "720p",
                        "21:9": "720p",
                        "adaptive": "720p"
                    }
                    resolution = aspect_ratio_map.get(request.aspect_ratio, "720p")

                # Camera fixed parameter (not in schema, so use default)
                camera_fixed = False

                print(f"🎥 ROUTER: Using ByteDance API for seedance model: {model}")
                print(f"🎥 ROUTER: Prompt: {request.prompt[:50]}...")
                print(f"🎥 ROUTER: Duration: {duration}s, Resolution: {resolution}")
                print(f"🎥 ROUTER: First frame: {request.first_frame}")
                print(f"🎥 ROUTER: Last frame: {request.last_frame}")

                # Use ByteDance API directly for seedance models
                bytedance_response = await generate_bytedance_video(
                    text=request.prompt,
                    first_image=request.first_frame,
                    last_image=request.last_frame,
                    model=model,
                    resolution=resolution,
                    duration=duration,
                    camera_fixed=camera_fixed,
                )

                # Handle ByteDance API response (async task)
                if bytedance_response and isinstance(bytedance_response, dict):
                    print(f"🎥 ROUTER: ByteDance task created: {bytedance_response}")

                    # Extract task information for storage and future polling
                    task_data = {
                        "task_id": bytedance_response.get("id", ""),
                        "status": bytedance_response.get("status", "processing"),
                        "model": model,
                        "prompt": request.prompt,
                        "resolution": resolution,
                        "duration": duration,
                    }

                    # For now, store task info as URL (will be processed by polling system later)
                    generated_content_url = bytedance_response.get('video_url', '-')

                    print(f"🎥 ROUTER: Task stored for async processing: {generated_content_url}")
                else:
                    generated_content_url = None
                    print(f"🎥 ROUTER: ByteDance API call failed or returned None")

            else:
                # Handle other models (Runware, etc.)
                width = request.width if request.width else 864
                height = request.height if request.height else 480
                duration = request.duration if request.duration else 5
                fps = 24
                output_format = "MP4"
                output_quality = 85

                generated_content_url = await generate_video(
                    prompt=request.prompt,
                    model=model,
                    width=width,
                    height=height,
                    duration=duration,
                    fps=fps,
                    output_format=output_format,
                    output_quality=output_quality,
                    first_frame=request.first_frame,
                    last_frame=request.last_frame,
                )

            # Create new generation with the generated content URL
            # Set generation status based on model type (ByteDance models are async)
            generation_status = "processing" if is_seedance_model else "completed"

            new_generation = Generation(
                user_id=current_user.database_id,
                prompt=request.prompt,
                first_frame=request.first_frame,
                last_frame=request.last_frame,
                generation_type=request.generation_type,
                status=generation_status,
                generated_content_url=generated_content_url,
            )
            
        elif request.generation_type == "audio":
            # Audio generation parameters
            model = request.model if request.model else "elevenlabs:1@1"
            duration = request.duration if request.duration else 10
            output_format = "MP3"
            bitrate = 128
            sample_rate = 44100
            
            print(f"\n🎵 ROUTER: Starting audio generation for prompt: {request.prompt[:50]}...")
            print(f"🎵 ROUTER: User ID: {current_user.database_id}")
            print(f"🎵 ROUTER: Duration: {duration} seconds")
            
            generated_content_url = await generate_audio(
                prompt=request.prompt,
                model=model,
                duration=duration,
                output_format=output_format,
                bitrate=bitrate,
                sample_rate=sample_rate,
            )
            
            print(f"🎵 ROUTER: Audio generation completed. URL: {generated_content_url}")
            print(f"🎵 ROUTER: URL type: {type(generated_content_url)}")
            print(f"🎵 ROUTER: URL is None: {generated_content_url is None}")
            print(f"🎵 ROUTER: URL bool: {bool(generated_content_url)}")
            
            if not generated_content_url:
                print(f"❌ ROUTER: No URL returned, raising exception")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Audio generation failed: No URL returned",
                )
            
            print(f"✅ ROUTER: URL validated, creating generation record")
            
            # Create new generation with the generated content URL
            new_generation = Generation(
                user_id=current_user.database_id,
                prompt=request.prompt,
                first_frame=request.first_frame,
                last_frame=request.last_frame,
                generation_type=request.generation_type,
                status="completed",
                generated_content_url=generated_content_url,
            )
            
            print(f"✅ ROUTER: Created generation record (not saved yet)")
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid generation type: {request.generation_type}",
            )

        print(f"💾 ROUTER: Adding generation to session...")
        session.add(new_generation)
        
        print(f"💾 ROUTER: Committing to database...")
        session.commit()
        
        print(f"💾 ROUTER: Refreshing from database...")
        session.refresh(new_generation)

        print(f"💾 ROUTER: Saved to database - ID: {new_generation.id}, Type: {new_generation.generation_type}, URL: {new_generation.generated_content_url}")

        response = GenerationResponse(
            id=str(new_generation.id),
            user_id=new_generation.user_id,
            prompt=new_generation.prompt,
            first_frame=new_generation.first_frame,
            last_frame=new_generation.last_frame,
            generation_type=new_generation.generation_type,
            status=new_generation.status,
            generated_content_url=new_generation.generated_content_url,
            error_message=new_generation.error_message,
            creation_date=new_generation.creation_date.isoformat() if new_generation.creation_date else "",
            updated_date=new_generation.updated_date.isoformat() if new_generation.updated_date else "",
        )
        
        print(f"📤 ROUTER: Created response object")
        print(f"📤 ROUTER: Response URL: {response.generated_content_url}")
        print(f"📤 ROUTER: Response dict: {response.model_dump()}")
        print(f"📤 ROUTER: Returning response to frontend\n")
        return response

    except HTTPException:
        raise
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
    generation_type: Optional[str] = None,
):
    """
    Get all generations for the authenticated user.

    Args:
        current_user: Authenticated user from dependency
        session: Database session
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        generation_type: Optional filter by generation type (image, video, audio)

    Returns:
        List of user generations with total count
    """
    try:
        # Build query with filters
        statement = select(Generation).where(Generation.user_id == current_user.database_id)
        
        # Apply type filter if provided
        if generation_type:
            statement = statement.where(Generation.generation_type == generation_type)
        
        # Order by creation date descending (newest first)
        statement = statement.order_by(desc(Generation.creation_date))
        
        # Execute query
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


@r.get("/images", response_model=GenerationListResponse)
async def get_user_images(
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 50,
):
    """
    Get all image generations for the authenticated user.

    Args:
        current_user: Authenticated user from dependency
        session: Database session
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return

    Returns:
        List of user image generations with total count
    """
    return await get_user_generations(
        current_user=current_user,
        session=session,
        skip=skip,
        limit=limit,
        generation_type="image"
    )


@r.get("/videos", response_model=GenerationListResponse)
async def get_user_videos(
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 50,
):
    """
    Get all video generations for the authenticated user.

    Args:
        current_user: Authenticated user from dependency
        session: Database session
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return

    Returns:
        List of user video generations with total count
    """
    return await get_user_generations(
        current_user=current_user,
        session=session,
        skip=skip,
        limit=limit,
        generation_type="video"
    )


@r.get("/audios", response_model=GenerationListResponse)
async def get_user_audios(
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 50,
):
    """
    Get all audio generations for the authenticated user.

    Args:
        current_user: Authenticated user from dependency
        session: Database session
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return

    Returns:
        List of user audio generations with total count
    """
    return await get_user_generations(
        current_user=current_user,
        session=session,
        skip=skip,
        limit=limit,
        generation_type="audio"
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
            Generation.user_id == current_user.database_id
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
            Generation.user_id == current_user.database_id
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
