from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("registrations.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    ticket_code = Column(String(50), unique=True, nullable=False, index=True)
    qr_token = Column(String(100), unique=True, nullable=False, index=True)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    used = Column(Boolean, default=False, nullable=False, index=True)
    used_at = Column(DateTime, nullable=True)

    # Relationships
    registration = relationship("Registration", back_populates="ticket")
    attendance = relationship("Attendance", back_populates="ticket", uselist=False)
