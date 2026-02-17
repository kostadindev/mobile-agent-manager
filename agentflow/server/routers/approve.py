from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# In-memory approval store (prototype)
_pending_approvals: dict[str, bool | None] = {}


class ApprovalRequest(BaseModel):
    approved: bool
    comment: str = ""


@router.post("/api/approve/{step_id}")
async def approve_step(step_id: str, request: ApprovalRequest):
    """Approve or reject a checkpoint step."""
    _pending_approvals[step_id] = request.approved
    return {
        "stepId": step_id,
        "approved": request.approved,
        "comment": request.comment,
    }


@router.get("/api/approve/{step_id}")
async def get_approval_status(step_id: str):
    """Check approval status for a step."""
    status = _pending_approvals.get(step_id)
    if status is None:
        return {"stepId": step_id, "status": "pending"}
    return {
        "stepId": step_id,
        "status": "approved" if status else "rejected",
    }
