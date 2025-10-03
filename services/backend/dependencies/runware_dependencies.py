
import asyncio
from typing import Optional, Dict, Any
from runware import Runware, IImageInference, IVideoInference

from config import RUNWARE_API_KEY

# SDK reads RUNWARE_API_KEY automatically
runware = Runware(api_key=RUNWARE_API_KEY)
connection = runware.connect()


async def generate_video(
    prompt: str,
    model: str = "bytedance:2@1",
    width: int = 864,
    height: int = 480,
    duration: int = 5,
    fps: int = 24,
    output_format: str = "mp4",
    output_quality: int = 85,
    number_results: int = 1,
    include_cost: bool = True,
    provider_settings: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    """
    Generate a video using Runware API with comprehensive parameters.
    
    Args:
        prompt: Text prompt for video generation
        model: Model to use (default: bytedance:2@1)
        width: Video width in pixels
        height: Video height in pixels
        duration: Video duration in seconds
        fps: Frames per second
        output_format: Output video format (mp4, etc.)
        output_quality: Output quality (0-100)
        number_results: Number of videos to generate
        include_cost: Include cost information in response
        provider_settings: Provider-specific settings
        
    Returns:
        URL of the generated video, or None if generation failed
    """
    if provider_settings is None:
        provider_settings = {"bytedance": {"cameraFixed": False}}
    
    request = {
        "positivePrompt": prompt,
        "model": model,
        "width": width,
        "height": height,
        "duration": duration,
        "fps": fps,
        "outputFormat": output_format,
        "outputQuality": output_quality,
        "numberResults": number_results,
        "includeCost": include_cost,
        "providerSettings": provider_settings,
    }
    videos = await runware.videoInference(requestVideo=request)  # type: ignore
    return videos[0].videoURL if videos else None


async def generate_image(prompt: str, model: str, width: int, height: int):
    request = {
        "positivePrompt": prompt,
        "model": model,
        "width": width,
        "height": height
    }
    images = await runware.imageInference(requestImage=request)  # type: ignore
    return images[0].imageURL if images else None
