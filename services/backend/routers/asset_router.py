from fastapi import APIRouter
from models.asset import Asset
from db.session import get_session


asset_router = r = APIRouter()


@r.get("/assets")
async def get_assets_by_user_id(user_id: str):
    return {"message": "Assets"}


@r.post("/assets")
async def upload_asset(asset: Asset):
    return {"message": "Asset created"}