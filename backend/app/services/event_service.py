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
    only_published: bool = True,
    current_user: Optional[User] = None
) -> List[Event]:
    query = db.query(Event)

    if only_published:
        query = query.filter(Event.status.in_([EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.COMPLETED]))
    else:
        # Management view
        if current_user and current_user.role == UserRole.ORGANIZER:
            user_email = (current_user.email or "").strip().lower()
            owned_club_ids = [c.id for c in current_user.clubs_owned]
            org_club_ids = [co.club_id for co in current_user.clubs_organized]
            allowed_club_ids = list(set(owned_club_ids + org_club_ids))

            query = query.filter(
                or_(
                    Event.club_id.in_(allowed_club_ids) if allowed_club_ids else False,
                    Event.rsvp_email_1.ilike(user_email),
                    Event.rsvp_email_2.ilike(user_email)
                )
            )

    if status_filter:
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

def promote_rsvp_managers(db: Session, email1: Optional[str], email2: Optional[str]):
    for email in [email1, email2]:
        if email and email.strip():
            target_user = db.query(User).filter(User.email.ilike(email.strip())).first()
            if target_user and target_user.role == UserRole.STUDENT:
                target_user.role = UserRole.ORGANIZER

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

    status_to_assign = event_in.status or EventStatus.DRAFT

    clean_rsvp1 = event_in.rsvp_email_1.strip() if event_in.rsvp_email_1 else None
    clean_rsvp2 = event_in.rsvp_email_2.strip() if event_in.rsvp_email_2 else None

    # Promote RSVP managers to ORGANIZER role if they are registered as STUDENT
    promote_rsvp_managers(db, clean_rsvp1, clean_rsvp2)

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
        rsvp_email_1=clean_rsvp1,
        rsvp_email_2=clean_rsvp2,
        status=status_to_assign
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
        if field in ["rsvp_email_1", "rsvp_email_2"] and value:
            value = value.strip()
        setattr(event, field, value)

    promote_rsvp_managers(db, event.rsvp_email_1, event.rsvp_email_2)

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
