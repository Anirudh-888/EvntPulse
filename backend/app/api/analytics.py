from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import AnalyticsResponse, PlatformStatsResponse
from app.services import analytics_service

router = APIRouter(tags=["Analytics"])

@router.get("/events/{event_id}/analytics", response_model=AnalyticsResponse)
def get_event_analytics_data(
    event_id: int,
    db: Session = Depends(get_db)
):
    return analytics_service.get_event_analytics(db, event_id)

@router.get("/analytics/platform", response_model=PlatformStatsResponse)
def get_platform_overview(
    db: Session = Depends(get_db)
):
    return analytics_service.get_platform_statistics(db)
