from fastapi import APIRouter, Depends
from pydantic import BaseModel

from services import db
from auth import get_current_user

router = APIRouter()

# Keep in-memory store as fallback for when no execution_id is available
_pending_approvals: dict[str, bool | None] = {}


class ApprovalRequest(BaseModel):
    approved: bool
    comment: str = ""
    execution_id: str | None = None


@router.post("/api/approve/{step_id}")
async def approve_step(step_id: str, request: ApprovalRequest, user: dict = Depends(get_current_user)):
    """Approve or reject a checkpoint step."""
    if request.execution_id:
        db.resolve_approval(step_id, request.approved, request.comment)
    else:
        _pending_approvals[step_id] = request.approved
    return {
        "stepId": step_id,
        "approved": request.approved,
        "comment": request.comment,
    }


@router.get("/api/approve/{step_id}")
async def get_approval_status(step_id: str, user: dict = Depends(get_current_user)):
    """Check approval status for a step."""
    # Try DB first
    approval = db.get_approval(step_id)
    if approval:
        if approval["approved"] is None:
            return {"stepId": step_id, "status": "pending"}
        return {
            "stepId": step_id,
            "status": "approved" if approval["approved"] else "rejected",
        }
    # Fallback to in-memory
    status = _pending_approvals.get(step_id)
    if status is None:
        return {"stepId": step_id, "status": "pending"}
    return {
        "stepId": step_id,
        "status": "approved" if status else "rejected",
    }
