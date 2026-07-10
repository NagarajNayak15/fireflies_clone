from pydantic import BaseModel


class ActionItemResponse(BaseModel):
    task: str
    owner: str | None = None
    deadline: str | None = None


class AIResponse(BaseModel):
    summary: str
    topics: list[str]
    action_items: list[ActionItemResponse]