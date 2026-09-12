from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse

class ClubBase(BaseModel):
    name: str
    email: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

class ClubCreate(ClubBase):
    pass

class ClubUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

class ClubOrganizerCreate(BaseModel):
    email: str
    role_title: Optional[str] = "Event Organizer"

class ClubOrganizerResponse(BaseModel):
    id: int
    club_id: int
    user_id: int
    role_title: str
    assigned_at: datetime
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ClubResponse(ClubBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ClubWithOrganizersResponse(ClubResponse):
    organizers: List[ClubOrganizerResponse] = []
