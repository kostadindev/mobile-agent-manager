from fastapi import APIRouter
from crewai import LLM
from openai import OpenAI

from models.messages import ChatRequest, ChatResponse
from crew.orchestrator import AgentFlowOrchestrator
from services.agent_store import get_agents
from services.image_analyzer import analyze_image
from services.audio_transcriber import transcribe_audio
from config import settings

router = APIRouter()


@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint. Accepts text, image, and/or audio input.
    Analyzes multimodal input and returns a task plan with execution graph.
    """
    llm = LLM(model="gpt-4.1", api_key=settings.openai_api_key)
    orchestrator = AgentFlowOrchestrator(llm=llm)
    client = OpenAI(api_key=settings.openai_api_key)

    image_analysis = None
    audio_transcript = None
    input_modality = request.input_modality

    # Handle image input
    if request.image_base64:
        image_analysis = await analyze_image(client, request.image_base64)
        input_modality = "image"

    # Handle audio input
    if request.audio_base64:
        audio_transcript = await transcribe_audio(client, request.audio_base64)
        input_modality = "voice"

    # Determine the user message: prefer explicit text, fall back to audio transcript
    user_message = request.message
    if not user_message and audio_transcript:
        user_message = audio_transcript
    if not user_message:
        user_message = "Analyze this image" if image_analysis else "Hello"

    result = await orchestrator.plan(
        user_message=user_message,
        image_analysis=image_analysis,
        audio_transcript=audio_transcript,
        input_modality=input_modality,
    )

    summary = result["plan"]["summary"]
    step_count = len(result["plan"]["steps"])
    agents_involved = set(s["agent_id"] for s in result["plan"]["steps"])

    # Look up agent names from the store
    all_agents = {a["id"]: a for a in get_agents()}
    agent_names = [all_agents[a]["name"] for a in agents_involved if a in all_agents]

    # Handle 0-step plans (non-research requests like "return this image", "hello")
    if step_count == 0:
        return ChatResponse(
            message=summary,
            plan=None,
            graph=None,
            image_base64=request.image_base64,
        )

    modality_note = ""
    if input_modality == "voice" and audio_transcript:
        modality_note = f'\n\n*Transcribed from voice:* "{audio_transcript}"'
    elif input_modality == "image" and image_analysis:
        modality_note = f"\n\n*From image analysis:* {image_analysis[:200]}..."

    message = (
        f"**{summary}** — {step_count} step(s) via {', '.join(agent_names)}."
        f"{modality_note}"
    )

    return ChatResponse(
        message=message,
        plan=result["plan"],
        graph=result["graph"],
        image_base64=request.image_base64,
    )
