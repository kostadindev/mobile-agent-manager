from crewai import Agent, LLM
from .tools import AGENT_TOOLS

AGENT_BACKSTORIES = {
    "arxiv": (
        "You are an expert research analyst who monitors arXiv daily. "
        "You can search for papers by topic, summarize their key findings, "
        "and identify trends across recent publications. You excel at "
        "distilling complex papers into clear, actionable summaries."
    ),
    "proposal": (
        "You are a seasoned research strategist who has helped write "
        "dozens of successful grant proposals and research plans. You "
        "understand how to identify research gaps, formulate compelling "
        "research questions, and outline rigorous methodologies. You "
        "synthesize information from literature into coherent proposals."
    ),
    "wikipedia": (
        "You are a thorough background researcher who uses Wikipedia "
        "to gather foundational knowledge on topics. You find relevant "
        "articles, extract key concepts and definitions, and provide "
        "well-structured overviews that help contextualize research work."
    ),
}


def create_orchestrator_agent(llm: LLM) -> Agent:
    """Creates the orchestrator CrewAI agent that plans and delegates."""
    from services.agent_store import get_agents

    agents = get_agents()
    agent_descriptions = "\n".join(
        f"- {a['id']}: {a['role']} — capabilities: {', '.join(a.get('capabilities', []))}"
        for a in agents
        if a.get("enabled", True)
    )

    return Agent(
        role="Task Orchestrator",
        goal=(
            "Analyze user requests and create structured execution plans that "
            "delegate work to specialized research agents"
        ),
        backstory=(
            "You are a concise research librarian orchestrating an academic team. "
            "Keep all outputs brief — this is a mobile app with limited screen space.\n\n"
            "Break requests into the fewest steps needed. Prefer parallel execution. "
            "Use uncertainty-aware language when appropriate.\n\n"
            f"Available agents:\n{agent_descriptions}\n\n"
            "Produce structured JSON plans. Do not add unnecessary steps."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=True,
    )


def create_agents(llm: LLM) -> dict[str, Agent]:
    """Returns all available CrewAI agents, keyed by agent_id."""

    agents = {
        "arxiv": Agent(
            role="ArXiv Research Analyst",
            goal="Search and summarize recent academic papers from arXiv",
            backstory=AGENT_BACKSTORIES["arxiv"],
            llm=llm,
            verbose=True,
            allow_delegation=False,
            tools=AGENT_TOOLS["arxiv"],
        ),
        "proposal": Agent(
            role="Research Proposal Strategist",
            goal="Generate structured research proposals and methodology outlines",
            backstory=AGENT_BACKSTORIES["proposal"],
            llm=llm,
            verbose=True,
            allow_delegation=False,
            tools=AGENT_TOOLS["proposal"],
        ),
        "wikipedia": Agent(
            role="Background Research Specialist",
            goal="Look up and summarize background information from Wikipedia",
            backstory=AGENT_BACKSTORIES["wikipedia"],
            llm=llm,
            verbose=True,
            allow_delegation=False,
            tools=AGENT_TOOLS["wikipedia"],
        ),
    }

    return agents


# Agent metadata for frontend display
AGENT_METADATA = {
    "arxiv": {
        "id": "arxiv",
        "name": "ArXiv Agent",
        "icon": "BookOpen",
        "description": "Search and summarize recent arXiv papers",
        "role": "ArXiv Research Analyst",
        "goal": "Search and summarize recent academic papers from arXiv",
        "backstory": AGENT_BACKSTORIES["arxiv"],
        "capabilities": ["arxiv_search", "arxiv_summarize"],
        "enabled": True,
        "requiresApproval": False,
        "color": "#A855F7",
    },
    "proposal": {
        "id": "proposal",
        "name": "Proposal Agent",
        "icon": "Lightbulb",
        "description": "Generate research proposals and methodology outlines",
        "role": "Research Proposal Strategist",
        "goal": "Generate structured research proposals and methodology outlines",
        "backstory": AGENT_BACKSTORIES["proposal"],
        "capabilities": ["generate_proposal", "outline_methodology"],
        "enabled": True,
        "requiresApproval": False,
        "color": "#F97316",
    },
    "wikipedia": {
        "id": "wikipedia",
        "name": "Wikipedia Agent",
        "icon": "Globe",
        "description": "Look up and summarize Wikipedia articles",
        "role": "Background Research Specialist",
        "goal": "Look up and summarize background information from Wikipedia",
        "backstory": AGENT_BACKSTORIES["wikipedia"],
        "capabilities": ["wiki_search", "wiki_summarize"],
        "enabled": True,
        "requiresApproval": False,
        "color": "#06B6D4",
    },
}
