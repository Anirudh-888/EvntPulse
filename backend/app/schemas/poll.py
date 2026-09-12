from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.poll import PollStatus

class PollOptionCreate(BaseModel):
    option_text: str

class PollOptionResponse(BaseModel):
    id: int
    poll_id: int
    option_text: str
    vote_count: Optional[int] = 0
    vote_percentage: Optional[float] = 0.0

    class Config:
        from_attributes = True

class PollCreate(BaseModel):
    question: str
    options: List[str]

class PollVoteRequest(BaseModel):
    option_id: int

class PollResponse(BaseModel):
    id: int
    event_id: int
    question: str
    status: PollStatus
    created_at: datetime
    closed_at: Optional[datetime] = None
    options: List[PollOptionResponse] = []
    total_votes: Optional[int] = 0
    user_voted_option_id: Optional[int] = None

    class Config:
        from_attributes = True

class PollResultsResponse(BaseModel):
    poll_id: int
    question: str
    status: PollStatus
    total_responses: int
    options: List[PollOptionResponse]
