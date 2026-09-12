from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.event import Event, EventStatus
from app.models.registration import Registration, RegistrationStatus
from app.models.attendance import Attendance
from app.models.feedback import Feedback
from app.models.poll import Poll, PollResponse
from app.models.user import User, UserRole
from app.models.club import Club
from app.schemas.analytics import AnalyticsResponse, HealthScoreBreakdown, EventInsight, PlatformStatsResponse

def get_event_analytics(db: Session, event_id: int) -> AnalyticsResponse:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    # Registrations
    registrations = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.status.in_([RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED])
    ).count()

    # Attendance
    attendance = db.query(Attendance).filter(Attendance.event_id == event_id).count()
    attendance_rate = round((attendance / registrations * 100.0), 1) if registrations > 0 else 0.0
    capacity_utilization = round((registrations / event.capacity * 100.0), 1) if event.capacity > 0 else 0.0

    # Feedback
    feedbacks = db.query(Feedback).filter(Feedback.event_id == event_id).all()
    feedback_count = len(feedbacks)
    average_rating = round(sum(f.rating for f in feedbacks) / feedback_count, 2) if feedback_count > 0 else 0.0
    feedback_rate = round((feedback_count / max(attendance, 1) * 100.0), 1) if attendance > 0 else 0.0

    rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for f in feedbacks:
        if f.rating in rating_dist:
            rating_dist[f.rating] += 1

    # Polls & Engagement
    event_polls = db.query(Poll).filter(Poll.event_id == event_id).all()
    poll_count = len(event_polls)
    poll_poll_ids = [p.id for p in event_polls]
    poll_participation = db.query(PollResponse).filter(PollResponse.poll_id.in_(poll_poll_ids)).count() if poll_poll_ids else 0

    engagement_metric = (poll_participation + feedback_count) / max(attendance, 1) * 50.0 if attendance > 0 else 0.0
    engagement_rate = round(min(100.0, engagement_metric), 1)

    # Health Score Component Calculation
    attendance_score = round(min(100.0, (attendance / registrations * 100.0)), 1) if registrations > 0 else 0.0
    engagement_score = round(min(100.0, (poll_participation / max(attendance, 1) * 100.0)), 1) if attendance > 0 else 0.0
    rating_score = round((average_rating / 5.0) * 100.0, 1) if average_rating > 0 else 0.0
    feedback_participation_score = round(min(100.0, (feedback_count / max(attendance, 1) * 100.0)), 1) if attendance > 0 else 0.0

    raw_health_score = (
        0.30 * attendance_score +
        0.25 * engagement_score +
        0.25 * rating_score +
        0.20 * feedback_participation_score
    )
    total_score = round(max(0.0, min(100.0, raw_health_score)), 1)

    # Classification
    if total_score >= 90.0:
        classification = "Excellent"
        classification_desc = "Outstanding attendee satisfaction, strong turnout, and high interactive engagement."
    elif total_score >= 75.0:
        classification = "Strong"
        classification_desc = "High-performing event meeting key campus engagement benchmarks."
    elif total_score >= 60.0:
        classification = "Needs Improvement"
        classification_desc = "Decent foundation with opportunities to boost turnout or post-event feedback."
    else:
        classification = "Needs Attention"
        classification_desc = "Metrics indicate low turnout or audience participation requiring strategy adjustment."

    health_breakdown = HealthScoreBreakdown(
        attendance_score=attendance_score,
        engagement_score=engagement_score,
        rating_score=rating_score,
        feedback_participation_score=feedback_participation_score,
        total_score=total_score,
        classification=classification,
        description=classification_desc
    )

    # Rule-based Insights Generation
    insights: List[EventInsight] = []

    if attendance_rate >= 80.0 and registrations > 0:
        insights.append(EventInsight(
            id="insight_att_high",
            type="positive",
            message="Attendance is strong compared with registrations."
        ))
    elif attendance_rate < 50.0 and registrations > 0:
        insights.append(EventInsight(
            id="insight_att_low",
            type="warning",
            message="Turnout was below 50% of registrations. Consider sending calendar reminders."
        ))

    if capacity_utilization >= 85.0:
        insights.append(EventInsight(
            id="insight_cap_high",
            type="positive",
            message="Registration capacity was nearly reached, showing high student demand."
        ))

    if average_rating >= 4.0 and feedback_count > 0:
        insights.append(EventInsight(
            id="insight_rating_high",
            type="positive",
            message="Most attendees rated the event positively."
        ))
    elif average_rating > 0 and average_rating < 3.0:
        insights.append(EventInsight(
            id="insight_rating_low",
            type="warning",
            message="Attendee ratings were low; check comments for constructive areas of improvement."
        ))

    if feedback_rate < 30.0 and attendance > 5:
        insights.append(EventInsight(
            id="insight_fb_low",
            type="warning",
            message="Feedback participation is low. Encourage attendees to submit reviews during closing remarks."
        ))

    if poll_participation >= attendance and attendance > 0:
        insights.append(EventInsight(
            id="insight_poll_active",
            type="positive",
            message="High audience engagement through interactive live polls."
        ))
    elif poll_count > 0 and poll_participation < attendance * 0.4:
        insights.append(EventInsight(
            id="insight_poll_low",
            type="info",
            message="Engagement is lower than attendance. Announce active polls via the podium."
        ))

    if not insights:
        insights.append(EventInsight(
            id="insight_initial",
            type="info",
            message="Event has standard campus engagement metrics."
        ))

    # Registration timeline mock-up distribution for chart
    timeline = [
        {"day": "Day -5", "count": max(1, int(registrations * 0.15))},
        {"day": "Day -4", "count": max(2, int(registrations * 0.20))},
        {"day": "Day -3", "count": max(3, int(registrations * 0.25))},
        {"day": "Day -2", "count": max(4, int(registrations * 0.20))},
        {"day": "Day -1", "count": max(2, int(registrations * 0.20))},
    ]

    return AnalyticsResponse(
        event_id=event.id,
        event_title=event.title,
        registrations=registrations,
        attendance=attendance,
        attendance_rate=attendance_rate,
        capacity=event.capacity,
        capacity_utilization=capacity_utilization,
        feedback_count=feedback_count,
        feedback_rate=feedback_rate,
        average_rating=average_rating,
        poll_participation=poll_participation,
        poll_count=poll_count,
        engagement_rate=engagement_rate,
        event_health_score=total_score,
        health_breakdown=health_breakdown,
        insights=insights,
        registration_timeline=timeline,
        rating_distribution=rating_dist
    )

def get_platform_statistics(db: Session) -> PlatformStatsResponse:
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_organizers = db.query(User).filter(User.role == UserRole.ORGANIZER).count()
    total_clubs = db.query(Club).count()
    total_events = db.query(Event).count()
    published_events = db.query(Event).filter(Event.status == EventStatus.PUBLISHED).count()

    total_regs = db.query(Registration).filter(
        Registration.status.in_([RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED])
    ).count()

    total_att = db.query(Attendance).count()
    overall_rate = round((total_att / total_regs * 100.0), 1) if total_regs > 0 else 0.0

    feedbacks = db.query(Feedback).all()
    avg_rating = round(sum(f.rating for f in feedbacks) / len(feedbacks), 2) if feedbacks else 0.0

    return PlatformStatsResponse(
        total_users=total_users,
        total_students=total_students,
        total_organizers=total_organizers,
        total_clubs=total_clubs,
        total_events=total_events,
        published_events=published_events,
        total_registrations=total_regs,
        total_attendance=total_att,
        overall_attendance_rate=overall_rate,
        average_event_rating=avg_rating
    )
