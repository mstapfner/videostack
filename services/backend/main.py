from fastapi import FastAPI, Depends, HTTPException
import os
from contextlib import asynccontextmanager
from alembic.config import Config
from alembic import command

from routers.auth_router import auth_router
from routers.asset_router import asset_router
from routers.generation_router import generation_router

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

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(asset_router, prefix="/api/assets", tags=["assets"])
app.include_router(generation_router, prefix="/api/generations", tags=["generations"])



@app.get("/")
async def root():
    return {"message": "Welcome to VideoStack API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
