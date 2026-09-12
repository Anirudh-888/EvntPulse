from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class EventStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class EventCategory(str, enum.Enum):
    TECHNOLOGY = "TECHNOLOGY"
    CULTURAL = "CULTURAL"
    SPORTS = "SPORTS"
    WORKSHOP = "WORKSHOP"
    HACKATHON = "HACKATHON"
    SEMINAR = "SEMINAR"
    COMPETITION = "COMPETITION"
    SOCIAL = "SOCIAL"
    OTHER = "OTHER"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(Enum(EventCategory), default=EventCategory.TECHNOLOGY, nullable=False, index=True)
    venue = Column(String(200), nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime, nullable=False)
    capacity = Column(Integer, nullable=False, default=100)
    poster_url = Column(String(500), nullable=True)
    status = Column(Enum(EventStatus), default=EventStatus.DRAFT, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    club = relationship("Club", back_populates="events")
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="event", cascade="all, delete-orphan")
    polls = relationship("Poll", back_populates="event", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="event", cascade="all, delete-orphan")
