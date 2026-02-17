import asyncio
import json
import re
import time
import inspect
from typing import AsyncGenerator

from openai import OpenAI

from crew.tools import TOOL_FUNCTIONS


def _extract_arxiv_urls(text: str) -> list[str]:
    """Extract arXiv paper URLs from text."""
    return re.findall(r"http://arxiv\.org/abs/[\w.]+", text)


def _extract_wiki_titles(text: str) -> list[str]:
    """Extract Wikipedia article titles from search result text."""
    return re.findall(r"\*\*(.+?)\*\*", text)


def _call_tool(
    action: str,
    params: dict,
    prev_results: dict[str, str],
    description: str,
    agent_id: str = "",
) -> str:
    """
    Call a tool function by action name with the given params.
    When a step depends on previous steps but has incomplete params,
    extracts structured data (URLs, titles) from previous results.
    """
    prev_text = "\n\n".join(prev_results.values()) if prev_results else ""

    func = TOOL_FUNCTIONS.get(action)
    if not func:
        for name, fn in TOOL_FUNCTIONS.items():
            if action.replace(" ", "_").lower() in name:
                func = fn
                break

    if not func:
        defaults = {
            "arxiv": "arxiv_search",
            "proposal": "generate_proposal",
            "wikipedia": "wiki_search",
        }
        fallback_name = defaults.get(agent_id)
        func = TOOL_FUNCTIONS.get(fallback_name) if fallback_name else None
        if not func:
            return f"Unknown action: {action}. Description: {description}"

    sig = inspect.signature(func)
    param_names = list(sig.parameters.keys())

    kwargs = {}
    for k, v in params.items():
        if k in param_names:
            kwargs[k] = v

    # Handle dependent steps with incomplete params
    if not kwargs and prev_results:
        if action == "arxiv_summarize":
            urls = _extract_arxiv_urls(prev_text)
            if urls:
                parts = []
                for url in urls:
                    parts.append(TOOL_FUNCTIONS["arxiv_summarize"](url))
                return "\n\n---\n\n".join(parts)
            return prev_text

        if action == "wiki_summarize":
            titles = _extract_wiki_titles(prev_text)[:3]
            if titles:
                parts = []
                for title in titles:
                    parts.append(TOOL_FUNCTIONS["wiki_summarize"](title))
                return "\n\n---\n\n".join(parts)
            return prev_text

        if action in ("generate_proposal", "outline_methodology"):
            first_param = param_names[0] if param_names else None
            if first_param:
                kwargs[first_param] = description
            if "context" in param_names:
                kwargs["context"] = prev_text[:1000]

    if not kwargs:
        first_param = param_names[0] if param_names else None
        if first_param:
            kwargs[first_param] = description

    if prev_results and "context" in param_names and "context" not in kwargs:
        kwargs["context"] = prev_text[:1000]

    try:
        return func(**kwargs)
    except Exception as e:
        return f"Tool execution failed ({action}): {e}"


def _synthesize(
    client: OpenAI,
    user_message: str,
    plan_summary: str,
    step_results: list[dict],
) -> str:
    """
    Call the LLM as the orchestrator to synthesize all agent results
    into a single coherent response for the user.
    """
    results_block = "\n\n".join(
        f"### Agent step: {s['description']}\n{s['result']}"
        for s in step_results
    )

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a research orchestrator synthesizing agent results for "
                    "a MOBILE interface. Responses are read on small screens.\n\n"
                    "Guidelines:\n"
                    "- Be concise: aim for 150-300 words max\n"
                    "- Lead with the key finding or answer in 1-2 sentences\n"
                    "- Use short bullet points, not long paragraphs\n"
                    "- Use markdown: **bold** for emphasis, short headings, compact lists\n"
                    "- Keep relevant URLs but don't list more than 3-5\n"
                    "- Do NOT mention the agents or internal execution process\n"
                    "- Use uncertainty-aware language: 'based on available results' "
                    "rather than absolute claims\n"
                    "- End with a one-line disclaimer: '*Results may not be exhaustive "
                    "— verify for critical decisions.*'"
                ),
            },
            {
                "role": "user",
                "content": (
                    f"**User request:** {user_message}\n\n"
                    f"**Plan summary:** {plan_summary}\n\n"
                    f"**Agent results:**\n\n{results_block}"
                ),
            },
        ],
        max_tokens=800,
    )
    return response.choices[0].message.content


async def execute_plan_stream(
    plan: dict, graph: dict, api_key: str
) -> AsyncGenerator[str, None]:
    """
    Execute a plan step by step, calling real tools and yielding SSE events.
    After all agent steps complete, the orchestrator synthesizes a final response.
    """
    yield f"data: {json.dumps({'type': 'graph_init', 'graph': graph})}\n\n"

    completed_steps: dict[str, str] = {}
    step_results: list[dict] = []

    while len(completed_steps) < len(plan["steps"]):
        ready = [
            s
            for s in plan["steps"]
            if s["id"] not in completed_steps
            and all(d in completed_steps for d in s.get("depends_on", []))
        ]

        if not ready:
            break

        for step in ready:
            step_id = step["id"]

            incoming_edges = [
                e for e in graph["edges"] if e["target"] == step_id
            ]
            for e in incoming_edges:
                yield f"data: {json.dumps({'type': 'edge_status', 'edgeId': e['id'], 'status': 'active'})}\n\n"

            yield f"data: {json.dumps({'type': 'node_status', 'nodeId': step_id, 'status': 'running'})}\n\n"

            prev_results = {
                dep_id: completed_steps[dep_id]
                for dep_id in step.get("depends_on", [])
                if dep_id in completed_steps
            }

            start = time.time()
            result = await asyncio.to_thread(
                _call_tool,
                step.get("action", ""),
                step.get("params", {}),
                prev_results,
                step.get("description", ""),
                step.get("agent_id", ""),
            )
            duration = int((time.time() - start) * 1000)

            yield f"data: {json.dumps({'type': 'node_status', 'nodeId': step_id, 'status': 'completed', 'result': result, 'duration': duration})}\n\n"

            for e in incoming_edges:
                yield f"data: {json.dumps({'type': 'edge_status', 'edgeId': e['id'], 'status': 'completed'})}\n\n"

            if step.get("requires_approval"):
                cp_id = f"checkpoint_{step_id}"
                yield f"data: {json.dumps({'type': 'node_status', 'nodeId': cp_id, 'status': 'awaiting_approval'})}\n\n"
                yield f"data: {json.dumps({'type': 'checkpoint_reached', 'nodeId': cp_id, 'stepId': step_id})}\n\n"
                await asyncio.sleep(2)
                yield f"data: {json.dumps({'type': 'node_status', 'nodeId': cp_id, 'status': 'approved'})}\n\n"
                cp_edges = [
                    e for e in graph["edges"] if e["source"] == cp_id
                ]
                for e in cp_edges:
                    yield f"data: {json.dumps({'type': 'edge_status', 'edgeId': e['id'], 'status': 'completed'})}\n\n"

            completed_steps[step_id] = result
            step_results.append({
                "id": step_id,
                "description": step.get("description", ""),
                "result": result,
            })
            await asyncio.sleep(0.2)

    # ── Orchestrator synthesis ──
    # Activate edges to output and show orchestrator is synthesizing
    output_edges = [e for e in graph["edges"] if e["target"] == "output"]
    for e in output_edges:
        yield f"data: {json.dumps({'type': 'edge_status', 'edgeId': e['id'], 'status': 'active'})}\n\n"

    yield f"data: {json.dumps({'type': 'node_status', 'nodeId': 'output', 'status': 'running'})}\n\n"

    # Call the LLM to synthesize all agent results
    user_message = plan.get("user_message", plan.get("summary", ""))
    # Include multimodal context so synthesis knows about images/audio
    image_analysis = plan.get("image_analysis")
    audio_transcript = plan.get("audio_transcript")
    if image_analysis:
        user_message += f"\n\n[User also provided an image. Image analysis: {image_analysis}]"
    if audio_transcript and audio_transcript != user_message:
        user_message += f"\n\n[Transcribed from voice: {audio_transcript}]"
    plan_summary = plan.get("summary", "")
    client = OpenAI(api_key=api_key)

    start = time.time()
    summary = await asyncio.to_thread(
        _synthesize, client, user_message, plan_summary, step_results
    )
    duration = int((time.time() - start) * 1000)

    for e in output_edges:
        yield f"data: {json.dumps({'type': 'edge_status', 'edgeId': e['id'], 'status': 'completed'})}\n\n"

    yield f"data: {json.dumps({'type': 'node_status', 'nodeId': 'output', 'status': 'completed', 'result': 'Synthesis complete', 'duration': duration})}\n\n"
    yield f"data: {json.dumps({'type': 'execution_complete', 'graph': graph, 'summary': summary})}\n\n"
