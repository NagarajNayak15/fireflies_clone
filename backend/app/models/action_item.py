from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )

    task = Column(String, nullable=False)

    owner = Column(String)

    deadline = Column(String)

    completed = Column(Boolean, default=False)

    meeting = relationship(
        "Meeting",
        back_populates="action_items"
    )