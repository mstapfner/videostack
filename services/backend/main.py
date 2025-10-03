from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import os
import logging
import time
from contextlib import asynccontextmanager
from alembic.config import Config
from alembic import command

from routers.auth_router import auth_router
from routers.asset_router import asset_router
from routers.generation_router import generation_router
from routers.story_board_router import story_board_router
from routers.storyboard_v2_router import storyboard_v2_router

# Database setup
from db.session import engine

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LoggingMiddleware:
    """Middleware to log all incoming requests."""

    async def __call__(self, request: Request, call_next):
        start_time = time.time()

        # Log request details
        logger.info(f"Request: {request.method} {request.url.path}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        logger.debug(f"Request query params: {dict(request.query_params)}")

        # Log request body for debugging (only for small requests to avoid memory issues)
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                if body and len(body) < 1000:  # Only log small request bodies
                    logger.debug(f"Request body: {body}")
                elif body:
                    logger.debug(f"Request body: [Large body - {len(body)} bytes]")
            except Exception as e:
                logger.debug(f"Could not read request body: {e}")

        try:
            response = await call_next(request)
            process_time = time.time() - start_time

            # Log response details
            logger.info(f"Response: {response.status_code} - {process_time:.4f}s")
            logger.debug(f"Response headers: {dict(response.headers)}")

            return response
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(f"Exception: {str(e)} - {process_time:.4f}s")
            raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown events."""
    # Run database migrations on startup
    try:
        alembic_cfg = Config("./alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("Database migrations completed successfully")
    except Exception as e:
        print(f"Error running migrations: {e}")

    yield
    pass

app = FastAPI(title="VideoStack API", version="1.0.0", lifespan=lifespan)

# Add logging middleware
app.middleware("http")(LoggingMiddleware())

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(asset_router, prefix="/api/assets", tags=["assets"])
app.include_router(generation_router, prefix="/api/generations", tags=["generations"])
app.include_router(story_board_router, prefix="/api/storyboard", tags=["storyboard"])
app.include_router(storyboard_v2_router, prefix="/api/storyboard_v2", tags=["storyboards-v2"])



@app.get("/")
async def root():
    return {"message": "Welcome to VideoStack API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
