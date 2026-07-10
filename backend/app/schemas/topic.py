from pydantic import BaseModel


class TopicResponse(BaseModel):
    id: int
    title: str
    timestamp_seconds: int | None = None

    class Config:
        from_attributes = True