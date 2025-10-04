import asyncio
import httpx
import logging
from typing import Optional, Dict, Any, List

from config import ARK_API_KEY

logger = logging.getLogger(__name__)

ARK_API_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3"


async def generate_video(
    text: Optional[str] = None,
    first_image: Optional[str] = None,
    last_image: Optional[str] = None,
    model: str = "seedance-1-0-lite-i2v-250428",
    resolution: str = "720p",
    duration: int = 5,
    camera_fixed: bool = False,
) -> Optional[Dict[str, Any]]:
    """
    Generate a video using ByteDance ARK API with polling for completion.

    Args:
        text: Optional text prompt for video generation
        first_image: Optional URL to the first image
        last_image: Optional URL to the last image (if supported by model)
        model: Model to use (default: seedance-1-0-lite-i2v-250428)
        resolution: Video resolution (default: 720p)
        duration: Video duration in seconds (default: 5)
        camera_fixed: Whether camera should be fixed (default: False)

    Returns:
        Dictionary containing video_url and task_id, or None if generation failed
        Polls for up to 5 minutes waiting for task completion.
    """
    try:
        # Build content array based on provided parameters
        content: List[Dict[str, Any]] = []
        
        # Add text content if provided
        if text:
            # Append video generation parameters to text
            text_with_params = f"{text} --resolution {resolution} --duration {duration} --camera{'fixed' if camera_fixed else 'fixed false'}"
            content.append({
                "type": "text",
                "text": text_with_params
            })
        
        # Add first image if provided
        # Strip all spaces from the image url

        if first_image:
            first_image = first_image.replace(" ", "")
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": first_image
                },
                "role": "first_frame"
            })
        
        # Add last image if provided
        if last_image:
            last_image = last_image.replace(" ", "")
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": last_image
                }, 
                "role": "last_frame"
            })
        
        # Validate that at least one content item is provided
        if not content:
            logger.error("At least one of text, first_image, or last_image must be provided")
            return None
        
        # Build request payload
        payload = {
            "model": model,
            "content": content
        }
        
        # Make API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {ARK_API_KEY}"
        }
        

        print(f"ByteDance video generation task created: {payload}")

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{ARK_API_BASE_URL}/contents/generations/tasks",
                json=payload,
                headers=headers
            )
            
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"ByteDance video generation task created: {result}")
        
        

            # Extract task ID and start polling
            task_id = result.get("id")
            if not task_id:
                logger.error("No task ID returned from ByteDance API")
                return None

            logger.info(f"ByteDance video generation task created: {task_id}")

            # Poll for task completion
            max_polls = 60  # Maximum 5 minutes (60 * 5 second intervals)
            poll_interval = 5  # Poll every 5 seconds

            for _ in range(max_polls):
                try:
                    # Check task status
                    status_response = await client.get(
                        f"{ARK_API_BASE_URL}/contents/generations/tasks/{task_id}",
                        headers=headers
                    )

                    if status_response.status_code == 200:
                        status_data = status_response.json()

                        # Check if task is completed
                        if status_data.get("status") == "succeeded":
                            # try to get a single video url from the response
                            video_url = status_data.get("content", {}).get("video_url")
                            if video_url:
                                logger.info(f"Video generation completed for task {task_id}")
                                return {"video_url": video_url, "task_id": task_id}
                            
                            # Extract video URL from the response
                            contents = status_data.get("contents", [])
                            if contents and len(contents) > 0:
                                video_url = contents[0].get("url")
                                if video_url:
                                    logger.info(f"Video generation completed for task {task_id}")
                                    return {"video_url": video_url, "task_id": task_id}

                        # If task is still processing, wait and poll again
                        elif status_data.get("status") in ["pending", "processing"]:
                            await asyncio.sleep(poll_interval)
                            continue

                        # If task failed, log error and return None
                        elif status_data.get("status") == "failed":
                            logger.error(f"Video generation failed for task {task_id}: {status_data.get('error', 'Unknown error')}")
                            return None

                    # If status check fails, wait and try again
                    await asyncio.sleep(poll_interval)

                except Exception as e:
                    logger.error(f"Error polling task status for {task_id}: {str(e)}")
                    await asyncio.sleep(poll_interval)

            # If we reach here, polling timed out
            logger.error(f"Video generation polling timed out for task {task_id}")
            return None
        
            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error during ByteDance video generation: {e.response.status_code} - {e.response.text}")
        return None
    except Exception as e:
        logger.error(f"Error during ByteDance video generation: {str(e)}")
        return None


async def generate_image(
    text: str,
    model: str = "seedance-1-0-lite-t2i",
    resolution: str = "1024x1024",
) -> Optional[Dict[str, Any]]:
    """
    Generate an image using ByteDance ARK API.
    
    Args:
        text: Text prompt for image generation
        model: Model to use (default: seedance-1-0-lite-t2i)
        resolution: Image resolution (default: 1024x1024)
        
    Returns:
        API response as a dictionary, or None if generation failed
    """
    try:
        # Build request payload for image generation
        text_with_params = f"{text} --resolution {resolution}"
        
        payload = {
            "model": model,
            "content": [
                {
                    "type": "text",
                    "text": text_with_params
                }
            ]
        }
        
        # Make API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {ARK_API_KEY}"
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{ARK_API_BASE_URL}/contents/generations/tasks",
                json=payload,
                headers=headers 
            )
            
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"ByteDance image generation task created: {result}")
                # Extract task ID and start polling
            task_id = result.get("id")
            if not task_id:
                logger.error("No task ID returned from ByteDance API")
                return None

            logger.info(f"ByteDance video generation task created: {task_id}")

            # Poll for task completion
            max_polls = 60  # Maximum 5 minutes (60 * 5 second intervals)
            poll_interval = 5  # Poll every 5 seconds

            for _ in range(max_polls):
                try:
                    # Check task status
                    status_response = await client.get(
                        f"{ARK_API_BASE_URL}/contents/generations/tasks/{task_id}",
                        headers=headers
                    )

                    if status_response.status_code == 200:
                        status_data = status_response.json()

                        # Check if task is completed
                        if status_data.get("status") == "succeeded":
                            # Extract video URL from the response
                            contents = status_data.get("contents", [])
                            if contents and len(contents) > 0:
                                video_url = contents[0].get("url")
                                if video_url:
                                    logger.info(f"Video generation completed for task {task_id}")
                                    return {"video_url": video_url, "task_id": task_id}

                        # If task is still processing, wait and poll again
                        elif status_data.get("status") in ["pending", "processing"]:
                            await asyncio.sleep(poll_interval)
                            continue

                        # If task failed, log error and return None
                        elif status_data.get("status") == "failed":
                            logger.error(f"Video generation failed for task {task_id}: {status_data.get('error', 'Unknown error')}")
                            return None

                    # If status check fails, wait and try again
                    await asyncio.sleep(poll_interval)

                except Exception as e:
                    logger.error(f"Error polling task status for {task_id}: {str(e)}")
                    await asyncio.sleep(poll_interval)

            # If we reach here, polling timed out
            logger.error(f"Video generation polling timed out for task {task_id}")
            return None
            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error during ByteDance image generation: {e.response.status_code} - {e.response.text}")
        return None
    except Exception as e:
        logger.error(f"Error during ByteDance image generation: {str(e)}")
        return None