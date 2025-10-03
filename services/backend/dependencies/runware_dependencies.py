
import asyncio
from runware import Runware, IImageInference, IVideoInference

from services.backend.config import RUNWARE_API_KEY

# SDK reads RUNWARE_API_KEY automatically
runware = Runware(api_key=RUNWARE_API_KEY)
connection = runware.connect()


async def generate_video(prompt: str, model: str, width: int, height: int):
    request = IVideoInference(
        positivePrompt=prompt,
        model=model,
        width=width,
        height=height
    )
    videos = await runware.videoInference(requestVideo=request)
    return videos[0].videoURL if videos else None


async def generate_image(prompt: str, model: str, width: int, height: int):
    request = IImageInference(
        positivePrompt=prompt,
        model=model,
        width=width,
        height=height
    )
    images = await runware.imageInference(requestImage=request)
    return images[0].imageURL if images else None
