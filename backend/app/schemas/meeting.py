from datetime import datetime

from pydantic import BaseModel

from app.schemas.action_item import ActionItemResponse
from app.schemas.participant import ParticipantResponse
from app.schemas.summary import SummaryResponse
from app.schemas.topic import TopicResponse
from app.schemas.transcript import TranscriptResponse


class MeetingCreate(BaseModel):
    title: str


class MeetingResponse(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class MeetingListResponse(BaseModel):
    id: int
    title: str
    meeting_date: datetime | None = None
    duration_seconds: int | None = None

    class Config:
        from_attributes = True


class MeetingDetailResponse(BaseModel):
    id: int
    title: str
    meeting_date: datetime | None = None
    duration_seconds: int | None = None

    participants: list[ParticipantResponse]

    transcripts: list[TranscriptResponse]

    summary: SummaryResponse | None = None

    topics: list[TopicResponse]

    action_items: list[ActionItemResponse]

    class Config:
        from_attributes = True