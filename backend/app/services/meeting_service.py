from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.transcript import Transcript

from app.services.gemini_service import GeminiService
from app.services.transcript_parser import TranscriptParser


class MeetingService:

    @staticmethod
    def create_meeting(
        db: Session,
        title: str,
        transcript: str,
    ) -> Meeting:

        # -------------------------
        # Parse Transcript
        # -------------------------

        parsed = TranscriptParser.parse(transcript)

        # -------------------------
        # Calculate Duration
        # -------------------------

        duration = (
            max(
                line.timestamp_seconds
                for line in parsed.transcripts
            )
            if parsed.transcripts
            else 0
        )

        # -------------------------
        # Create Meeting
        # -------------------------

        meeting = Meeting(
            title=title,
            meeting_date=datetime.now(timezone.utc),
            duration_seconds=duration,
        )

        db.add(meeting)
        db.flush()

        # -------------------------
        # Save Participants
        # -------------------------

        for participant in parsed.participants:
            db.add(
                Participant(
                    meeting_id=meeting.id,
                    name=participant,
                )
            )

        # -------------------------
        # Save Transcript Lines
        # -------------------------

        for line in parsed.transcripts:
            db.add(
                Transcript(
                    meeting_id=meeting.id,
                    speaker=line.speaker,
                    timestamp_seconds=line.timestamp_seconds,
                    transcript_text=line.transcript_text,
                )
            )

        # -------------------------
        # Generate AI Response
        # -------------------------

        ai = GeminiService.generate(transcript)

        # -------------------------
        # Save Summary
        # -------------------------

        db.add(
            Summary(
                meeting_id=meeting.id,
                content=ai.summary,
            )
        )

        # -------------------------
        # Save Topics
        # -------------------------

        for topic in ai.topics:
            db.add(
                Topic(
                    meeting_id=meeting.id,
                    title=topic,
                )
            )

        # -------------------------
        # Save Action Items
        # -------------------------

        for item in ai.action_items:
            db.add(
                ActionItem(
                    meeting_id=meeting.id,
                    task=item.task,
                    owner=item.owner,
                    deadline=item.deadline,
                )
            )

        # -------------------------
        # Commit
        # -------------------------

        db.commit()
        db.refresh(meeting)

        return meeting

    @staticmethod
    def get_all_meetings(db: Session):

        return (
            db.query(Meeting)
            .order_by(Meeting.created_at.desc())
            .all()
        )

    @staticmethod
    def get_meeting_by_id(
        db: Session,
        meeting_id: int,
    ) -> Meeting:

        meeting = (
            db.query(Meeting)
            .filter(Meeting.id == meeting_id)
            .first()
        )

        if meeting is None:
            raise HTTPException(
                status_code=404,
                detail="Meeting not found",
            )

        return meeting

    @staticmethod
    def delete_meeting(
        db: Session,
        meeting_id: int,
    ):

        meeting = (
            db.query(Meeting)
            .filter(Meeting.id == meeting_id)
            .first()
        )

        if meeting is None:
            raise HTTPException(
                status_code=404,
                detail="Meeting not found",
            )

        db.delete(meeting)
        db.commit()

    @staticmethod
    def update_participants(
        db: Session,
        meeting_id: int,
        participants: list[str],
    ):

        meeting = (
            db.query(Meeting)
            .filter(Meeting.id == meeting_id)
            .first()
        )

        if meeting is None:
            raise HTTPException(
                status_code=404,
                detail="Meeting not found",
            )

        # Remove existing participants
        (
            db.query(Participant)
            .filter(Participant.meeting_id == meeting_id)
            .delete()
        )

        # Remove duplicates and empty names
        participants = sorted({
            name.strip()
            for name in participants
            if name.strip()
        })

        # Insert updated participants
        for name in participants:
            db.add(
                Participant(
                    meeting_id=meeting_id,
                    name=name,
                )
            )

        db.commit()

        return (
            db.query(Participant)
            .filter(Participant.meeting_id == meeting_id)
            .all()
        )

    @staticmethod
    def search_transcript(
        db: Session,
        meeting_id: int,
        query: str,
    ):

        return (
            db.query(Transcript)
            .filter(
                Transcript.meeting_id == meeting_id,
                Transcript.transcript_text.ilike(f"%{query}%"),
            )
            .order_by(Transcript.timestamp_seconds)
            .all()
        )