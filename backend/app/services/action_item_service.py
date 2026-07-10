from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.action_item import ActionItem


class ActionItemService:

    @staticmethod
    def update_status(
        db: Session,
        action_item_id: int,
        completed: bool,
    ):

        action_item = (
            db.query(ActionItem)
            .filter(ActionItem.id == action_item_id)
            .first()
        )

        if action_item is None:
            raise HTTPException(
                status_code=404,
                detail="Action item not found",
            )

        action_item.completed = completed

        db.commit()
        db.refresh(action_item)

        return action_item