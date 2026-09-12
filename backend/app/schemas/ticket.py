from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TicketResponse(BaseModel):
    id: int
    registration_id: int
    ticket_code: str
    qr_token: str
    qr_code_image: Optional[str] = None # Base64 data URL
    issued_at: datetime
    used: bool
    used_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TicketDetailResponse(TicketResponse):
    event_id: int
    event_title: str
    club_name: str
    venue: str
    start_time: datetime
    end_time: datetime
    user_name: str
    user_email: str
    registration_status: str
