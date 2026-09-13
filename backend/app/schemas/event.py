from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from datetime import datetime
from app.models.event import EventStatus, EventCategory
from app.schemas.club import ClubResponse

class EventBase(BaseModel):
    title: str
    description: str
    category: EventCategory = EventCategory.TECHNOLOGY
    venue: str
    start_time: datetime
    end_time: datetime
    registration_deadline: datetime
    capacity: int = Field(default=100, gt=0)
    poster_url: Optional[str] = None
    rsvp_email_1: Optional[str] = None
    rsvp_email_2: Optional[str] = None

class EventCreate(EventBase):
    club_id: int
    status: Optional[EventStatus] = EventStatus.DRAFT

    @model_validator(mode="after")
    def validate_event_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("End time must be after start time")
        if self.registration_deadline > self.start_time:
            raise ValueError("Registration deadline must be before or equal to event start time")
        return self

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[EventCategory] = None
    venue: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    capacity: Optional[int] = Field(default=None, gt=0)
    poster_url: Optional[str] = None
    status: Optional[EventStatus] = None
    rsvp_email_1: Optional[str] = None
    rsvp_email_2: Optional[str] = None

class EventResponse(EventBase):
    id: int
    club_id: int
    status: EventStatus
    created_at: datetime
    updated_at: datetime
    registered_count: Optional[int] = 0
    available_slots: Optional[int] = None
    club: Optional[ClubResponse] = None

    class Config:
        from_attributes = True

class EventDetailResponse(EventResponse):
    is_registered: Optional[bool] = False
    is_attended: Optional[bool] = False
    my_ticket_id: Optional[int] = None
    my_ticket_code: Optional[str] = None
