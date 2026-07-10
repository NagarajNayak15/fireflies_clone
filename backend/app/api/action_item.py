from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.action_item import (
    ActionItemResponse,
    ActionItemUpdate,
)
from app.services.action_item_service import ActionItemService

router = APIRouter(
    prefix="/action-items",
    tags=["Action Items"],
)


@router.patch(
    "/{action_item_id}",
    response_model=ActionItemResponse,
)
def update_action_item(
    action_item_id: int,
    request: ActionItemUpdate,
    db: Session = Depends(get_db),
):

    return ActionItemService.update_status(
        db=db,
        action_item_id=action_item_id,
        completed=request.completed,
    )