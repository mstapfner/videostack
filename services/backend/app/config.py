import os
from dotenv import load_dotenv

load_dotenv()

WORKOS_CLIENT_ID = os.getenv("WORKOS_CLIENT_ID", "")
WORKOS_API_KEY = os.getenv("WORKOS_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://videostack_user:videostack_password@db:5432/videostack")

# Your frontend URL, for redirects
CLIENT_URL = "http://localhost:3000"