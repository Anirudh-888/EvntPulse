from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.event import Event
from app.models.poll import Poll, PollOption, PollResponse, PollStatus
from app.models.user import User, UserRole
from app.schemas.poll import PollCreate, PollResponse as PollSchema, PollOptionResponse, PollResultsResponse
from app.utils.permissions import can_manage_event

def create_poll(db: Session, event_id: int, poll_in: PollCreate, current_user: User) -> Poll:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if not can_manage_event(current_user, event):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    if len(poll_in.options) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Poll must have at least 2 options")

    poll = Poll(
        event_id=event_id,
        question=poll_in.question,
        status=PollStatus.ACTIVE # Default to active for live engagement
    )
    db.add(poll)
    db.flush()

    for opt_text in poll_in.options:
        option = PollOption(poll_id=poll.id, option_text=opt_text.strip())
        db.add(option)

    db.commit()
    db.refresh(poll)
    return poll

def set_poll_status(db: Session, poll_id: int, new_status: PollStatus, current_user: User) -> Poll:
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found")

    if not can_manage_event(current_user, poll.event):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    poll.status = new_status
    if new_status == PollStatus.CLOSED:
        poll.closed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(poll)
    return poll

def submit_poll_response(db: Session, poll_id: int, option_id: int, current_user: User) -> PollResponse:
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Poll not found")

    if poll.status != PollStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poll is not currently active"
        )

    option = db.query(PollOption).filter(
        PollOption.id == option_id,
        PollOption.poll_id == poll_id
    ).first()
    if not option:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Option not found in this poll")

    # Prevent duplicate vote
    existing = db.query(PollResponse).filter(
        PollResponse.poll_id == poll_id,
        PollResponse.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already participated in this poll"
        )

    response = PollResponse(
        poll_id=poll_id,
        option_id=option_id,
        user_id=current_user.id
    )
    db.add(response)
    db.commit()
    return response

def get_event_polls(db: Session, event_id: int, current_user: Optional[User] = None) -> List[PollSchema]:
    polls = db.query(Poll).filter(Poll.event_id == event_id).order_by(Poll.created_at.desc()).all()
    results = []

    for poll in polls:
        total_votes = db.query(PollResponse).filter(PollResponse.poll_id == poll.id).count()
        user_vote_id = None
        if current_user:
            user_vote = db.query(PollResponse).filter(
                PollResponse.poll_id == poll.id,
                PollResponse.user_id == current_user.id
            ).first()
            if user_vote:
                user_vote_id = user_vote.option_id

        option_schemas = []
        for opt in poll.options:
            opt_votes = db.query(PollResponse).filter(
                PollResponse.poll_id == poll.id,
                PollResponse.option_id == opt.id
            ).count()
            pct = round((opt_votes / total_votes * 100.0), 1) if total_votes > 0 else 0.0
            option_schemas.append(
                PollOptionResponse(
                    id=opt.id,
                    poll_id=opt.poll_id,
                    option_text=opt.option_text,
                    vote_count=opt_votes,
                    vote_percentage=pct
                )
            )

        results.append(
            PollSchema(
                id=poll.id,
                event_id=poll.event_id,
                question=poll.question,
                status=poll.status,
                created_at=poll.created_at,
                closed_at=poll.closed_at,
                options=option_schemas,
                total_votes=total_votes,
                user_voted_option_id=user_vote_id
            )
        )
    return results
