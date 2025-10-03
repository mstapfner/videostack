from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from contextlib import asynccontextmanager
from alembic.config import Config
from alembic import command

from routers.auth_router import auth_router
from routers.asset_router import asset_router
from routers.generation_router import generation_router
from routers.story_board_router import story_board_router

# Database setup
from db.session import engine

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



@app.get("/")
async def root():
    return {"message": "Welcome to VideoStack API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
