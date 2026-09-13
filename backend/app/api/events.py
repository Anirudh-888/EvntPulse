from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.event import Event, EventStatus, EventCategory
from app.models.registration import Registration, RegistrationStatus
from app.models.user import User, UserRole
from app.schemas.event import EventCreate, EventResponse, EventUpdate, EventDetailResponse
from app.services import event_service
from app.api.deps import get_current_user, get_current_user_optional, require_roles

router = APIRouter(prefix="/events", tags=["Events"])

def enrich_event_response(event: Event, db: Session) -> EventResponse:
    reg_count = db.query(Registration).filter(
        Registration.event_id == event.id,
        Registration.status.in_([RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED])
    ).count()
    resp = EventResponse.model_validate(event)
    resp.registered_count = reg_count
    resp.available_slots = max(0, event.capacity - reg_count)
    return resp

@router.get("", response_model=List[EventResponse])
def list_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[EventCategory] = None,
    club_id: Optional[int] = None,
    status_filter: Optional[EventStatus] = None,
    all_statuses: bool = Query(False, description="If true, shows draft/cancelled events for management"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    only_pub = not all_statuses
    # If student or unauthenticated, always force only_published
    if not current_user or current_user.role == UserRole.STUDENT:
        only_pub = True

    events = event_service.get_events(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category=category,
        club_id=club_id,
        status_filter=status_filter,
        only_published=only_pub,
        current_user=current_user
    )
    return [enrich_event_response(e, db) for e in events]

@router.get("/{event_id}", response_model=EventDetailResponse)
def get_event(
    event_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    event = event_service.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    enriched = enrich_event_response(event, db)
    detail = EventDetailResponse(**enriched.model_dump())

    if current_user:
        reg = db.query(Registration).filter(
            Registration.event_id == event_id,
            Registration.user_id == current_user.id
        ).first()
        if reg and reg.status in [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED]:
            detail.is_registered = True
            detail.is_attended = (reg.status == RegistrationStatus.ATTENDED)
            if reg.ticket:
                detail.my_ticket_id = reg.ticket.id
                detail.my_ticket_code = reg.ticket.ticket_code

    return detail

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = event_service.create_event(db, event_in, current_user)
    return enrich_event_response(event, db)

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = event_service.update_event(db, event_id, event_in, current_user)
    return enrich_event_response(event, db)

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event_service.delete_event(db, event_id, current_user)
    return None

@router.post("/{event_id}/submit-approval", response_model=EventResponse)
def submit_event_for_approval(
    event_id: int,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = event_service.change_event_status(db, event_id, EventStatus.PENDING_APPROVAL, current_user)
    return enrich_event_response(event, db)

@router.post("/{event_id}/approve", response_model=EventResponse)
def approve_event(
    event_id: int,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = event_service.change_event_status(db, event_id, EventStatus.PUBLISHED, current_user)
    return enrich_event_response(event, db)

@router.post("/{event_id}/reject", response_model=EventResponse)
def reject_event(
    event_id: int,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = event_service.change_event_status(db, event_id, EventStatus.DRAFT, current_user)
    return enrich_event_response(event, db)

@router.post("/{event_id}/publish", response_model=EventResponse)
def publish_event(
    event_id: int,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = event_service.change_event_status(db, event_id, EventStatus.PUBLISHED, current_user)
    return enrich_event_response(event, db)

@router.post("/{event_id}/cancel", response_model=EventResponse)
def cancel_event(
    event_id: int,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = event_service.change_event_status(db, event_id, EventStatus.CANCELLED, current_user)
    return enrich_event_response(event, db)

@router.post("/{event_id}/complete", response_model=EventResponse)
def complete_event(
    event_id: int,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = event_service.change_event_status(db, event_id, EventStatus.COMPLETED, current_user)
    return enrich_event_response(event, db)
