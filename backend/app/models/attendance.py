from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    checked_in_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    checked_in_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_event_user_attendance"),
    )

    # Relationships
    event = relationship("Event", back_populates="attendance")
    user = relationship("User", foreign_keys=[user_id], back_populates="attendance_records")
    ticket = relationship("Ticket", back_populates="attendance")
    checked_in_by_user = relationship("User", foreign_keys=[checked_in_by])
