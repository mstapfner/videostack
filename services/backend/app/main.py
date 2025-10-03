from fastapi import FastAPI, Depends, HTTPException
import os
from contextlib import asynccontextmanager
from alembic.config import Config
from alembic import command

# Database setup
from app.db.session import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown events."""
    # Run database migrations on startup
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("Database migrations completed successfully")
    except Exception as e:
        print(f"Error running migrations: {e}")

    yield

    # Cleanup code here if needed
    pass

app = FastAPI(title="VideoStack API", version="1.0.0", lifespan=lifespan)



@app.get("/")
async def root():
    return {"message": "Welcome to VideoStack API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
