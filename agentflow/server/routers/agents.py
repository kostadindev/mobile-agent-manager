from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.agent_store import (
    get_agents as store_get_agents,
    get_agent as store_get_agent,
    create_agent as store_create_agent,
    update_agent as store_update_agent,
    delete_agent as store_delete_agent,
)

router = APIRouter()


class AgentCreate(BaseModel):
    id: str
    name: str
    icon: str = "Bot"
    description: str = ""
    role: str = ""
    goal: str = ""
    backstory: str = ""
    capabilities: list[str] = []
    enabled: bool = True
    requiresApproval: bool = False
    color: str = "#A855F7"
    isOrchestrator: Optional[bool] = None
    constitution: Optional[str] = None


@router.get("/api/agents")
async def list_agents():
    """Return all available agents."""
    return store_get_agents()


@router.post("/api/agents")
async def create_agent(agent: AgentCreate):
    return store_create_agent(agent.model_dump(exclude_none=True))


@router.put("/api/agents/{agent_id}")
async def update_agent(agent_id: str, agent: AgentCreate):
    result = store_update_agent(agent_id, agent.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return result


@router.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str):
    if not store_delete_agent(agent_id):
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"ok": True}
