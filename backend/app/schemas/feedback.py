from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from app.schemas.user import UserResponse

class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    submitted_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class FeedbackStatsResponse(BaseModel):
    event_id: int
    total_feedback: int
    average_rating: float
    rating_distribution: Dict[int, int] # {5: count, 4: count, ...}
    recent_feedbacks: List[FeedbackResponse] = []
