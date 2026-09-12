from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.event import Event, EventStatus
from app.models.registration import Registration, RegistrationStatus
from app.models.ticket import Ticket
from app.models.user import User
from app.models.notification import Notification
from app.services.ticket_service import create_ticket_for_registration
from app.utils.qr import generate_qr_base64
from app.schemas.registration import RegistrationResponse
from app.schemas.ticket import TicketResponse

def register_user_for_event(db: Session, event_id: int, user: User) -> RegistrationResponse:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Verify event status
    if event.status not in [EventStatus.PUBLISHED, EventStatus.ONGOING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration is not open for this event (Status: {event.status.value})"
        )

    # Verify registration deadline
    now = datetime.now(timezone.utc)
    # Ensure event.registration_deadline is comparable
    event_deadline = event.registration_deadline
    if event_deadline.tzinfo is None:
        event_deadline = event_deadline.replace(tzinfo=timezone.utc)
    if now > event_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration deadline has passed"
        )

    # Check for existing active registration
    existing_reg = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.user_id == user.id
    ).first()

    if existing_reg:
        if existing_reg.status in [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already registered for this event"
            )
        else:
            # Re-activate cancelled registration
            active_count = db.query(Registration).filter(
                Registration.event_id == event_id,
                Registration.status.in_([RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED])
            ).count()

            if active_count >= event.capacity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Event capacity has been reached"
                )

            existing_reg.status = RegistrationStatus.REGISTERED
            existing_reg.registered_at = datetime.now(timezone.utc)

            # Check if ticket exists or make new one
            ticket = db.query(Ticket).filter(Ticket.registration_id == existing_reg.id).first()
            if not ticket:
                ticket = create_ticket_for_registration(db, existing_reg)
            else:
                ticket.used = False
                ticket.used_at = None

            db.commit()
            db.refresh(existing_reg)
            db.refresh(ticket)

            ticket_resp = TicketResponse.model_validate(ticket)
            ticket_resp.qr_code_image = generate_qr_base64(ticket.qr_token)

            return RegistrationResponse(
                id=existing_reg.id,
                user_id=existing_reg.user_id,
                event_id=existing_reg.event_id,
                registered_at=existing_reg.registered_at,
                status=existing_reg.status,
                ticket=ticket_resp,
                event_title=event.title,
                event_venue=event.venue,
                event_start_time=event.start_time,
                event_end_time=event.end_time,
                club_name=event.club.name
            )

    # Check capacity
    active_count = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.status.in_([RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED])
    ).count()

    if active_count >= event.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed: This event is already full."
        )

    # Create new registration
    registration = Registration(
        user_id=user.id,
        event_id=event_id,
        status=RegistrationStatus.REGISTERED
    )
    db.add(registration)
    db.flush() # get registration.id

    # Create digital ticket
    ticket = create_ticket_for_registration(db, registration)

    # Create in-app notification
    notification = Notification(
        user_id=user.id,
        title="Registration Confirmed!",
        message=f"You are registered for '{event.title}'. Your digital ticket ({ticket.ticket_code}) is ready.",
        type="REGISTRATION"
    )
    db.add(notification)

    db.commit()
    db.refresh(registration)
    db.refresh(ticket)

    ticket_resp = TicketResponse.model_validate(ticket)
    ticket_resp.qr_code_image = generate_qr_base64(ticket.qr_token)

    return RegistrationResponse(
        id=registration.id,
        user_id=registration.user_id,
        event_id=registration.event_id,
        registered_at=registration.registered_at,
        status=registration.status,
        ticket=ticket_resp,
        event_title=event.title,
        event_venue=event.venue,
        event_start_time=event.start_time,
        event_end_time=event.end_time,
        club_name=event.club.name
    )

def cancel_registration(db: Session, event_id: int, user: User) -> bool:
    reg = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.user_id == user.id
    ).first()

    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )

    if reg.status == RegistrationStatus.ATTENDED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel registration for an event you have already attended"
        )

    reg.status = RegistrationStatus.CANCELLED
    db.commit()
    return True

def get_user_registrations(db: Session, user_id: int) -> List[RegistrationResponse]:
    regs = db.query(Registration).filter(Registration.user_id == user_id).order_by(Registration.registered_at.desc()).all()
    results = []
    for r in regs:
        ticket_resp = None
        if r.ticket:
            ticket_resp = TicketResponse.model_validate(r.ticket)
            ticket_resp.qr_code_image = generate_qr_base64(r.ticket.qr_token)

        results.append(
            RegistrationResponse(
                id=r.id,
                user_id=r.user_id,
                event_id=r.event_id,
                registered_at=r.registered_at,
                status=r.status,
                ticket=ticket_resp,
                event_title=r.event.title,
                event_venue=r.event.venue,
                event_start_time=r.event.start_time,
                event_end_time=r.event.end_time,
                club_name=r.event.club.name
            )
        )
    return results

def get_event_registrations(db: Session, event_id: int) -> List[RegistrationResponse]:
    regs = db.query(Registration).filter(Registration.event_id == event_id).order_by(Registration.registered_at.desc()).all()
    results = []
    for r in regs:
        ticket_resp = None
        if r.ticket:
            ticket_resp = TicketResponse.model_validate(r.ticket)
            ticket_resp.qr_code_image = generate_qr_base64(r.ticket.qr_token)

        results.append(
            RegistrationResponse(
                id=r.id,
                user_id=r.user_id,
                event_id=r.event_id,
                registered_at=r.registered_at,
                status=r.status,
                ticket=ticket_resp,
                user=r.user,
                event_title=r.event.title,
                event_venue=r.event.venue,
                event_start_time=r.event.start_time,
                event_end_time=r.event.end_time,
                club_name=r.event.club.name
            )
        )
    return results
