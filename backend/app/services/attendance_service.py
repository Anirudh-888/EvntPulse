from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.event import Event
from app.models.ticket import Ticket
from app.models.registration import Registration, RegistrationStatus
from app.models.attendance import Attendance
from app.models.user import User, UserRole
from app.schemas.attendance import CheckInRequest, CheckInResponse, AttendanceStatsResponse, AttendanceRecordResponse
from app.utils.permissions import can_manage_event

def check_in_attendee(
    db: Session,
    check_in_data: CheckInRequest,
    current_user: User
) -> CheckInResponse:
    event = db.query(Event).filter(Event.id == check_in_data.event_id).first()
    if not event:
        return CheckInResponse(
            success=False,
            status="WRONG_EVENT",
            message="Event not found"
        )

    # Validate organizer owns this event's club, is an assigned organizer, or is admin
    if not can_manage_event(current_user, event):
        return CheckInResponse(
            success=False,
            status="UNAUTHORIZED",
            message="You do not have permission to check in attendees for this event"
        )

    # Locate ticket via QR token or ticket code
    ticket = None
    if check_in_data.qr_token:
        ticket = db.query(Ticket).filter(Ticket.qr_token == check_in_data.qr_token.strip()).first()
    elif check_in_data.ticket_code:
        clean_code = check_in_data.ticket_code.strip().upper()
        ticket = db.query(Ticket).filter(Ticket.ticket_code == clean_code).first()

    if not ticket:
        return CheckInResponse(
            success=False,
            status="INVALID_TICKET",
            message="Invalid ticket: No matching ticket found"
        )

    registration = ticket.registration
    if not registration:
        return CheckInResponse(
            success=False,
            status="INVALID_TICKET",
            message="Invalid ticket: Registration record missing"
        )

    # Check if ticket belongs to this event
    if registration.event_id != event.id:
        return CheckInResponse(
            success=False,
            status="WRONG_EVENT",
            message=f"Ticket belongs to a different event ({registration.event.title})"
        )

    # Check if ticket was cancelled
    if registration.status == RegistrationStatus.CANCELLED:
        return CheckInResponse(
            success=False,
            status="INVALID_TICKET",
            message="Ticket is invalid: Registration was cancelled"
        )

    # Check if already checked in
    if ticket.used:
        existing_att = db.query(Attendance).filter(Attendance.ticket_id == ticket.id).first()
        check_in_time = existing_att.checked_in_at if existing_att else ticket.used_at
        return CheckInResponse(
            success=False,
            status="ALREADY_CHECKED_IN",
            message="Ticket already checked in.",
            student_name=registration.user.name,
            student_email=registration.user.email,
            ticket_code=ticket.ticket_code,
            checked_in_at=check_in_time
        )

    # Check duplicate attendance record
    duplicate_att = db.query(Attendance).filter(
        Attendance.event_id == event.id,
        Attendance.user_id == registration.user_id
    ).first()

    if duplicate_att:
        ticket.used = True
        ticket.used_at = duplicate_att.checked_in_at
        db.commit()
        return CheckInResponse(
            success=False,
            status="ALREADY_CHECKED_IN",
            message="Ticket already checked in.",
            student_name=registration.user.name,
            student_email=registration.user.email,
            ticket_code=ticket.ticket_code,
            checked_in_at=duplicate_att.checked_in_at
        )

    # Perform Check-in
    now = datetime.now(timezone.utc)
    ticket.used = True
    ticket.used_at = now
    registration.status = RegistrationStatus.ATTENDED

    attendance_record = Attendance(
        event_id=event.id,
        user_id=registration.user_id,
        ticket_id=ticket.id,
        checked_in_at=now,
        checked_in_by=current_user.id
    )
    db.add(attendance_record)
    db.commit()
    db.refresh(attendance_record)

    return CheckInResponse(
        success=True,
        status="SUCCESS",
        message="Check-in successful! Welcome to the event.",
        student_name=registration.user.name,
        student_email=registration.user.email,
        ticket_code=ticket.ticket_code,
        checked_in_at=now
    )

def get_event_attendance_stats(db: Session, event_id: int) -> AttendanceStatsResponse:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    total_regs = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.status.in_([RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED])
    ).count()

    checked_in = db.query(Attendance).filter(Attendance.event_id == event_id).count()
    remaining = max(0, total_regs - checked_in)
    rate = round((checked_in / total_regs * 100.0), 1) if total_regs > 0 else 0.0

    return AttendanceStatsResponse(
        event_id=event_id,
        total_registrations=total_regs,
        checked_in_count=checked_in,
        remaining_count=remaining,
        attendance_rate=rate
    )

def get_event_attendees(db: Session, event_id: int) -> List[AttendanceRecordResponse]:
    records = db.query(Attendance).filter(Attendance.event_id == event_id).order_by(Attendance.checked_in_at.desc()).all()
    results = []
    for att in records:
        results.append(
            AttendanceRecordResponse(
                id=att.id,
                event_id=att.event_id,
                user_id=att.user_id,
                ticket_id=att.ticket_id,
                checked_in_at=att.checked_in_at,
                checked_in_by=att.checked_in_by,
                student_name=att.user.name if att.user else "Unknown",
                student_email=att.user.email if att.user else "",
                ticket_code=att.ticket.ticket_code if att.ticket else ""
            )
        )
    return results
