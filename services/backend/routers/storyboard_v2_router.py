"""Storyboard v2 router for managing storyboards, scenes, and shots."""
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import Session, select
from models.storyboard import Storyboard
from models.storyboard_scene import StoryboardScene
from models.shot import Shot
from schemas.auth_schemas import UserProfile
from schemas.storyboard_v2_schemas import (
    StoryboardCreateRequest,
    StoryboardUpdateRequest,
    StoryboardResponse,
    StoryboardSummaryResponse,
    StoryboardListResponse,
    StoryboardSceneResponse,
    SceneAddRequest,
    SceneUpdateRequest,
    ShotResponse,
    ShotAddRequest,
    ShotUpdateRequest,
)
from dependencies.auth_dependencies import get_current_user
from db.session import get_session

storyboard_v2_router = r = APIRouter()


# ============= Helper Functions =============

def _storyboard_to_response(storyboard: Storyboard) -> StoryboardResponse:
    """Convert a Storyboard model to response format."""
    scenes = []
    for scene in sorted(storyboard.scenes, key=lambda s: s.scene_number):
        shots = [
            ShotResponse(
                id=str(shot.id),
                scene_id=str(shot.scene_id),
                shot_number=shot.shot_number,
                user_prompt=shot.user_prompt,
                start_image_url=shot.start_image_url,
                end_image_url=shot.end_image_url,
                video_url=shot.video_url,
                status=shot.status,
                creation_date=shot.creation_date.isoformat() if shot.creation_date else "",
                updated_date=shot.updated_date.isoformat() if shot.updated_date else "",
            )
            for shot in sorted(scene.shots, key=lambda sh: sh.shot_number)
        ]
        scenes.append(
            StoryboardSceneResponse(
                id=str(scene.id),
                storyboard_id=str(scene.storyboard_id),
                scene_number=scene.scene_number,
                description=scene.description,
                duration=scene.duration,
                shots=shots,
                creation_date=scene.creation_date.isoformat() if scene.creation_date else "",
                updated_date=scene.updated_date.isoformat() if scene.updated_date else "",
            )
        )

    return StoryboardResponse(
        id=str(storyboard.id),
        user_id=storyboard.user_id,
        initial_line=storyboard.initial_line,
        storyline=storyboard.storyline,
        title=storyboard.title,
        status=storyboard.status,
        scenes=scenes,
        creation_date=storyboard.creation_date.isoformat() if storyboard.creation_date else "",
        updated_date=storyboard.updated_date.isoformat() if storyboard.updated_date else "",
    )


def _scene_to_response(scene: StoryboardScene) -> StoryboardSceneResponse:
    """Convert a StoryboardScene model to response format."""
    shots = [
        ShotResponse(
            id=str(shot.id),
            scene_id=str(shot.scene_id),
            shot_number=shot.shot_number,
            user_prompt=shot.user_prompt,
            start_image_url=shot.start_image_url,
            end_image_url=shot.end_image_url,
            video_url=shot.video_url,
            status=shot.status,
            creation_date=shot.creation_date.isoformat() if shot.creation_date else "",
            updated_date=shot.updated_date.isoformat() if shot.updated_date else "",
        )
        for shot in sorted(scene.shots, key=lambda sh: sh.shot_number)
    ]

    return StoryboardSceneResponse(
        id=str(scene.id),
        storyboard_id=str(scene.storyboard_id),
        scene_number=scene.scene_number,
        description=scene.description,
        duration=scene.duration,
        shots=shots,
        creation_date=scene.creation_date.isoformat() if scene.creation_date else "",
        updated_date=scene.updated_date.isoformat() if scene.updated_date else "",
    )


# ============= Storyboard Endpoints =============

@r.post("/", response_model=StoryboardResponse, status_code=status.HTTP_201_CREATED)
async def create_storyboard(
    request: StoryboardCreateRequest,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Create a new storyboard with optional scenes and shots.

    Args:
        request: Storyboard creation request
        current_user: Authenticated user from dependency
        session: Database session

    Returns:
        Created storyboard with all nested data
    """
    try:
        # Create storyboard
        new_storyboard = Storyboard(
            user_id=current_user.database_id,
            initial_line=request.initial_line,
            storyline=request.storyline,
            title=request.title,
            status=request.status or "draft",
        )

        session.add(new_storyboard)
        session.flush()  # Get the storyboard ID

        # Create scenes if provided
        if request.scenes:
            for scene_req in request.scenes:
                new_scene = StoryboardScene(
                    storyboard_id=new_storyboard.id,
                    scene_number=scene_req.scene_number,
                    description=scene_req.description,
                    duration=scene_req.duration,
                )
                session.add(new_scene)
                session.flush()  # Get the scene ID

                # Create shots if provided
                if scene_req.shots:
                    for shot_req in scene_req.shots:
                        new_shot = Shot(
                            scene_id=new_scene.id,
                            shot_number=shot_req.shot_number,
                            user_prompt=shot_req.user_prompt,
                            start_image_url=shot_req.start_image_url,
                            end_image_url=shot_req.end_image_url,
                            video_url=shot_req.video_url,
                            status=shot_req.status or "pending",
                        )
                        session.add(new_shot)

        session.commit()
        session.refresh(new_storyboard)

        return _storyboard_to_response(new_storyboard)

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create storyboard: {str(e)}",
        )


@r.get("/", response_model=StoryboardListResponse)
async def get_user_storyboards(
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 50,
):
    """
    Get all storyboards for the authenticated user.

    Args:
        current_user: Authenticated user from dependency
        session: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of storyboard summaries
    """
    try:
        statement = select(Storyboard).where(Storyboard.user_id == current_user.database_id)
        storyboards = session.exec(statement).all()

        total = len(storyboards)
        paginated_storyboards = storyboards[skip:skip + limit]

        summaries = [
            StoryboardSummaryResponse(
                id=str(sb.id),
                user_id=sb.user_id,
                initial_line=sb.initial_line,
                storyline=sb.storyline,
                title=sb.title,
                status=sb.status,
                scene_count=len(sb.scenes),
                creation_date=sb.creation_date.isoformat() if sb.creation_date else "",
                updated_date=sb.updated_date.isoformat() if sb.updated_date else "",
            )
            for sb in paginated_storyboards
        ]

        return StoryboardListResponse(storyboards=summaries, total=total)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve storyboards: {str(e)}",
        )


@r.get("/{storyboard_id}", response_model=StoryboardResponse)
async def get_storyboard(
    storyboard_id: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get a specific storyboard with all scenes and shots.

    Args:
        storyboard_id: ID of the storyboard
        current_user: Authenticated user from dependency
        session: Database session

    Returns:
        Complete storyboard data
    """
    try:
        statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        return _storyboard_to_response(storyboard)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve storyboard: {str(e)}",
        )


@r.patch("/{storyboard_id}", response_model=StoryboardResponse)
async def update_storyboard(
    storyboard_id: str,
    request: StoryboardUpdateRequest,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Update storyboard metadata (not scenes or shots).

    Args:
        storyboard_id: ID of the storyboard
        request: Update request
        current_user: Authenticated user from dependency
        session: Database session

    Returns:
        Updated storyboard data
    """
    try:
        statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        # Update fields if provided
        if request.initial_line is not None:
            storyboard.initial_line = request.initial_line
        if request.storyline is not None:
            storyboard.storyline = request.storyline
        if request.title is not None:
            storyboard.title = request.title
        if request.status is not None:
            storyboard.status = request.status

        session.add(storyboard)
        session.commit()
        session.refresh(storyboard)

        return _storyboard_to_response(storyboard)

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update storyboard: {str(e)}",
        )


@r.delete("/{storyboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_storyboard(
    storyboard_id: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Delete a storyboard and all its scenes and shots.

    Args:
        storyboard_id: ID of the storyboard
        current_user: Authenticated user from dependency
        session: Database session
    """
    try:
        statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        session.delete(storyboard)
        session.commit()

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete storyboard: {str(e)}",
        )


# ============= Scene Endpoints =============

@r.post("/{storyboard_id}/scenes", response_model=StoryboardSceneResponse, status_code=status.HTTP_201_CREATED)
async def add_scene_to_storyboard(
    storyboard_id: str,
    request: SceneAddRequest,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Add a new scene to a storyboard.

    Args:
        storyboard_id: ID of the storyboard
        request: Scene creation request
        current_user: Authenticated user from dependency
        session: Database session

    Returns:
        Created scene data
    """
    try:
        # Verify storyboard exists and belongs to user
        statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        # Create scene
        new_scene = StoryboardScene(
            storyboard_id=storyboard_id,
            scene_number=request.scene_number,
            description=request.description,
            duration=request.duration,
        )

        session.add(new_scene)
        session.commit()
        session.refresh(new_scene)

        return _scene_to_response(new_scene)

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add scene: {str(e)}",
        )


@r.get("/{storyboard_id}/scenes/{scene_id}", response_model=StoryboardSceneResponse)
async def get_scene(
    storyboard_id: str,
    scene_id: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get a specific scene with all its shots.

    Args:
        storyboard_id: ID of the storyboard
        scene_id: ID of the scene
        current_user: Authenticated user from dependency
        session: Database session

    Returns:
        Scene data with shots
    """
    try:
        # Verify storyboard belongs to user
        storyboard_statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(storyboard_statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        # Get scene
        scene_statement = select(StoryboardScene).where(
            StoryboardScene.id == scene_id,
            StoryboardScene.storyboard_id == storyboard_id
        )
        scene = session.exec(scene_statement).first()

        if not scene:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scene not found",
            )

        return _scene_to_response(scene)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve scene: {str(e)}",
        )


@r.patch("/{storyboard_id}/scenes/{scene_id}", response_model=StoryboardSceneResponse)
async def update_scene(
    storyboard_id: str,
    scene_id: str,
    request: SceneUpdateRequest,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Update a scene's metadata.

    Args:
        storyboard_id: ID of the storyboard
        scene_id: ID of the scene
        request: Update request
        current_user: Authenticated user from dependency
        session: Database session

    Returns:
        Updated scene data
    """
    try:
        # Verify storyboard belongs to user
        storyboard_statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(storyboard_statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        # Get scene
        scene_statement = select(StoryboardScene).where(
            StoryboardScene.id == scene_id,
            StoryboardScene.storyboard_id == storyboard_id
        )
        scene = session.exec(scene_statement).first()

        if not scene:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scene not found",
            )

        # Update fields if provided
        if request.scene_number is not None:
            scene.scene_number = request.scene_number
        if request.description is not None:
            scene.description = request.description
        if request.duration is not None:
            scene.duration = request.duration

        session.add(scene)
        session.commit()
        session.refresh(scene)

        return _scene_to_response(scene)

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update scene: {str(e)}",
        )


@r.delete("/{storyboard_id}/scenes/{scene_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scene(
    storyboard_id: str,
    scene_id: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Delete a scene and all its shots.

    Args:
        storyboard_id: ID of the storyboard
        scene_id: ID of the scene
        current_user: Authenticated user from dependency
        session: Database session
    """
    try:
        # Verify storyboard belongs to user
        storyboard_statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(storyboard_statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        # Get scene
        scene_statement = select(StoryboardScene).where(
            StoryboardScene.id == scene_id,
            StoryboardScene.storyboard_id == storyboard_id
        )
        scene = session.exec(scene_statement).first()

        if not scene:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scene not found",
            )

        session.delete(scene)
        session.commit()

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete scene: {str(e)}",
        )


# ============= Shot Endpoints =============

@r.post("/{storyboard_id}/scenes/{scene_id}/shots", response_model=ShotResponse, status_code=status.HTTP_201_CREATED)
async def add_shot_to_scene(
    storyboard_id: str,
    scene_id: str,
    request: ShotAddRequest,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Add a new shot to a scene.

    Args:
        storyboard_id: ID of the storyboard
        scene_id: ID of the scene
        request: Shot creation request
        current_user: Authenticated user from dependency
        session: Database session

    Returns:
        Created shot data
    """
    try:
        # Verify storyboard belongs to user
        storyboard_statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(storyboard_statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        # Verify scene exists
        scene_statement = select(StoryboardScene).where(
            StoryboardScene.id == scene_id,
            StoryboardScene.storyboard_id == storyboard_id
        )
        scene = session.exec(scene_statement).first()

        if not scene:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scene not found",
            )

        # Create shot
        new_shot = Shot(
            scene_id=scene_id,
            shot_number=request.shot_number,
            user_prompt=request.user_prompt,
            start_image_url=request.start_image_url,
            end_image_url=request.end_image_url,
            status="pending",
        )

        session.add(new_shot)
        session.commit()
        session.refresh(new_shot)

        return ShotResponse(
            id=str(new_shot.id),
            scene_id=str(new_shot.scene_id),
            shot_number=new_shot.shot_number,
            user_prompt=new_shot.user_prompt,
            start_image_url=new_shot.start_image_url,
            end_image_url=new_shot.end_image_url,
            video_url=new_shot.video_url,
            status=new_shot.status,
            creation_date=new_shot.creation_date.isoformat() if new_shot.creation_date else "",
            updated_date=new_shot.updated_date.isoformat() if new_shot.updated_date else "",
        )

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add shot: {str(e)}",
        )


@r.get("/{storyboard_id}/scenes/{scene_id}/shots/{shot_id}", response_model=ShotResponse)
async def get_shot(
    storyboard_id: str,
    scene_id: str,
    shot_id: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get a specific shot.

    Args:
        storyboard_id: ID of the storyboard
        scene_id: ID of the scene
        shot_id: ID of the shot
        current_user: Authenticated user from dependency
        session: Database session

    Returns:
        Shot data
    """
    try:
        # Verify storyboard belongs to user
        storyboard_statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(storyboard_statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        # Verify scene exists
        scene_statement = select(StoryboardScene).where(
            StoryboardScene.id == scene_id,
            StoryboardScene.storyboard_id == storyboard_id
        )
        scene = session.exec(scene_statement).first()

        if not scene:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scene not found",
            )

        # Get shot
        shot_statement = select(Shot).where(
            Shot.id == shot_id,
            Shot.scene_id == scene_id
        )
        shot = session.exec(shot_statement).first()

        if not shot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shot not found",
            )

        return ShotResponse(
            id=str(shot.id),
            scene_id=str(shot.scene_id),
            shot_number=shot.shot_number,
            user_prompt=shot.user_prompt,
            start_image_url=shot.start_image_url,
            end_image_url=shot.end_image_url,
            video_url=shot.video_url,
            status=shot.status,
            creation_date=shot.creation_date.isoformat() if shot.creation_date else "",
            updated_date=shot.updated_date.isoformat() if shot.updated_date else "",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve shot: {str(e)}",
        )


@r.patch("/{storyboard_id}/scenes/{scene_id}/shots/{shot_id}", response_model=ShotResponse)
async def update_shot(
    storyboard_id: str,
    scene_id: str,
    shot_id: str,
    request: ShotUpdateRequest,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Update a shot's data.

    Args:
        storyboard_id: ID of the storyboard
        scene_id: ID of the scene
        shot_id: ID of the shot
        request: Update request
        current_user: Authenticated user from dependency
        session: Database session

    Returns:
        Updated shot data
    """
    try:
        # Verify storyboard belongs to user
        storyboard_statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(storyboard_statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        # Verify scene exists
        scene_statement = select(StoryboardScene).where(
            StoryboardScene.id == scene_id,
            StoryboardScene.storyboard_id == storyboard_id
        )
        scene = session.exec(scene_statement).first()

        if not scene:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scene not found",
            )

        # Get shot
        shot_statement = select(Shot).where(
            Shot.id == shot_id,
            Shot.scene_id == scene_id
        )
        shot = session.exec(shot_statement).first()

        if not shot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shot not found",
            )

        # Update fields if provided
        if request.shot_number is not None:
            shot.shot_number = request.shot_number
        if request.user_prompt is not None:
            shot.user_prompt = request.user_prompt
        if request.start_image_url is not None:
            shot.start_image_url = request.start_image_url
        if request.end_image_url is not None:
            shot.end_image_url = request.end_image_url
        if request.video_url is not None:
            shot.video_url = request.video_url
        if request.status is not None:
            shot.status = request.status

        session.add(shot)
        session.commit()
        session.refresh(shot)

        return ShotResponse(
            id=str(shot.id),
            scene_id=str(shot.scene_id),
            shot_number=shot.shot_number,
            user_prompt=shot.user_prompt,
            start_image_url=shot.start_image_url,
            end_image_url=shot.end_image_url,
            video_url=shot.video_url,
            status=shot.status,
            creation_date=shot.creation_date.isoformat() if shot.creation_date else "",
            updated_date=shot.updated_date.isoformat() if shot.updated_date else "",
        )

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update shot: {str(e)}",
        )


@r.delete("/{storyboard_id}/scenes/{scene_id}/shots/{shot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shot(
    storyboard_id: str,
    scene_id: str,
    shot_id: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Delete a shot.

    Args:
        storyboard_id: ID of the storyboard
        scene_id: ID of the scene
        shot_id: ID of the shot
        current_user: Authenticated user from dependency
        session: Database session
    """
    try:
        # Verify storyboard belongs to user
        storyboard_statement = select(Storyboard).where(
            Storyboard.id == storyboard_id,
            Storyboard.user_id == current_user.database_id
        )
        storyboard = session.exec(storyboard_statement).first()

        if not storyboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storyboard not found",
            )

        # Verify scene exists
        scene_statement = select(StoryboardScene).where(
            StoryboardScene.id == scene_id,
            StoryboardScene.storyboard_id == storyboard_id
        )
        scene = session.exec(scene_statement).first()

        if not scene:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scene not found",
            )

        # Get shot
        shot_statement = select(Shot).where(
            Shot.id == shot_id,
            Shot.scene_id == scene_id
        )
        shot = session.exec(shot_statement).first()

        if not shot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shot not found",
            )

        session.delete(shot)
        session.commit()

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete shot: {str(e)}",
        )

