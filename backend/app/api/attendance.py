from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.event import Event
from app.schemas.attendance import CheckInRequest, CheckInResponse, AttendanceStatsResponse, AttendanceRecordResponse
from app.services import attendance_service
from app.api.deps import get_current_user, require_roles

from app.utils.permissions import can_manage_event

router = APIRouter(tags=["Attendance"])

@router.post("/attendance/check-in", response_model=CheckInResponse)
def check_in(
    check_in_data: CheckInRequest,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    return attendance_service.check_in_attendee(db, check_in_data, current_user)

@router.get("/events/{event_id}/attendance/stats", response_model=AttendanceStatsResponse)
def get_attendance_stats(
    event_id: int,
    db: Session = Depends(get_db)
):
    return attendance_service.get_event_attendance_stats(db, event_id)

@router.get("/events/{event_id}/attendance", response_model=List[AttendanceRecordResponse])
def get_attendance_records(
    event_id: int,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if not can_manage_event(current_user, event):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    return attendance_service.get_event_attendees(db, event_id)
