from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.poll import PollStatus
from app.schemas.poll import PollCreate, PollResponse, PollVoteRequest
from app.services import poll_service
from app.api.deps import get_current_user, get_current_user_optional, require_roles

router = APIRouter(tags=["Polls"])

@router.post("/events/{event_id}/polls", response_model=PollResponse, status_code=status.HTTP_201_CREATED)
def create_poll_for_event(
    event_id: int,
    poll_in: PollCreate,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    poll = poll_service.create_poll(db, event_id, poll_in, current_user)
    polls = poll_service.get_event_polls(db, event_id, current_user)
    return next((p for p in polls if p.id == poll.id), None)

@router.get("/events/{event_id}/polls", response_model=List[PollResponse])
def get_event_polls(
    event_id: int,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    return poll_service.get_event_polls(db, event_id, current_user)

@router.post("/polls/{poll_id}/vote")
def vote_in_poll(
    poll_id: int,
    vote_data: PollVoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    poll_service.submit_poll_response(db, poll_id, vote_data.option_id, current_user)
    return {"message": "Vote recorded successfully"}

@router.put("/polls/{poll_id}/status")
def update_poll_status(
    poll_id: int,
    status: PollStatus,
    current_user: User = Depends(require_roles(UserRole.ORGANIZER, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    poll = poll_service.set_poll_status(db, poll_id, status, current_user)
    return {"message": f"Poll status changed to {status.value}"}
