from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TaskStep(BaseModel):
    id: str
    agent_id: str
    action: str
    description: str
    params: dict = Field(default_factory=dict)
    status: str = "pending"
    result: Optional[str] = None
    requires_approval: bool = False
    depends_on: list[str] = Field(default_factory=list)


class TaskPlan(BaseModel):
    id: str = ""
    summary: str
    steps: list[TaskStep]
    status: str = "proposed"
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
