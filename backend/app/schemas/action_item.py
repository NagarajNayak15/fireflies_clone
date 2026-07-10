from pydantic import BaseModel


class ActionItemResponse(BaseModel):
    id: int
    task: str
    owner: str | None = None
    deadline: str | None = None
    completed: bool

    class Config:
        from_attributes = True


class ActionItemUpdate(BaseModel):
    completed: bool