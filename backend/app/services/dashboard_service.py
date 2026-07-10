from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.models.participant import Participant


class DashboardService:

    @staticmethod
    def get_stats(db: Session):

        return {
            "total_meetings": db.query(func.count(Meeting.id)).scalar(),

            "total_participants": db.query(
                func.count(Participant.id)
            ).scalar(),

            "total_action_items": db.query(
                func.count(ActionItem.id)
            ).scalar(),

            "completed_action_items": db.query(
                func.count(ActionItem.id)
            ).filter(
                ActionItem.completed == True
            ).scalar(),
        }