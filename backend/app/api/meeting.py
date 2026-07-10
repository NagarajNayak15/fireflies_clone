from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from typing import List
from fastapi import status
from app.schemas.transcript import TranscriptResponse
from app.schemas.participant import (
    ParticipantResponse,
    ParticipantUpdate,
)

from app.schemas.meeting import (
    MeetingResponse,
    MeetingListResponse,
    MeetingDetailResponse,
)
from app.dependencies import get_db
from app.schemas.meeting import MeetingResponse
from app.services.meeting_service import MeetingService

router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"]
)

@router.get(
    "",
    response_model=List[MeetingListResponse],
)
def get_all_meetings(
    db: Session = Depends(get_db),
):

    return MeetingService.get_all_meetings(db)

@router.get(
    "/{meeting_id}",
    response_model=MeetingDetailResponse,
)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):

    return MeetingService.get_meeting_by_id(
        db,
        meeting_id,
    )

@router.get(
    "/{meeting_id}/search",
    response_model=list[TranscriptResponse],
)
def search_transcript(
    meeting_id: int,
    q: str,
    db: Session = Depends(get_db),
):

    return MeetingService.search_transcript(
        db=db,
        meeting_id=meeting_id,
        query=q,
    )


@router.post(
    "",
    response_model=MeetingResponse,
    status_code=201
)
async def create_meeting(
    title: str = Form(...),
    transcript: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    if not transcript.filename.endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="Only .txt transcript files are supported."
        )

    transcript_text = (
        await transcript.read()
    ).decode("utf-8")

    meeting = MeetingService.create_meeting(
        db=db,
        title=title,
        transcript=transcript_text,
    )

    return meeting



@router.delete(
    "/{meeting_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):

    MeetingService.delete_meeting(
        db,
        meeting_id,
    )


@router.put(
    "/{meeting_id}/participants",
    response_model=list[ParticipantResponse],
)
def update_participants(
    meeting_id: int,
    request: ParticipantUpdate,
    db: Session = Depends(get_db),
):

    return MeetingService.update_participants(
        db,
        meeting_id,
        request.participants,
    ) 
