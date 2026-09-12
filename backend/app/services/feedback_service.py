from typing import List, Dict, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.event import Event
from app.models.feedback import Feedback
from app.models.attendance import Attendance
from app.models.registration import Registration, RegistrationStatus
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackStatsResponse

def submit_feedback(db: Session, event_id: int, feedback_in: FeedbackCreate, current_user: User) -> FeedbackResponse:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    # Verify user has attended the event
    attended = db.query(Attendance).filter(
        Attendance.event_id == event_id,
        Attendance.user_id == current_user.id
    ).first()

    if not attended:
        # Also check registration status just in case
        reg = db.query(Registration).filter(
            Registration.event_id == event_id,
            Registration.user_id == current_user.id,
            Registration.status == RegistrationStatus.ATTENDED
        ).first()
        if not reg:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Feedback can only be submitted after attending and checking into the event."
            )

    # Check for duplicate feedback
    existing = db.query(Feedback).filter(
        Feedback.event_id == event_id,
        Feedback.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted feedback for this event"
        )

    feedback = Feedback(
        event_id=event_id,
        user_id=current_user.id,
        rating=feedback_in.rating,
        comment=feedback_in.comment
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return FeedbackResponse.model_validate(feedback)

def get_event_feedback_stats(db: Session, event_id: int) -> FeedbackStatsResponse:
    feedbacks = db.query(Feedback).filter(Feedback.event_id == event_id).order_by(Feedback.submitted_at.desc()).all()

    total = len(feedbacks)
    avg_rating = round(sum(f.rating for f in feedbacks) / total, 2) if total > 0 else 0.0

    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for f in feedbacks:
        if f.rating in distribution:
            distribution[f.rating] += 1

    return FeedbackStatsResponse(
        event_id=event_id,
        total_feedback=total,
        average_rating=avg_rating,
        rating_distribution=distribution,
        recent_feedbacks=[FeedbackResponse.model_validate(f) for f in feedbacks[:10]]
    )
