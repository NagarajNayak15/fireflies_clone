from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    meeting_date = Column(DateTime)

    duration_seconds = Column(Integer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    participants = relationship(
        "Participant",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    transcripts = relationship(
        "Transcript",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    summary = relationship(
        "Summary",
        back_populates="meeting",
        uselist=False,
        cascade="all, delete-orphan"
    )

    topics = relationship(
        "Topic",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    action_items = relationship(
        "ActionItem",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )