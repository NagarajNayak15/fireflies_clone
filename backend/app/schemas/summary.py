from pydantic import BaseModel


class SummaryResponse(BaseModel):
    id: int
    content: str

    class Config:
        from_attributes = True