from fastapi import APIRouter
from app.api import (
    auth,
    users,
    clubs,
    events,
    registrations,
    tickets,
    attendance,
    polls,
    feedback,
    analytics,
    notifications,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(clubs.router)
api_router.include_router(events.router)
api_router.include_router(registrations.router)
api_router.include_router(tickets.router)
api_router.include_router(attendance.router)
api_router.include_router(polls.router)
api_router.include_router(feedback.router)
api_router.include_router(analytics.router)
api_router.include_router(notifications.router)
