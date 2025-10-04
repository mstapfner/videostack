
import asyncio
import logging
import time
from typing import Optional, Dict, Any, Literal
import httpx
from runware import IAudioInference, Runware, IImageInference, IVideoInference, IAudioSettings, IAudioOutputFormat

from config import RUNWARE_API_KEY, ARK_API_KEY, ARK_BASE_URL

logger = logging.getLogger(__name__)

# SDK reads RUNWARE_API_KEY automatically
runware = Runware(api_key=RUNWARE_API_KEY)
connection = runware.connect()


async def generate_bytedance_video(
    prompt: str,
    model: str = "seedance-1-0-lite-t2v-250428",
    duration: int = 5,
    ratio: str = "16:9",
    resolution: str = "720p",
    fps: int = 24,
    camerafixed: bool = False,
    first_frame: Optional[str] = None,
    last_frame: Optional[str] = None,
) -> Optional[str]:
    """
    Generate a video using ByteDance Ark API with polling mechanism.

    Args:
        prompt: Text prompt for video generation
        model: ByteDance model to use (e.g., "seedance-1-0-lite-t2v-250428")
        duration: Video duration in seconds
        ratio: Aspect ratio (e.g., "16:9")
        resolution: Video resolution (e.g., "720p")
        fps: Frames per second
        camerafixed: Whether camera is fixed
        first_frame: Optional URL to first frame image for image-to-video
        last_frame: Optional URL to last frame image for first+last frame generation

    Returns:
        URL of the generated video, or None if generation failed
    """
    if not ARK_API_KEY:
        logger.error("ARK_API_KEY not configured for ByteDance API")
        return None

    # Determine the generation type based on model and available frames
    is_text_to_video = model.endswith('-t2v') or (not first_frame and not last_frame)
    has_first_frame_only = first_frame and not last_frame
    has_first_and_last_frames = first_frame and last_frame

    # Construct the content array based on generation type
    content = []

    # Add text content if prompt is provided
    if prompt:
        # Construct the full prompt with parameters
        full_prompt = f"{prompt} --ratio {ratio} --resolution {resolution} --duration {duration} --camerafixed {'true' if camerafixed else 'false'}"
        content.append({
            "type": "text",
            "text": full_prompt
        })

    # Add image content based on generation type
    if has_first_and_last_frames:
        # Image-to-Video-First and Last Frames
        content.append({
            "type": "image_url",
            "image_url": {"url": first_frame},
            "role": "first_frame"
        })
        content.append({
            "type": "image_url",
            "image_url": {"url": last_frame},
            "role": "last_frame"
        })
    elif has_first_frame_only:
        # Image-to-Video-First Frame
        content.append({
            "type": "image_url",
            "image_url": {"url": first_frame},
            "role": "first_frame"
        })

    # Validate content structure
    if not content:
        logger.error("No content provided for video generation")
        return None

    # Step 1: Create generation task
    task_url = f"{ARK_BASE_URL}/tasks"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ARK_API_KEY}"
    }

    payload = {
        "model": model,
        "content": content
    }

    logger.info(f"Creating ByteDance video generation task with payload: {payload}")

    async with httpx.AsyncClient() as client:
        try:
            # Create task
            response = await client.post(task_url, json=payload, headers=headers)
            response.raise_for_status()
            task_data = response.json()
            task_id = task_data.get("id")

            if not task_id:
                logger.error(f"Failed to get task ID from ByteDance API: {task_data}")
                return None

            logger.info(f"Created ByteDance video generation task: {task_id}")

            # Step 2: Poll for completion
            max_polls = 60  # Maximum 5 minutes (60 * 5 seconds)
            poll_interval = 5  # Poll every 5 seconds

            for attempt in range(max_polls):
                await asyncio.sleep(poll_interval)

                # Check task status
                status_url = f"{ARK_BASE_URL}/tasks/{task_id}"
                status_response = await client.get(status_url, headers=headers)
                status_response.raise_for_status()
                status_data = status_response.json()

                task_status = status_data.get("status")
                logger.info(f"Task {task_id} status: {task_status} (attempt {attempt + 1}/{max_polls})")

                if task_status == "succeeded":
                    video_url = status_data.get("content", {}).get("video_url")
                    if video_url:
                        logger.info(f"ByteDance video generation completed: {video_url}")
                        return video_url
                    else:
                        logger.error(f"Task succeeded but no video_url found: {status_data}")
                        return None

                elif task_status == "failed":
                    error_msg = status_data.get("error_message", "Unknown error")
                    logger.error(f"ByteDance video generation failed: {error_msg}")
                    return None

                elif task_status in ["running", "pending"]:
                    # Continue polling
                    continue

                else:
                    logger.warning(f"Unknown task status: {task_status}")
                    continue

            # Timeout
            logger.error(f"ByteDance video generation timed out after {max_polls * poll_interval} seconds")
            return None

        except httpx.HTTPError as e:
            logger.error(f"HTTP error during ByteDance video generation: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during ByteDance video generation: {e}")
            return None


async def generate_video(
    prompt: str,
    model: str = "bytedance:2@1",
    width: int = 864,
    height: int = 480,
    duration: int = 5,
    fps: int = 24,
    output_format: Literal["MP4", "WEBM"] = "MP4",
    output_quality: int = 85,
    number_results: int = 1,
    include_cost: bool = True,
    first_frame: Optional[str] = None,
    last_frame: Optional[str] = None,
) -> Optional[str]:
    """
    Generate a video using either ByteDance Ark API or Runware API based on the model.

    Args:
        prompt: Text prompt for video generation
        model: Model to use (ByteDance models like "seedance-1-0-lite-t2v-250428" or Runware models like "bytedance:2@1")
        width: Video width in pixels (used for Runware models)
        height: Video height in pixels (used for Runware models)
        duration: Video duration in seconds
        fps: Frames per second (used for Runware models)
        output_format: Output video format (used for Runware models)
        output_quality: Output quality (used for Runware models)
        number_results: Number of videos to generate (used for Runware models)
        include_cost: Include cost information in response (used for Runware models)
        first_frame: Optional URL to first frame image for image-to-video
        last_frame: Optional URL to last frame image for first+last frame generation

    Returns:
        URL of the generated video, or None if generation failed
    """
    # Check if this is a ByteDance model that needs the HTTP API workflow
    if model.startswith("seedance") or "seedance" in model:
        logger.info(f"Using ByteDance API for model: {model}")
        # Map duration to resolution and ratio for ByteDance API
        if width == 864 and height == 480:
            resolution = "720p"
            ratio = "16:9"
        elif width == 1024 and height == 576:
            resolution = "1080p"
            ratio = "16:9"
        else:
            resolution = "720p"
            ratio = "16:9"

        return await generate_bytedance_video(
            prompt=prompt,
            model=model,
            duration=duration,
            ratio=ratio,
            resolution=resolution,
            fps=fps,
            first_frame=first_frame,
            last_frame=last_frame,
        )
    else:
        # Use Runware SDK for other models
        logger.info(f"Using Runware SDK for model: {model}")
        video_request = IVideoInference(
            positivePrompt=prompt,
            model=model,
            width=width,
            height=height,
            duration=duration,
            fps=fps,
            outputFormat=output_format,
            outputQuality=output_quality,
            numberResults=number_results,
            includeCost=include_cost,
        )
        videos = await runware.videoInference(requestVideo=video_request)  # type: ignore
        return videos[0].videoURL if videos else None


async def generate_image(prompt: str, model: str, width: int, height: int):

    # TODO: implement seedance image generation
    # {"taskType":"imageInference","model":"google:4@1","positivePrompt":"indian music","numberResults":1,"outputType":["dataURI","URL"],"outputFormat":"JPEG","seed":923884216,"includeCost":true,"outputQuality":85,"taskUUID":"22891bc1-b39d-463e-9b82-8dc14464604c"}

    request = IImageInference(
        positivePrompt=prompt,
        model=model,
        width=width,
        height=height
    )
    images = await runware.imageInference(requestImage=request)  # type: ignore
    return images[0].imageURL if images else None


async def generate_audio(
    prompt: str,
    model: str = "elevenlabs:1@1",
    duration: int = 10,
    output_format: IAudioOutputFormat = "MP3",  # type: ignore
    bitrate: int = 128,
    sample_rate: int = 44100,
    number_results: int = 1,
    include_cost: bool = True,
) -> Optional[str]:
    """
    Generate audio using Runware API with comprehensive parameters.
    
    Args:
        prompt: Text prompt for audio generation
        model: Model to use (default: elevenlabs:1@1)
        duration: Audio duration in seconds
        output_format: Output audio format (MP3 or WAV)
        bitrate: Audio bitrate in kbps
        sample_rate: Audio sample rate in Hz
        number_results: Number of audio files to generate
        include_cost: Include cost information in response
        
    Returns:
        URL of the generated audio, or None if generation failed
    """
    try:
        print("\n========== AUDIO GENERATION DEBUG ==========")
        print(f"Prompt: {prompt}")
        print(f"Model: {model}")
        print(f"Duration: {duration}")
        print(f"Output format: {output_format}")
        print(f"Bitrate: {bitrate}")
        print(f"Sample rate: {sample_rate}")
        
        audio_settings = IAudioSettings(
            bitrate=bitrate,
            sampleRate=sample_rate,
        )
        print(f"Audio settings created: {audio_settings}")
        
        request = IAudioInference(
            positivePrompt=prompt,
            model=model,
            duration=duration,
            outputFormat=output_format,
            audioSettings=audio_settings,
            numberResults=number_results,
            includeCost=include_cost,
        )
        print(f"Request object created: {request}")
        
        print("Calling runware.audioInference()...")
        audios = await runware.audioInference(requestAudio=request)  # type: ignore
        
        print(f"Audio inference response: {audios}")
        print(f"Audio inference response type: {type(audios)}")
        
        if audios:
            print(f"Number of audio results: {len(audios)}")
            if len(audios) > 0:
                print(f"First audio object: {audios[0]}")
                print(f"First audio object type: {type(audios[0])}")
                print(f"First audio attributes: {dir(audios[0])}")
                
                # Try to access audioURL
                try:
                    audio_url = audios[0].audioURL
                    print(f"✅ Extracted audio URL: {audio_url}")
                    print("========== END AUDIO GENERATION DEBUG ==========\n")
                    return audio_url
                except AttributeError as ae:
                    print(f"❌ AttributeError accessing audioURL: {ae}")
                    # Try alternative attribute names
                    print(f"Checking for alternative attributes...")
                    for attr in dir(audios[0]):
                        if 'url' in attr.lower() or 'audio' in attr.lower():
                            print(f"  Found attribute: {attr} = {getattr(audios[0], attr, 'N/A')}")
        else:
            print("❌ No audio results returned (audios is None or empty)")
        
        print("========== END AUDIO GENERATION DEBUG ==========\n")
        return None
        
    except Exception as e:
        print(f"❌ ERROR in generate_audio: {str(e)}")
        print(f"Exception type: {type(e)}")
        import traceback
        print(f"Traceback:\n{traceback.format_exc()}")
        print("========== END AUDIO GENERATION DEBUG ==========\n")
        raise