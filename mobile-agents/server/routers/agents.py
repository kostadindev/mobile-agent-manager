from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from services.agent_store import (
    get_agents as store_get_agents,
    get_agent as store_get_agent,
    create_agent as store_create_agent,
    update_agent as store_update_agent,
    delete_agent as store_delete_agent,
)
from auth import get_current_user

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
async def list_agents(user: dict = Depends(get_current_user)):
    """Return all available agents."""
    return store_get_agents()


@router.post("/api/agents")
async def create_agent(agent: AgentCreate, user: dict = Depends(get_current_user)):
    return store_create_agent(agent.model_dump(exclude_none=True))


@router.put("/api/agents/{agent_id}")
async def update_agent(agent_id: str, agent: AgentCreate, user: dict = Depends(get_current_user)):
    result = store_update_agent(agent_id, agent.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return result


@router.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str, user: dict = Depends(get_current_user)):
    if not store_delete_agent(agent_id):
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"ok": True}
