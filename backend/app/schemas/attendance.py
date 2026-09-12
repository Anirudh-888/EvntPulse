from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CheckInRequest(BaseModel):
    event_id: int
    qr_token: Optional[str] = None
    ticket_code: Optional[str] = None

class CheckInResponse(BaseModel):
    success: bool
    status: str # SUCCESS, ALREADY_CHECKED_IN, INVALID_TICKET, WRONG_EVENT, UNAUTHORIZED
    message: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    ticket_code: Optional[str] = None
    checked_in_at: Optional[datetime] = None

class AttendanceRecordResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    ticket_id: int
    checked_in_at: datetime
    checked_in_by: Optional[int] = None
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    ticket_code: Optional[str] = None

    class Config:
        from_attributes = True

class AttendanceStatsResponse(BaseModel):
    event_id: int
    total_registrations: int
    checked_in_count: int
    remaining_count: int
    attendance_rate: float
