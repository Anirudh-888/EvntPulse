from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.ticket import Ticket
from app.schemas.ticket import TicketDetailResponse
from app.services import ticket_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("/{ticket_id}", response_model=TicketDetailResponse)
def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket_data = ticket_service.get_ticket_detail(db, ticket_id)
    if not ticket_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Only ticket owner, event organizer, or admin can view ticket
    ticket_model = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    is_owner = ticket_model.registration.user_id == current_user.id
    is_organizer = ticket_model.registration.event.club.owner_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN

    if not (is_owner or is_organizer or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this ticket")

    return ticket_data
