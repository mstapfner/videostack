#app/db/session.py
from sqlmodel import create_engine, Session
from config import DATABASE_URL

# Create engine for SQLModel (uses SQLAlchemy 2.0 engine)
engine = create_engine(DATABASE_URL, echo=False)


def get_session():
    """
    Dependency function to get database session.
    
    Usage in FastAPI routes:
        async def route(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session