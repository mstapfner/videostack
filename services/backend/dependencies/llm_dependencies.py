import json

from pydantic import BaseModel
from config import GROQ_API_KEY, GROQ_API_URL
from groq import Groq
from typing import List, Optional


client = Groq(api_key=GROQ_API_KEY)


class StoryboardShot(BaseModel): 
    id: str
    position: int
    name: str
    prompt: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    duration_in_seconds: Optional[int] = None

class StoryboardScene(BaseModel): 
    id: str
    position: int
    name: str
    shots: List[StoryboardShot]

class StoryBoard(BaseModel): 
    title: str
    description: str 
    user_prompt: str
    scenes: List[StoryboardScene]


MASTER_PROMPT = (
    "You are a world-class cinematic video director. "
    "Given the following user prompt, generate a detailed, creative, and visually rich description for every image in the storyboard."
    "Each description must be a single, flowing paragraph under 100 words. Descriptions must be literal and precise."
    "It's important to keep the storyboardscenes to each other and the user prompt, so if one scene is based on the previous one, make sure to describe in the scene all relevant elements. "
    "If two shots are closely related to each other or referencing each other, you must group them into a single scene."
    "Scene counting starts at 0."
    "Come up with a suitable duration for each scene in seconds, the maxium is 10 seconds and the minimum is 2 seconds."
    "User prompt: \"{user_prompt}\""
)

async def generate_storyboard_scenes(user_input: str): 

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": "You are a world-class cinematic video director. Come up with a short storyboard with maximum 6 scenes. For every scene, you must provide atleast a single shot and that shot should contain a prompt that will be used to generate the scene. YOU MUST PROVIDE AT LEAST ONE SCENE; MAKE SURE TO WRITE THE SCENES BASED ON THE USER PROMPT. IT IS VERY IMPORTANT TO GROUP THE SHOTS TOGETHER INTO SCENES THAT MAKE SENSE AND ARE VISUALLY COHERENT."}, 
            {
                "role": "user",
                "content": MASTER_PROMPT.format(user_prompt=user_input),
            },
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "StoryBoard",
                "schema": StoryBoard.model_json_schema()
            }
        }, 
        temperature=0.8
    )
    
    storyboard = StoryBoard.model_validate(json.loads(response.choices[0].message.content))
    return storyboard



class StoryboardOption(BaseModel): 
    title: str
    content: str

class StoryboardOptions(BaseModel): 
    options: List[StoryboardOption]


async def generate_storyboard_options(user_input: str): 
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": """
You are a world-class cinematic video director. Generate two options with the following task: 

Expand the user prompt into a story, but you are not allowed to mention scenes or shots or the length of it. 
FOCUS ON A GOOD STORY, NOT ABOUT DESCRIBING THE SETTING, ETC. IT HAS TO BE A STORY!!!!
COME UP WITH AN INTERESTING TITLE FOR EACH OPTION.
IT IS VERY IMPORTANT TO WRITE THE STORY BASED ON THE USER PROMPT, BUT YOU ARE ALLOWED TO BE CREATIVE.

YOU ARE ONLY ALLOWED TO RETURN TWO OPTIONS, NOT MORE.
"""}, 
            {
                "role": "user",
                "content": user_input,
            },
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "StoryboardOptions",
                "schema": StoryboardOptions.model_json_schema()
            }
        },
        temperature=0.8
    )
    storyboard_options = StoryboardOptions.model_validate(json.loads(response.choices[0].message.content))
    return storyboard_options