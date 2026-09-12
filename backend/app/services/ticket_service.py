from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.ticket import Ticket
from app.models.registration import Registration
from app.models.event import Event
from app.models.user import User
from app.core.security import generate_ticket_code, generate_qr_token
from app.utils.qr import generate_qr_base64
from app.schemas.ticket import TicketDetailResponse

def create_ticket_for_registration(db: Session, registration: Registration) -> Ticket:
    ticket = Ticket(
        registration_id=registration.id,
        ticket_code=generate_ticket_code(),
        qr_token=generate_qr_token(),
        used=False
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

def get_ticket_detail(db: Session, ticket_id: int) -> Optional[TicketDetailResponse]:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        return None

    registration = ticket.registration
    event = registration.event
    user = registration.user

    return TicketDetailResponse(
        id=ticket.id,
        registration_id=ticket.registration_id,
        ticket_code=ticket.ticket_code,
        qr_token=ticket.qr_token,
        qr_code_image=generate_qr_base64(ticket.qr_token),
        issued_at=ticket.issued_at,
        used=ticket.used,
        used_at=ticket.used_at,
        event_id=event.id,
        event_title=event.title,
        club_name=event.club.name,
        venue=event.venue,
        start_time=event.start_time,
        end_time=event.end_time,
        user_name=user.name,
        user_email=user.email,
        registration_status=registration.status.value
    )
