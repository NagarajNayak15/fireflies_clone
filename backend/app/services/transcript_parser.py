import re

from app.schemas.transcript import (
    ParsedTranscript,
    ParsedTranscriptLine,
)


class TranscriptParser:
    """
    Expected transcript format:

    00:00 John: Hello everyone.
    00:10 Sarah: Sprint planning starts.
    00:25 Mike: Authentication completed.
    """

    PATTERN = re.compile(
        r"^(\d{2}:\d{2})\s+([^:]+):\s+(.*)$"
    )

    @staticmethod
    def time_to_seconds(timestamp: str) -> int:
        minutes, seconds = map(int, timestamp.split(":"))
        return minutes * 60 + seconds

    @classmethod
    def parse(cls, transcript: str) -> ParsedTranscript:

        participants = set()
        transcript_lines = []

        for line in transcript.splitlines():

            line = line.strip()

            if not line:
                continue

            match = cls.PATTERN.match(line)

            if not match:
                continue

            timestamp = match.group(1)
            speaker = match.group(2).strip()
            text = match.group(3).strip()

            participants.add(speaker)

            transcript_lines.append(
                ParsedTranscriptLine(
                    speaker=speaker,
                    timestamp_seconds=cls.time_to_seconds(timestamp),
                    transcript_text=text,
                )
            )

        return ParsedTranscript(
            participants=sorted(participants),
            transcripts=transcript_lines,
        )