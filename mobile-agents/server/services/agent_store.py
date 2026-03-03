"""
JSON-file-backed agent CRUD store.
Loads from agents_config.json, falls back to AGENT_METADATA defaults.
"""

import json
from pathlib import Path
from crew.agents import AGENT_METADATA

AGENTS_FILE = Path(__file__).parent.parent / "agents_config.json"

_agents_registry: dict[str, dict] = {}


def load_agents() -> None:
    """Load agents from JSON file, falling back to AGENT_METADATA defaults."""
    global _agents_registry
    if AGENTS_FILE.exists():
        try:
            data = json.loads(AGENTS_FILE.read_text())
            _agents_registry = {a["id"]: a for a in data}
            return
        except Exception:
            pass
    # Fall back to built-in defaults
    _agents_registry = {k: dict(v) for k, v in AGENT_METADATA.items()}
    _save()


def _save() -> None:
    """Persist registry to JSON file."""
    AGENTS_FILE.write_text(json.dumps(list(_agents_registry.values()), indent=2))


def get_agents() -> list[dict]:
    return list(_agents_registry.values())


def get_agent(agent_id: str) -> dict | None:
    return _agents_registry.get(agent_id)


def create_agent(data: dict) -> dict:
    _agents_registry[data["id"]] = data
    _save()
    return data


def update_agent(agent_id: str, data: dict) -> dict | None:
    if agent_id not in _agents_registry:
        return None
    _agents_registry[agent_id] = {**_agents_registry[agent_id], **data, "id": agent_id}
    _save()
    return _agents_registry[agent_id]


def delete_agent(agent_id: str) -> bool:
    if agent_id not in _agents_registry:
        return False
    del _agents_registry[agent_id]
    _save()
    return True
