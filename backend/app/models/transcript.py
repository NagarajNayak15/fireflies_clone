from sqlalchemy import Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.database.database import Base


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )

    speaker = Column(Text, nullable=False)

    timestamp_seconds = Column(Integer, nullable=False)

    transcript_text = Column(Text, nullable=False)

    meeting = relationship(
        "Meeting",
        back_populates="transcripts"
    )