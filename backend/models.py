from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class ReviewBase(SQLModel):
    rating: int
    content: str
    response: Optional[str] = None
    summary: Optional[str] = None
    suggestedAction: Optional[str] = None
    sentiment: Optional[str] = None # Positive, Neutral, Negative
    aspects: Optional[str] = None   # JSON list of aspects

class Review(ReviewBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class ReviewCreate(ReviewBase):
    createdAt: Optional[datetime] = None

class ReviewRead(ReviewBase):
    id: int
    createdAt: datetime

class Admin(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str

class AdminNote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: int = Field(foreign_key="review.id")
    admin_id: Optional[int] = Field(foreign_key="admin.id") # Optional to keep it simple if logic changes
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
