from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class HealthScoreBreakdown(BaseModel):
    attendance_score: float
    engagement_score: float
    rating_score: float
    feedback_participation_score: float
    total_score: float
    classification: str # Excellent, Strong, Needs Improvement, Needs Attention
    description: str

class EventInsight(BaseModel):
    id: str
    type: str # positive, warning, info
    message: str

class AnalyticsResponse(BaseModel):
    event_id: int
    event_title: str
    registrations: int
    attendance: int
    attendance_rate: float
    capacity: int
    capacity_utilization: float
    feedback_count: int
    feedback_rate: float
    average_rating: float
    poll_participation: int
    poll_count: int
    engagement_rate: float
    event_health_score: float
    health_breakdown: HealthScoreBreakdown
    insights: List[EventInsight]
    registration_timeline: List[Dict[str, Any]] = []
    rating_distribution: Dict[int, int] = {}

class PlatformStatsResponse(BaseModel):
    total_users: int
    total_students: int
    total_organizers: int
    total_clubs: int
    total_events: int
    published_events: int
    total_registrations: int
    total_attendance: int
    overall_attendance_rate: float
    average_event_rating: float
