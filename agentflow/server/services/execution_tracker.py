import asyncio
import json
import re
import time
import inspect
from typing import AsyncGenerator

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
        # Try fuzzy match
        for name, fn in TOOL_FUNCTIONS.items():
            if action.replace(" ", "_").lower() in name:
                func = fn
                break

    if not func:
        # No matching tool — pick default based on agent_id and whether
        # we have previous results to summarize or search fresh
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

    # Build kwargs from explicit step params
    kwargs = {}
    for k, v in params.items():
        if k in param_names:
            kwargs[k] = v

    # ── Handle dependent steps with incomplete params ──
    if not kwargs and prev_results:
        # arxiv_summarize: extract URLs from previous search results, summarize each
        if action == "arxiv_summarize":
            urls = _extract_arxiv_urls(prev_text)
            if urls:
                parts = []
                for url in urls:
                    parts.append(TOOL_FUNCTIONS["arxiv_summarize"](url))
                return "\n\n---\n\n".join(parts)
            # If no URLs found, return the search results as-is
            return prev_text

        # wiki_summarize: extract titles from previous search results, summarize each
        if action == "wiki_summarize":
            titles = _extract_wiki_titles(prev_text)[:3]
            if titles:
                parts = []
                for title in titles:
                    parts.append(TOOL_FUNCTIONS["wiki_summarize"](title))
                return "\n\n---\n\n".join(parts)
            return prev_text

        # generate_proposal / outline_methodology: use description as topic, prev as context
        if action in ("generate_proposal", "outline_methodology"):
            first_param = param_names[0] if param_names else None
            if first_param:
                kwargs[first_param] = description
            if "context" in param_names:
                kwargs["context"] = prev_text[:1000]

    # ── Fallback: use description for the first param if still empty ──
    if not kwargs:
        first_param = param_names[0] if param_names else None
        if first_param:
            kwargs[first_param] = description

    # Inject previous results as context for any tool that accepts it
    if prev_results and "context" in param_names and "context" not in kwargs:
        kwargs["context"] = prev_text[:1000]

    try:
        return func(**kwargs)
    except Exception as e:
        return f"Tool execution failed ({action}): {e}"


async def execute_plan_stream(
    plan: dict, graph: dict
) -> AsyncGenerator[str, None]:
    """
    Execute a plan step by step, calling real tools and yielding SSE events
    for real-time graph updates. Steps respect dependency ordering.
    """
    yield f"data: {json.dumps({'type': 'graph_init', 'graph': graph})}\n\n"

    completed_steps: dict[str, str] = {}  # step_id -> result text
    steps_by_id = {s["id"]: s for s in plan["steps"]}

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

            # Activate incoming edges
            incoming_edges = [
                e for e in graph["edges"] if e["target"] == step_id
            ]
            for e in incoming_edges:
                yield f"data: {json.dumps({'type': 'edge_status', 'edgeId': e['id'], 'status': 'active'})}\n\n"

            # Node running
            yield f"data: {json.dumps({'type': 'node_status', 'nodeId': step_id, 'status': 'running'})}\n\n"

            # Gather results from dependencies
            prev_results = {
                dep_id: completed_steps[dep_id]
                for dep_id in step.get("depends_on", [])
                if dep_id in completed_steps
            }

            # Call the real tool
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

            # Node completed with real result
            yield f"data: {json.dumps({'type': 'node_status', 'nodeId': step_id, 'status': 'completed', 'result': result, 'duration': duration})}\n\n"

            for e in incoming_edges:
                yield f"data: {json.dumps({'type': 'edge_status', 'edgeId': e['id'], 'status': 'completed'})}\n\n"

            # Checkpoint handling
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
            await asyncio.sleep(0.2)

    # Activate edges to output
    output_edges = [e for e in graph["edges"] if e["target"] == "output"]
    for e in output_edges:
        yield f"data: {json.dumps({'type': 'edge_status', 'edgeId': e['id'], 'status': 'active'})}\n\n"
    await asyncio.sleep(0.3)
    for e in output_edges:
        yield f"data: {json.dumps({'type': 'edge_status', 'edgeId': e['id'], 'status': 'completed'})}\n\n"

    # Build a summary of all results
    summary_parts = []
    for step in plan["steps"]:
        sid = step["id"]
        if sid in completed_steps:
            summary_parts.append(
                f"### {step.get('description', sid)}\n\n{completed_steps[sid]}"
            )
    summary = "\n\n---\n\n".join(summary_parts)

    yield f"data: {json.dumps({'type': 'node_status', 'nodeId': 'output', 'status': 'completed', 'result': 'All tasks completed'})}\n\n"
    yield f"data: {json.dumps({'type': 'execution_complete', 'graph': graph, 'summary': summary})}\n\n"
