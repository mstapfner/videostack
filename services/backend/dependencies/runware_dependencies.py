
import asyncio
import logging
from typing import Optional, Dict, Any, Literal
from runware import IAudioInference, Runware, IImageInference, IVideoInference, IAudioSettings, IAudioOutputFormat

from config import RUNWARE_API_KEY

logger = logging.getLogger(__name__)

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
    output_format: Literal["MP4", "WEBM"] = "MP4",
    output_quality: int = 85,
    number_results: int = 1,
    include_cost: bool = True,
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
        output_format: Output video format (MP4 or WEBM)
        output_quality: Output quality (0-100)
        number_results: Number of videos to generate
        include_cost: Include cost information in response
        
    Returns:
        URL of the generated video, or None if generation failed
    """
    request = IVideoInference(
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
    videos = await runware.videoInference(requestVideo=request)  # type: ignore
    return videos[0].videoURL if videos else None


async def generate_image(prompt: str, model: str, width: int, height: int):
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