from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackStatsResponse
from app.services import feedback_service
from app.api.deps import get_current_user

router = APIRouter(tags=["Feedback"])

@router.post("/events/{event_id}/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def post_event_feedback(
    event_id: int,
    feedback_in: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return feedback_service.submit_feedback(db, event_id, feedback_in, current_user)

@router.get("/events/{event_id}/feedback/stats", response_model=FeedbackStatsResponse)
def get_feedback_stats(
    event_id: int,
    db: Session = Depends(get_db)
):
    return feedback_service.get_event_feedback_stats(db, event_id)
