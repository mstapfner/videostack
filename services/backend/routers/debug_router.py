"""Asset router for managing user assets."""

from fastapi import APIRouter

from dependencies.bytedance_dependencies import generate_image

debug_router = r = APIRouter()


@r.get("/debug/bytedance")
async def debug_bytedance(prompt: str):
    return await generate_image(prompt)