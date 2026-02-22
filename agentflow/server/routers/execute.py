from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse

from services.execution_tracker import execute_plan_stream
from services import db
from auth import get_current_user
from config import settings

router = APIRouter()


@router.post("/api/execute")
async def execute_plan(request: Request, user: dict = Depends(get_current_user)):
    """Execute a plan, streaming graph updates via SSE."""
    body = await request.json()
    plan = body["plan"]
    graph = body["graph"]
    conversation_id = body.get("conversation_id")

    # Create execution record if conversation is tracked
    execution_id = None
    if conversation_id:
        exec_row = db.create_execution(conversation_id, plan, graph)
        execution_id = exec_row["id"]

    collected_results: list[dict] = []
    collected_summary: list[str] = [None]

    async def tracked_stream():
        async for chunk in execute_plan_stream(plan, graph, api_key=settings.openai_api_key):
            # Capture step results and summary from SSE events
            if chunk.startswith("data: "):
                import json
                try:
                    event = json.loads(chunk[6:].strip())
                    if event.get("type") == "node_status" and event.get("status") == "completed" and event.get("nodeId") != "output":
                        collected_results.append({
                            "nodeId": event["nodeId"],
                            "result": event.get("result", ""),
                            "duration": event.get("duration"),
                        })
                    if event.get("type") == "execution_complete":
                        collected_summary[0] = event.get("summary", "")
                except (json.JSONDecodeError, KeyError):
                    pass
            yield chunk

        # After stream completes, persist execution results
        if execution_id:
            status = "completed" if collected_summary[0] is not None else "failed"
            db.complete_execution(execution_id, status, collected_summary[0], collected_results)
            # Also persist the summary as an assistant message
            if conversation_id and collected_summary[0]:
                db.insert_message(conversation_id, "assistant", collected_summary[0])

    return StreamingResponse(
        tracked_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
