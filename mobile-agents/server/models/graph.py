from pydantic import BaseModel, Field
from typing import Optional


class GraphNodeData(BaseModel):
    label: str
    type: str  # input | orchestrator | agent | checkpoint | output
    status: str = "pending"
    agent_id: Optional[str] = None
    agent_color: Optional[str] = None
    agent_icon: Optional[str] = None
    result: Optional[str] = None
    duration: Optional[int] = None
    input_modality: Optional[str] = None
    timestamp: Optional[str] = None


class GraphNode(BaseModel):
    id: str
    type: str
    data: GraphNodeData
    position: dict = Field(default_factory=lambda: {"x": 0, "y": 0})


class GraphEdgeData(BaseModel):
    status: str = "pending"
    data_preview: Optional[str] = None


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    data: GraphEdgeData = Field(default_factory=GraphEdgeData)


class ExecutionGraphState(BaseModel):
    task_id: str = ""
    nodes: list[dict] = Field(default_factory=list)
    edges: list[dict] = Field(default_factory=list)
    current_node_id: Optional[str] = None
    status: str = "planning"
