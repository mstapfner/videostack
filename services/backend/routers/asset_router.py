"""Asset router for managing user assets."""
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import Session, select
from models.asset import Asset
from schemas.auth_schemas import UserProfile
from dependencies.auth_dependencies import get_current_user
from db.session import get_session

asset_router = r = APIRouter()


@r.get("/", response_model=List[dict])
async def get_user_assets(
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get all assets for the authenticated user.

    Returns:
        List of user assets
    """
    try:
        # Query active assets for the current user (exclude deleted)
        statement = select(Asset).where(
            Asset.user_id == current_user.database_id,
            Asset.status == "active"
        )
        assets = session.exec(statement).all()

        # Convert to dictionaries for response
        asset_list = [
            {
                "id": str(asset.id),
                "user_id": asset.user_id,
                "link": asset.link,
                "type": asset.type,
                "status": asset.status,
                "creation_date": asset.creation_date.isoformat() if asset.creation_date else None,
                "updated_date": asset.updated_date.isoformat() if asset.updated_date else None,
            }
            for asset in assets
        ]

        return asset_list

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve assets: {str(e)}",
        )


@r.post("/", response_model=dict)
async def upload_asset(
    link: str,
    asset_type: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Create a new asset for the authenticated user.

    Args:
        link: URL or path to the asset
        asset_type: Type of asset (image, audio, video)
        current_user: Authenticated user from dependency

    Returns:
        Created asset information
    """
    if asset_type not in ["image", "audio", "video"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Asset type must be one of: image, audio, video",
        )

    try:
        # Create new asset
        new_asset = Asset(
            user_id=current_user.database_id,
            link=link,
            type=asset_type,
            status="active",
        )

        session.add(new_asset)
        session.commit()
        session.refresh(new_asset)

        return {
            "id": str(new_asset.id),
            "user_id": new_asset.user_id,
            "link": new_asset.link,
            "type": new_asset.type,
            "status": new_asset.status,
            "creation_date": new_asset.creation_date.isoformat() if new_asset.creation_date else None,
            "updated_date": new_asset.updated_date.isoformat() if new_asset.updated_date else None,
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create asset: {str(e)}",
        )


@r.delete("/{asset_id}", response_model=dict)
async def delete_asset(
    asset_id: str,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Soft delete an asset (set status to 'deleted').

    Args:
        asset_id: ID of the asset to delete
        current_user: Authenticated user from dependency

    Returns:
        Success message
    """
    try:
        # Get the asset
        statement = select(Asset).where(Asset.id == asset_id)
        asset = session.exec(statement).first()

        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found",
            )

        # Verify ownership
        if asset.user_id != current_user.database_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this asset",
            )

        # Soft delete by setting status to 'deleted'
        asset.status = "deleted"
        session.add(asset)
        session.commit()

        return {
            "message": "Asset deleted successfully",
            "id": str(asset.id),
        }

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete asset: {str(e)}",
        )