from pydantic import BaseModel


class ParticipantResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ParticipantUpdate(BaseModel):
    participants: list[str]