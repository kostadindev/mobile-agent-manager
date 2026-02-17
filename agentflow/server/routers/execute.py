from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from services.execution_tracker import execute_plan_stream

router = APIRouter()


@router.post("/api/execute")
async def execute_plan(request: Request):
    """Execute a plan, streaming graph updates via SSE."""
    body = await request.json()
    plan = body["plan"]
    graph = body["graph"]

    return StreamingResponse(
        execute_plan_stream(plan, graph),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
