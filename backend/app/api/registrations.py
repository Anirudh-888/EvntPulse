from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.event import Event
from app.schemas.registration import RegistrationResponse
from app.services import registration_service
from app.api.deps import get_current_user, require_roles
from app.utils.permissions import can_manage_event

router = APIRouter(tags=["Registrations"])

@router.post("/events/{event_id}/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return registration_service.register_user_for_event(db, event_id, current_user)

@router.delete("/events/{event_id}/register", status_code=status.HTTP_200_OK)
def cancel_event_registration(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registration_service.cancel_registration(db, event_id, current_user)
    return {"message": "Registration successfully cancelled"}

@router.get("/users/me/registrations", response_model=List[RegistrationResponse])
def get_my_registrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return registration_service.get_user_registrations(db, current_user.id)

@router.get("/events/{event_id}/registrations", response_model=List[RegistrationResponse])
def get_event_registrations(
    event_id: int,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if not can_manage_event(current_user, event):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    return registration_service.get_event_registrations(db, event_id)
