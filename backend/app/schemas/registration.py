from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.registration import RegistrationStatus
from app.schemas.ticket import TicketResponse
from app.schemas.user import UserResponse

class RegistrationCreate(BaseModel):
    pass

class RegistrationResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    registered_at: datetime
    status: RegistrationStatus
    ticket: Optional[TicketResponse] = None
    user: Optional[UserResponse] = None
    event_title: Optional[str] = None
    event_venue: Optional[str] = None
    event_start_time: Optional[datetime] = None
    event_end_time: Optional[datetime] = None
    club_name: Optional[str] = None

    class Config:
        from_attributes = True
