from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.club import Club
from app.models.event import Event, EventStatus
from app.models.user import User, UserRole
from app.schemas.club import ClubCreate, ClubResponse, ClubUpdate
from app.schemas.event import EventResponse
from app.api.deps import get_current_user, require_roles
from app.api.events import enrich_event_response

router = APIRouter(prefix="/clubs", tags=["Clubs"])

@router.get("", response_model=List[ClubResponse])
def list_clubs(db: Session = Depends(get_db)):
    return db.query(Club).order_by(Club.name.asc()).all()

@router.get("/{club_id}", response_model=ClubResponse)
def get_club(club_id: int, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    return club

@router.get("/{club_id}/events", response_model=List[EventResponse])
def get_club_events(club_id: int, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    events = db.query(Event).filter(Event.club_id == club_id).order_by(Event.start_time.asc()).all()
    return [enrich_event_response(e, db) for e in events]

@router.post("", response_model=ClubResponse, status_code=status.HTTP_201_CREATED)
def create_club(
    club_in: ClubCreate,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    existing = db.query(Club).filter(Club.name.ilike(club_in.name)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A club with this name already exists")

    new_club = Club(
        name=club_in.name,
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

    if current_user.role != UserRole.ADMIN and club.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    for field, val in club_in.model_dump(exclude_unset=True).items():
        setattr(club, field, val)

    db.commit()
    db.refresh(club)
    return club
