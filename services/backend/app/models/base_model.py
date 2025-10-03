import uuid
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel
from pydantic import ConfigDict


class BasicModel(SQLModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    creation_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": datetime.now(timezone.utc)},
    )
