from crewai import Task


def build_crew_task(
    step: dict, agent, context_from_previous: str = None
) -> Task:
    """Builds a CrewAI Task from an AgentFlow plan step."""
    description = step["description"]
    if context_from_previous:
        description += f"\n\nContext from previous step: {context_from_previous}"

    return Task(
        description=description,
        expected_output=f"Complete the following and provide a detailed result: {step['description']}",
        agent=agent,
    )
