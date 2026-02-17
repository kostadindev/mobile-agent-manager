from crewai import Crew, Task, Process, LLM
from pydantic import BaseModel
import uuid

from .agents import create_agents, create_orchestrator_agent, AGENT_METADATA
from .tasks import build_crew_task

AGENT_COLORS = {
    "arxiv": "#A855F7",
    "proposal": "#F97316",
    "wikipedia": "#06B6D4",
}

AGENT_ICONS = {
    "arxiv": "BookOpen",
    "proposal": "Lightbulb",
    "wikipedia": "Globe",
}


class PlanStep(BaseModel):
    id: str
    agent_id: str
    action: str
    description: str
    params: dict
    requires_approval: bool
    depends_on: list[str]


class TaskPlan(BaseModel):
    summary: str
    steps: list[PlanStep]


class AgentFlowOrchestrator:
    """
    A CrewAI-based orchestrator that uses an orchestrator agent to plan tasks
    and a hierarchical crew to execute them via specialized worker agents.
    """

    def __init__(self, llm: LLM):
        self.llm = llm
        self.worker_agents = create_agents(llm)
        self.orchestrator_agent = create_orchestrator_agent(llm)

    async def plan(
        self,
        user_message: str,
        image_analysis: str | None = None,
        audio_transcript: str | None = None,
        input_modality: str = "text",
    ) -> dict:
        """
        Use the orchestrator CrewAI agent to analyze user request and produce
        a structured plan. Accepts text, image, and audio inputs.
        Returns dict with 'plan' and 'graph'.
        """
        # Build multimodal context
        context_parts = [f"User request: {user_message}"]
        if image_analysis:
            context_parts.append(f"[Image analysis: {image_analysis}]")
        if audio_transcript and audio_transcript != user_message:
            context_parts.append(f"[Audio transcript: {audio_transcript}]")

        modality_note = {
            "text": "The user typed this request.",
            "voice": "The user spoke this request via voice input.",
            "image": "The user provided an image along with their request. The image has been analyzed and the analysis is included above.",
        }.get(input_modality, "")

        context = "\n\n".join(context_parts)

        agent_descriptions = "\n".join(
            [
                f"- {aid}: {meta['role']} — capabilities: {', '.join(meta['capabilities'])}"
                for aid, meta in AGENT_METADATA.items()
            ]
        )

        planning_task = Task(
            description=f"""Analyze the following user request and create a structured execution plan.

{context}

Input modality: {input_modality}
{modality_note}

Available agents:
{agent_descriptions}

Rules:
- These are research agents. Set requires_approval=false for all steps since they only read/generate information.
- If steps are independent, leave depends_on empty so they can run in parallel.
- If a step needs output from another step, add that step's ID to depends_on.
- Always prefer parallel execution when possible. For example, arxiv search and wikipedia search can run in parallel, then a proposal step can depend on both.
- Use step IDs like "step_1", "step_2", etc.
- agent_id must be one of: arxiv, proposal, wikipedia
- If image analysis is provided, use that content to inform search queries and proposal topics.
- If audio was transcribed, treat the transcript as the primary user intent.""",
            expected_output="A structured JSON plan with a summary and a list of steps",
            agent=self.orchestrator_agent,
            output_json=TaskPlan,
        )

        crew = Crew(
            agents=[self.orchestrator_agent],
            tasks=[planning_task],
            process=Process.sequential,
            verbose=True,
        )

        result = crew.kickoff()
        plan = result.json_dict

        task_id = str(uuid.uuid4())[:8]
        plan["id"] = task_id
        plan["user_message"] = user_message

        graph = self._build_graph(plan, user_message, input_modality)
        graph["taskId"] = task_id

        return {"plan": plan, "graph": graph}

    def assemble_crew(self, plan: dict) -> Crew:
        """Assemble a hierarchical CrewAI Crew with the orchestrator as manager."""
        crew_tasks = []
        for step in plan["steps"]:
            agent = self.worker_agents[step["agent_id"]]
            crew_task = build_crew_task(step, agent)
            crew_tasks.append(crew_task)

        crew = Crew(
            agents=list(self.worker_agents.values()),
            tasks=crew_tasks,
            manager_agent=self.orchestrator_agent,
            process=Process.hierarchical,
            verbose=True,
        )

        return crew

    def _build_graph(
        self, plan: dict, user_message: str, input_modality: str = "text"
    ) -> dict:
        """Build the execution graph state from the plan."""
        nodes = []
        edges = []
        nodes.append(
            {
                "id": "input",
                "type": "input",
                "data": {
                    "label": user_message[:60]
                    + ("..." if len(user_message) > 60 else ""),
                    "type": "input",
                    "status": "completed",
                    "inputModality": input_modality,
                },
                "position": {"x": 0, "y": 0},
            }
        )

        nodes.append(
            {
                "id": "orchestrator",
                "type": "orchestrator",
                "data": {
                    "label": f"Plan: {len(plan['steps'])} tasks",
                    "type": "orchestrator",
                    "status": "completed",
                },
                "position": {"x": 0, "y": 0},
            }
        )
        edges.append(
            {
                "id": "e-input-orch",
                "source": "input",
                "target": "orchestrator",
                "data": {"status": "completed"},
            }
        )

        output_sources = []

        for step in plan["steps"]:
            step_id = step["id"]
            agent_id = step["agent_id"]

            nodes.append(
                {
                    "id": step_id,
                    "type": "agent",
                    "data": {
                        "label": step["description"][:40],
                        "type": "agent",
                        "status": "pending",
                        "agentId": agent_id,
                        "agentColor": AGENT_COLORS.get(agent_id, "#6B7280"),
                        "agentIcon": AGENT_ICONS.get(agent_id, "Bot"),
                    },
                    "position": {"x": 0, "y": 0},
                }
            )

            if step.get("depends_on"):
                for dep_id in step["depends_on"]:
                    source = (
                        f"checkpoint_{dep_id}"
                        if any(
                            s["id"] == dep_id and s.get("requires_approval")
                            for s in plan["steps"]
                        )
                        else dep_id
                    )
                    edges.append(
                        {
                            "id": f"e-{dep_id}-{step_id}",
                            "source": source,
                            "target": step_id,
                            "data": {"status": "pending"},
                        }
                    )
            else:
                edges.append(
                    {
                        "id": f"e-orch-{step_id}",
                        "source": "orchestrator",
                        "target": step_id,
                        "data": {"status": "pending"},
                    }
                )

            if step.get("requires_approval"):
                cp_id = f"checkpoint_{step_id}"
                nodes.append(
                    {
                        "id": cp_id,
                        "type": "checkpoint",
                        "data": {
                            "label": f"Review: {step['action']}",
                            "type": "checkpoint",
                            "status": "pending",
                        },
                        "position": {"x": 0, "y": 0},
                    }
                )
                edges.append(
                    {
                        "id": f"e-{step_id}-{cp_id}",
                        "source": step_id,
                        "target": cp_id,
                        "data": {"status": "pending"},
                    }
                )
                output_sources.append(cp_id)
            else:
                output_sources.append(step_id)

        nodes.append(
            {
                "id": "output",
                "type": "output",
                "data": {
                    "label": "Result",
                    "type": "output",
                    "status": "pending",
                },
                "position": {"x": 0, "y": 0},
            }
        )
        for src in output_sources:
            edges.append(
                {
                    "id": f"e-{src}-output",
                    "source": src,
                    "target": "output",
                    "data": {"status": "pending"},
                }
            )

        return {"taskId": "", "nodes": nodes, "edges": edges, "status": "planning"}
