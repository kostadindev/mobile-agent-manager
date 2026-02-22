from fastapi import APIRouter, Depends

from auth import get_current_user
from services import db

router = APIRouter()


@router.get("/api/conversations")
async def list_conversations(user: dict = Depends(get_current_user)):
    """Return all conversations for the authenticated user."""
    user_id = user["sub"]
    conversations = db.list_conversations(user_id)
    # Attach messages to each conversation
    for conv in conversations:
        conv["messages"] = db.list_messages(conv["id"])
    return conversations


@router.post("/api/conversations")
async def create_conversation(body: dict, user: dict = Depends(get_current_user)):
    """Create a new conversation."""
    user_id = user["sub"]
    title = body.get("title", "Untitled")
    transparency_level = body.get("transparency_level", "full_transparency")
    return db.create_conversation(user_id, title, transparency_level)


@router.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user: dict = Depends(get_current_user)):
    """Delete a conversation."""
    db.delete_conversation(conversation_id)
    return {"ok": True}
