import os
from dotenv import load_dotenv

load_dotenv()

WORKOS_CLIENT_ID = os.getenv("WORKOS_CLIENT_ID", "")
WORKOS_API_KEY = os.getenv("WORKOS_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://videostack_user:videostack_password@db:5432/videostack")

# Your frontend URL, for redirects
CLIENT_URL = "http://localhost:3000"

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")

RUNWARE_API_KEY = os.getenv("RUNWARE_API_KEY", "")

# Bytedance
ARK_API_KEY = os.getenv("ARK_API_KEY", "")
ARK_BASE_URL = os.getenv("ARK_BASE_URL", "https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations")

# AWS 
ACCESS_KEY = os.getenv("AWS_ACCESS_KEY", "")
SECRET_KEY = os.getenv("AWS_SECRET_KEY", "")
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "videostack-uploads")