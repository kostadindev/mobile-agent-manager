"""Data access layer for Supabase tables."""

from typing import Optional
from services.supabase_client import get_supabase


# ── Conversations ──

def create_conversation(user_id: str, title: str, transparency_level: str = "full_transparency") -> dict:
    sb = get_supabase()
    row = sb.table("conversations").insert({
        "user_id": user_id,
        "title": title,
        "transparency_level": transparency_level,
    }).execute()
    return row.data[0]


def list_conversations(user_id: str) -> list[dict]:
    sb = get_supabase()
    rows = sb.table("conversations").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return rows.data


def get_conversation(conversation_id: str) -> Optional[dict]:
    sb = get_supabase()
    rows = sb.table("conversations").select("*").eq("id", conversation_id).execute()
    return rows.data[0] if rows.data else None


def delete_conversation(conversation_id: str) -> bool:
    sb = get_supabase()
    sb.table("conversations").delete().eq("id", conversation_id).execute()
    return True


# ── Messages ──

def insert_message(
    conversation_id: str,
    role: str,
    content: str,
    image_url: Optional[str] = None,
    voice_transcript: Optional[str] = None,
    agent_id: Optional[str] = None,
    input_modality: str = "text",
    task_plan: Optional[dict] = None,
    execution_graph: Optional[dict] = None,
) -> dict:
    sb = get_supabase()
    row = sb.table("messages").insert({
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "image_url": image_url,
        "voice_transcript": voice_transcript,
        "agent_id": agent_id,
        "input_modality": input_modality,
        "task_plan": task_plan,
        "execution_graph": execution_graph,
    }).execute()
    return row.data[0]


def list_messages(conversation_id: str) -> list[dict]:
    sb = get_supabase()
    rows = sb.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
    return rows.data


# ── Executions ──

def create_execution(conversation_id: str, plan: dict, graph: dict) -> dict:
    sb = get_supabase()
    row = sb.table("executions").insert({
        "conversation_id": conversation_id,
        "plan": plan,
        "graph": graph,
        "status": "running",
    }).execute()
    return row.data[0]


def complete_execution(execution_id: str, status: str, summary: Optional[str], step_results: Optional[list]) -> dict:
    sb = get_supabase()
    row = sb.table("executions").update({
        "status": status,
        "summary": summary,
        "step_results": step_results,
        "completed_at": "now()",
    }).eq("id", execution_id).execute()
    return row.data[0] if row.data else {}


# ── Approvals ──

def create_approval(execution_id: str, step_id: str) -> dict:
    sb = get_supabase()
    row = sb.table("approvals").insert({
        "execution_id": execution_id,
        "step_id": step_id,
    }).execute()
    return row.data[0]


def resolve_approval(step_id: str, approved: bool, comment: str = "") -> Optional[dict]:
    sb = get_supabase()
    row = sb.table("approvals").update({
        "approved": approved,
        "comment": comment,
        "resolved_at": "now()",
    }).eq("step_id", step_id).is_("approved", "null").execute()
    return row.data[0] if row.data else None


def get_approval(step_id: str) -> Optional[dict]:
    sb = get_supabase()
    rows = sb.table("approvals").select("*").eq("step_id", step_id).order("created_at", desc=True).limit(1).execute()
    return rows.data[0] if rows.data else None
