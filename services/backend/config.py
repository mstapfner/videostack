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
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "videostack-uploads")
AWS_REGION = os.getenv("AWS_REGION", "eu-central-1")

class Settings:
    """Application settings."""

    # Database
    database_url: str = DATABASE_URL

    # Auth
    workos_client_id: str = WORKOS_CLIENT_ID
    workos_api_key: str = WORKOS_API_KEY

    # APIs
    openai_api_key: str = OPENAI_API_KEY
    groq_api_key: str = GROQ_API_KEY
    groq_api_url: str = GROQ_API_URL
    runware_api_key: str = RUNWARE_API_KEY

    # Bytedance
    ark_api_key: str = ARK_API_KEY
    ark_base_url: str = ARK_BASE_URL

    # AWS
    aws_access_key_id: str = AWS_ACCESS_KEY_ID
    aws_secret_access_key: str = AWS_SECRET_ACCESS_KEY
    s3_bucket_name: str = S3_BUCKET_NAME
    aws_region: str = AWS_REGION

    # Client
    client_url: str = CLIENT_URL

def get_settings() -> Settings:
    """Get application settings."""
    return Settings()