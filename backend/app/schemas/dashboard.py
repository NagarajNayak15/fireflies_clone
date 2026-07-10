from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    total_meetings: int
    total_participants: int
    total_action_items: int
    completed_action_items: int