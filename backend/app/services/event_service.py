from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from fastapi import HTTPException, status
from app.models.event import Event, EventStatus, EventCategory
from app.models.club import Club
from app.models.registration import Registration, RegistrationStatus
from app.models.user import User, UserRole
from app.schemas.event import EventCreate, EventUpdate
from app.utils.permissions import can_manage_club, can_manage_event

def get_event_by_id(db: Session, event_id: int) -> Optional[Event]:
    return db.query(Event).filter(Event.id == event_id).first()

def get_events(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    category: Optional[EventCategory] = None,
    club_id: Optional[int] = None,
    status_filter: Optional[EventStatus] = None,
    only_published: bool = True
) -> List[Event]:
    query = db.query(Event)

    if only_published:
        query = query.filter(Event.status.in_([EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.COMPLETED]))
    elif status_filter:
        query = query.filter(Event.status == status_filter)

    if club_id:
        query = query.filter(Event.club_id == club_id)

    if category:
        query = query.filter(Event.category == category)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Event.title.ilike(search_fmt),
                Event.description.ilike(search_fmt),
                Event.venue.ilike(search_fmt)
            )
        )

    return query.order_by(Event.start_time.asc()).offset(skip).limit(limit).all()

def create_event(db: Session, event_in: EventCreate, current_user: User) -> Event:
    club = db.query(Club).filter(Club.id == event_in.club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    # Check if user is admin, club owner, or an assigned organizer
    if not can_manage_club(current_user, club):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create events for clubs you manage or organize"
        )

    db_event = Event(
        club_id=event_in.club_id,
        title=event_in.title,
        description=event_in.description,
        category=event_in.category,
        venue=event_in.venue,
        start_time=event_in.start_time,
        end_time=event_in.end_time,
        registration_deadline=event_in.registration_deadline,
        capacity=event_in.capacity,
        poster_url=event_in.poster_url,
        status=event_in.status or EventStatus.DRAFT
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def update_event(db: Session, event_id: int, event_in: EventUpdate, current_user: User) -> Event:
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if not can_manage_event(current_user, event):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit events for clubs you manage or organize"
        )

    update_data = event_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event

def change_event_status(db: Session, event_id: int, new_status: EventStatus, current_user: User) -> Event:
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if not can_manage_event(current_user, event):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only change status for events you manage or organize"
        )

    event.status = new_status
    db.commit()
    db.refresh(event)
    return event

def delete_event(db: Session, event_id: int, current_user: User) -> bool:
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if not can_manage_event(current_user, event):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete events for clubs you manage or organize"
        )

    db.delete(event)
    db.commit()
    return True
