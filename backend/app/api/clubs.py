from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.club import Club, ClubOrganizer
from app.models.event import Event, EventStatus
from app.models.user import User, UserRole
from app.models.notification import Notification
from app.schemas.club import (
    ClubCreate,
    ClubResponse,
    ClubUpdate,
    ClubOrganizerCreate,
    ClubOrganizerResponse,
    ClubWithOrganizersResponse
)
from app.schemas.event import EventResponse
from app.schemas.user import UserResponse
from app.api.deps import get_current_user, require_roles
from app.api.events import enrich_event_response
from app.utils.permissions import can_manage_club

router = APIRouter(prefix="/clubs", tags=["Clubs"])

@router.get("", response_model=List[ClubResponse])
def list_clubs(db: Session = Depends(get_db)):
    return db.query(Club).order_by(Club.name.asc()).all()

@router.get("/my/managed", response_model=List[ClubResponse])
def get_my_managed_clubs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all clubs the current user owns OR is assigned as an organizer for.
    """
    if current_user.role == UserRole.ADMIN:
        return db.query(Club).order_by(Club.name.asc()).all()

    # Owned clubs
    owned = db.query(Club).filter(Club.owner_id == current_user.id).all()
    # Clubs where user is an assigned organizer
    organized_club_ids = [
        co.club_id for co in db.query(ClubOrganizer).filter(ClubOrganizer.user_id == current_user.id).all()
    ]
    organized = db.query(Club).filter(Club.id.in_(organized_club_ids)).all() if organized_club_ids else []

    # Combine unique clubs
    club_dict = {c.id: c for c in owned + organized}
    return list(club_dict.values())

@router.get("/{club_id}", response_model=ClubWithOrganizersResponse)
def get_club(club_id: int, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    
    # Build organizer response with user names/emails
    org_responses = []
    for org in club.organizers:
        org_responses.append(
            ClubOrganizerResponse(
                id=org.id,
                club_id=org.id,
                user_id=org.user_id,
                role_title=org.role_title,
                assigned_at=org.assigned_at,
                user_name=org.user.name if org.user else None,
                user_email=org.user.email if org.user else None
            )
        )
    
    resp = ClubWithOrganizersResponse.model_validate(club)
    resp.organizers = org_responses
    return resp

@router.get("/{club_id}/events", response_model=List[EventResponse])
def get_club_events(club_id: int, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    events = db.query(Event).filter(Event.club_id == club_id).order_by(Event.start_time.asc()).all()
    return [enrich_event_response(e, db) for e in events]

@router.get("/{club_id}/organizers", response_model=List[ClubOrganizerResponse])
def list_club_organizers(
    club_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    
    if not can_manage_club(current_user, club):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    organizers = db.query(ClubOrganizer).filter(ClubOrganizer.club_id == club_id).all()
    results = []
    for org in organizers:
        results.append(
            ClubOrganizerResponse(
                id=org.id,
                club_id=org.club_id,
                user_id=org.user_id,
                role_title=org.role_title,
                assigned_at=org.assigned_at,
                user_name=org.user.name if org.user else None,
                user_email=org.user.email if org.user else None,
                user=UserResponse.model_validate(org.user) if org.user else None
            )
        )
    return results

@router.post("/{club_id}/organizers", response_model=ClubOrganizerResponse, status_code=status.HTTP_201_CREATED)
def assign_club_organizer(
    club_id: int,
    org_in: ClubOrganizerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    if not can_manage_club(current_user, club):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only club managers or admins can assign organizers")

    # Find target user by email
    target_user = db.query(User).filter(User.email.ilike(org_in.email.strip())).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No account found with email '{org_in.email}'. The user must register on EvntPulse first."
        )

    # Check if already owner or assigned
    if target_user.id == club.owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already the primary owner of this club."
        )

    existing = db.query(ClubOrganizer).filter(
        ClubOrganizer.club_id == club_id,
        ClubOrganizer.user_id == target_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"'{target_user.name}' is already an assigned organizer for this club."
        )

    # Create assignment
    role_title = org_in.role_title.strip() if org_in.role_title else "Event Organizer"
    new_org = ClubOrganizer(
        club_id=club_id,
        user_id=target_user.id,
        role_title=role_title
    )
    db.add(new_org)

    # Auto-promote user role to ORGANIZER so they can access the hub
    if target_user.role == UserRole.STUDENT:
        target_user.role = UserRole.ORGANIZER

    # Send in-app notification
    notification = Notification(
        user_id=target_user.id,
        title="Organizer Access Granted!",
        message=f"You have been appointed as {role_title} for {club.name}. You can now manage events and verify attendance.",
        type="SYSTEM"
    )
    db.add(notification)

    db.commit()
    db.refresh(new_org)

    return ClubOrganizerResponse(
        id=new_org.id,
        club_id=new_org.club_id,
        user_id=new_org.user_id,
        role_title=new_org.role_title,
        assigned_at=new_org.assigned_at,
        user_name=target_user.name,
        user_email=target_user.email,
        user=UserResponse.model_validate(target_user)
    )

@router.delete("/{club_id}/organizers/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_club_organizer(
    club_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    if not can_manage_club(current_user, club):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    org = db.query(ClubOrganizer).filter(
        ClubOrganizer.club_id == club_id,
        ClubOrganizer.user_id == user_id
    ).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organizer record not found")

    db.delete(org)
    db.commit()
    return None

@router.post("", response_model=ClubResponse, status_code=status.HTTP_201_CREATED)
def create_club(
    club_in: ClubCreate,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    existing = db.query(Club).filter(Club.name.ilike(club_in.name)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A club with this name already exists")

    if club_in.email:
        existing_email = db.query(Club).filter(Club.email.ilike(club_in.email.strip())).first()
        if existing_email:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A club with this email already exists")

    new_club = Club(
        name=club_in.name,
        email=club_in.email.strip() if club_in.email else None,
        description=club_in.description,
        logo_url=club_in.logo_url,
        owner_id=current_user.id
    )
    db.add(new_club)
    db.commit()
    db.refresh(new_club)
    return new_club

@router.put("/{club_id}", response_model=ClubResponse)
def update_club(
    club_id: int,
    club_in: ClubUpdate,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    if not can_manage_club(current_user, club):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    for field, val in club_in.model_dump(exclude_unset=True).items():
        if field == "email" and val:
            val = val.strip()
        setattr(club, field, val)

    db.commit()
    db.refresh(club)
    return club
