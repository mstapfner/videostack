from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://videostack_user:videostack_password@db:5432/videostack")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database model example
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, index=True)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VideoStack API", version="1.0.0")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to VideoStack API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/users/")
async def create_user(email: str, username: str, db: Session = Depends(get_db)):
    db_user = User(email=email, username=username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"id": db_user.id, "email": db_user.email, "username": db_user.username}

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": db_user.id, "email": db_user.email, "username": db_user.username}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
