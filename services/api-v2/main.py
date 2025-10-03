from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os

# Database configuration - using same database as backend
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://videostack_user:videostack_password@db:5432/videostack")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database model for API v2
class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    duration = Column(Integer)  # in seconds
    created_at = Column(DateTime, default=func.now())

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VideoStack API v2", version="2.0.0")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to VideoStack API v2", "status": "running", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-v2"}

@app.post("/videos/")
async def create_video(title: str, description: str = None, duration: int = 0, db: Session = Depends(get_db)):
    db_video = Video(title=title, description=description, duration=duration)
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return {
        "id": db_video.id,
        "title": db_video.title,
        "description": db_video.description,
        "duration": db_video.duration,
        "created_at": db_video.created_at
    }

@app.get("/videos/")
async def list_videos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    videos = db.query(Video).offset(skip).limit(limit).all()
    return [
        {
            "id": video.id,
            "title": video.title,
            "description": video.description,
            "duration": video.duration,
            "created_at": video.created_at
        }
        for video in videos
    ]

@app.get("/videos/{video_id}")
async def get_video(video_id: int, db: Session = Depends(get_db)):
    db_video = db.query(Video).filter(Video.id == video_id).first()
    if db_video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    return {
        "id": db_video.id,
        "title": db_video.title,
        "description": db_video.description,
        "duration": db_video.duration,
        "created_at": db_video.created_at
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
