from pydantic import BaseModel


class ParsedTranscriptLine(BaseModel):
    speaker: str
    timestamp_seconds: int
    transcript_text: str


class ParsedTranscript(BaseModel):
    participants: list[str]
    transcripts: list[ParsedTranscriptLine]


class TranscriptResponse(BaseModel):
    id: int
    speaker: str
    timestamp_seconds: int
    transcript_text: str

    class Config:
        from_attributes = True