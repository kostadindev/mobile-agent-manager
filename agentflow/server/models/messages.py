from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ChatMessage(BaseModel):
    id: str = ""
    role: str = "user"
    content: str
    image_url: Optional[str] = None
    voice_transcript: Optional[str] = None
    agent_id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    input_modality: str = "text"


class ChatRequest(BaseModel):
    message: str = ""
    image_base64: Optional[str] = None
    audio_base64: Optional[str] = None
    input_modality: str = "text"


class ChatResponse(BaseModel):
    message: str
    plan: Optional[dict] = None
    graph: Optional[dict] = None
