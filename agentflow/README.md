# MobileAgents

An open-source, mobile-first, multimodal agent manager. Bring your own AI agents and control them from your phone through text, voice, or image input — an LLM orchestrator decomposes requests into a dependency-aware execution plan, and a live DAG graph streams agent progress in real time.

The platform ships with four demo agents (ArXiv, Proposal, Wikipedia, Slack), but the architecture is agent-agnostic — register any agent with its role, tools, and metadata and the platform handles orchestration, multimodal interaction, and lifecycle management.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Mobile-First React Client (Konsta iOS UI)              │
│  ┌───────────┐  ┌───────────┐  ┌────────────────────┐  │
│  │  ChatView  │  │ AgentList │  │  ExecutionView     │  │
│  │ (text/     │  │ (manage/  │  │  ┌──────────────┐  │  │
│  │  voice/    │  │  browse   │  │  │ ExecutionGraph│  │  │
│  │  image)    │  │  agents)  │  │  │ (ReactFlow)  │  │  │
│  └─────┬──────┘  └───────────┘  │  └──────────────┘  │  │
│        │                        │  ┌──────────────┐  │  │
│        │  Zustand Store         │  │ExecutionStream│  │  │
│        │                        │  └──────────────┘  │  │
│        │                        └────────────────────┘  │
└────────┼────────────────────────────────────────────────┘
         │  POST /api/chat         POST /api/execute (SSE)
         ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI Server                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  /chat    │  │  /execute    │  │  /approve         │  │
│  └────┬─────┘  └──────┬───────┘  └──────────────────┘  │
│       │               │                                  │
│  ┌────▼──────────┐  ┌─▼──────────────────────────────┐  │
│  │  Orchestrator  │  │  Execution Tracker             │  │
│  │  (CrewAI)      │  │  (dependency-aware streaming)  │  │
│  └────┬──────────┘  └─┬──────────────────────────────┘  │
│       │               │                                  │
│  ┌────▼───────────────▼──────────────────────────────┐  │
│  │  Agent Tool Registry (pluggable per agent)        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Services: Image Analyzer (GPT-4.1) · Audio (Whisper)   │
└─────────────────────────────────────────────────────────┘
```

## How It Works

1. **Multimodal input** — the user types, records voice, or captures an image on mobile.
2. **Input processing** — images are analyzed with GPT-4.1 vision; audio is transcribed with Whisper. All modalities are unified into a single planning prompt.
3. **Orchestrator plans** — a CrewAI orchestrator agent selects from the registered agent pool and produces a dependency graph of tasks.
4. **Plan review** — the client renders a task plan card and interactive DAG for the user to inspect and approve.
5. **Streaming execution** — the server executes steps respecting dependency order, streaming SSE events that animate nodes and edges in real time.
6. **Synthesis** — after all agents complete, GPT-4.1 synthesizes results into a coherent final response.

## Default Agents (Extensible)

The platform ships with an orchestrator and four demo agents. Any agent can be added at runtime by defining its role, tools, and metadata — no code changes required.

| Agent | Tools | Description |
|-------|-------|-------------|
| **Orchestrator** | `planning`, `delegation`, `synthesis` | Plans and coordinates all agent tasks. Always active — cannot be disabled. Has an editable constitution for user-defined guidelines. |
| **ArXiv Agent** | `arxiv_search`, `arxiv_summarize` | Searches and summarizes academic papers from arXiv |
| **Proposal Agent** | `generate_proposal`, `outline_methodology` | Generates structured research proposals and methodology outlines |
| **Wikipedia Agent** | `wiki_search`, `wiki_summarize` | Searches and summarizes Wikipedia articles for background research |
| **Slack Agent** | `slack_send_message` | Sends messages to Slack channels. Requires approval before execution. |

## Tech Stack

**Client** — React 19, TypeScript, Vite, Tailwind CSS, Zustand, ReactFlow ([@xyflow/react](https://reactflow.dev)), Dagre, Konsta UI (iOS-style mobile components), Lucide icons, react-markdown

**Server** — FastAPI, CrewAI, OpenAI SDK (GPT-4.1 + Whisper), Pydantic, Uvicorn

## Project Structure

```
agentflow/
├── package.json              # Monorepo scripts (concurrently)
├── client/
│   ├── src/
│   │   ├── App.tsx           # Root — KonstaApp with iOS theme
│   │   ├── main.tsx          # Entry point
│   │   ├── index.css         # Tailwind + custom animations + focus-visible
│   │   ├── state/
│   │   │   └── store.ts      # Zustand store (state + API + localStorage persistence)
│   │   ├── types/            # TypeScript interfaces
│   │   │   ├── agents.ts     #   Agent metadata
│   │   │   ├── messages.ts   #   Chat messages
│   │   │   ├── tasks.ts      #   Task plans and steps
│   │   │   └── graph.ts      #   Execution graph nodes/edges
│   │   ├── i18n/             # Internationalization (4 languages)
│   │   │   ├── en.ts         #   English
│   │   │   ├── zh.ts         #   Chinese (Simplified)
│   │   │   ├── ar.ts         #   Arabic (with RTL support)
│   │   │   └── bg.ts         #   Bulgarian
│   │   └── components/
│   │       ├── Layout/       # Shell with bottom tab navigation
│   │       ├── Chat/         # Chat interface + image preview + TTS
│   │       ├── Agents/       # Agent list + detail sheet + toggle + constitution editor
│   │       ├── TaskPlan/     # Plan card + approval controls
│   │       ├── Graph/        # ReactFlow DAG (nodes, edges, legend)
│   │       ├── Execution/    # History view + step stream
│   │       ├── Camera/       # Image capture (base64) + privacy consent
│   │       ├── Voice/        # Audio recording (MediaRecorder) + privacy consent
│   │       ├── Settings/     # Transparency, input mode, theme, language, clear history
│   │       ├── Guide/        # In-app help and feature walkthrough
│   │       └── Privacy/      # Reusable privacy consent dialog
│   └── vite.config.ts        # Dev proxy: /api → localhost:8000
├── server/
│   ├── main.py               # FastAPI app + CORS + routers + startup
│   ├── config.py             # Pydantic settings (from .env)
│   ├── requirements.txt
│   ├── routers/
│   │   ├── chat.py           # POST /api/chat — plan from multimodal input
│   │   ├── execute.py        # POST /api/execute — SSE streaming
│   │   ├── approve.py        # POST/GET /api/approve/{step_id}
│   │   └── agents.py         # CRUD /api/agents — agent management
│   ├── crew/
│   │   ├── orchestrator.py   # CrewAI orchestrator — planning + graph building
│   │   ├── agents.py         # Agent definitions + metadata registry
│   │   ├── tasks.py          # CrewAI task definitions
│   │   └── tools.py          # Tool implementations (pluggable per agent)
│   ├── models/
│   │   ├── messages.py       # ChatRequest / ChatResponse
│   │   ├── tasks.py          # TaskPlan / PlanStep
│   │   └── graph.py          # GraphNode / GraphEdge / ExecutionGraphState
│   ├── services/
│   │   ├── execution_tracker.py  # Step execution + dependency resolution
│   │   ├── image_analyzer.py     # GPT-4.1 vision
│   │   ├── audio_transcriber.py  # Whisper transcription
│   │   └── agent_store.py        # JSON-file-backed agent CRUD
│   └── tests/
│       └── test_slack.py         # Slack agent unit + integration tests
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chat` | Send a multimodal message (text/image/audio) and receive a task plan + execution graph |
| `POST` | `/api/execute` | Execute an approved plan; returns an SSE stream of graph updates |
| `POST` | `/api/approve/{step_id}` | Approve or reject a checkpoint step |
| `GET`  | `/api/approve/{step_id}` | Check approval status for a step |
| `GET`  | `/api/agents` | List all registered agents with metadata |
| `POST` | `/api/agents` | Create a new agent |
| `PUT`  | `/api/agents/{id}` | Update an existing agent |
| `DELETE`| `/api/agents/{id}` | Delete an agent |
| `GET`  | `/api/health` | Health check |

### SSE Event Types (from `/api/execute`)

| Event | Payload | Description |
|-------|---------|-------------|
| `graph_init` | Full graph state | Initial graph with all nodes/edges |
| `node_status` | `nodeId`, `status`, `result?`, `duration?` | A node started, completed, or failed |
| `edge_status` | `edgeId`, `status` | An edge became active or completed |
| `checkpoint_reached` | `nodeId` | An approval gate was reached |
| `execution_complete` | `summary` | All steps done, includes synthesized result |
| `execution_failed` | `error` | Execution failed |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Setup

```bash
# Clone the repository
git clone git@github.com:kostadindev/agentflow.git
cd agentflow

# Install client dependencies
npm run install:client

# Install server dependencies
npm run install:server
```

Create `server/.env`:
```
OPENAI_API_KEY=sk-...
SLACK_BOT_TOKEN=xoxb-...          # Optional — required only for the Slack agent
CREWAI_TRACING_ENABLED=false
```

### Run

```bash
# Start both client and server concurrently
npm run dev
```

Or separately:
```bash
# Terminal 1 — server (port 8000)
npm run dev:server

# Terminal 2 — client (port 5173)
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser (or on mobile via local network).

## UI Tabs

- **Chat** — Multimodal conversation interface. Type, speak, or photograph your request. The orchestrator returns a task plan that renders inline as a card with an interactive execution graph.
- **Agents** — Browse all agents. Tap any agent to view its goal, tools, and full system prompt. The orchestrator appears first (always active, with an editable constitution). Worker agents have enable/disable toggles.
- **History** — Full-screen execution graph and a step-by-step result stream for the most recent run.
- **Guide** — In-app help with a walkthrough of input modes, transparency levels, agents, and execution graphs.

## Features

### Bring Your Own Agents

The platform is agent-agnostic. The orchestrator selects agents from a dynamic registry based on the user's request. Adding a new agent means registering its role, tools, and metadata via the API or the Agents tab — no changes to the orchestration or UI layer. Users can enable, disable, configure, and delete agents at runtime.

### Multimodal Input and Output

| Modality | Input | Output |
|----------|-------|--------|
| **Text** | Typed message | Markdown response, task plan card, execution graph |
| **Voice** | Recorded audio (MediaRecorder → WebM → base64 → Whisper) | Transcribed text shown in chat, then planned and executed |
| **Image** | Camera/gallery capture (base64 → GPT-4.1 vision) | Image description used as context for agent planning |
| **TTS** | — | Speaker icon on every assistant message reads it aloud via Web Speech API |

An input mode selector in settings lets users switch between **Multimodal** (all inputs), **Text + Images**, and **Voice Only**.

### Transparency Configuration (3 Modes)

A settings gear in the chat navbar opens a bottom sheet where users switch between three transparency levels:

| Mode | What the user sees |
|------|-------------------|
| **Black Box** | Query goes in, final answer comes out. No plan, no graph, no approval step — agents auto-execute. |
| **Plan Preview** | The orchestrator's task plan is shown as a card. User approves with one tap. A spinner shows during execution (no live graph). |
| **Full Transparency** | Plan card + live DAG graph with animated node/edge status, step-by-step results streaming in real time, checkpoint approval gates. |

### Agent Inspector and Configuration

The Agents tab displays all agents with a detail sheet for each:

- **Orchestrator** — Shown first under its own section header, always active (no toggle). Tapping it opens a scrollable detail sheet showing its goal, capabilities, full system prompt, and an **editable constitution** — free-text guidelines that are appended to the orchestrator's system prompt at planning time. Changes are persisted to the server.
- **Worker agents** — Listed below with an enable/disable toggle. Disabled agents are excluded from the orchestrator's planning prompt. Tapping opens a read-only detail sheet showing the agent's goal, tools, and system prompt.
- **Persistence** — Agent configs (including constitution and enabled state) are stored in `agents_config.json` on the server; the orchestrator dynamically reads from this registry for every plan.

### Internationalization (i18n)

The UI supports 4 languages with a language switcher in settings:

- English
- Chinese (Simplified)
- Arabic (with full RTL layout support)
- Bulgarian

### Theme Support

Three theme options available in settings: **Dark**, **Light**, and **Auto** (follows system preference).

### Conversation Persistence

Chat messages, the current plan, the graph state, and all settings are persisted to localStorage via a Zustand subscriber. On page load, the store initializes from persisted state. A "Clear History" button in settings starts a new conversation.

### Accessibility

- `aria-label` on all icon-only buttons (send, settings, voice, camera, image remove, graph expand/collapse, TTS, delete agent).
- `aria-live="polite"` on the graph status header so screen readers announce state changes.
- `focus-visible` ring styles (2px solid brand purple, 2px offset) on buttons, inputs, textareas, and links for keyboard navigation.

### Privacy Consent

The first time a user taps the microphone or camera button, a dialog explains that data is sent to OpenAI for processing. Consent is stored in localStorage and only asked once.

## Key Design Decisions

- **Agent-agnostic orchestration** — The orchestrator selects agents from a registry based on the request. Adding a new agent means registering its role, tools, and metadata — no changes to the orchestration or UI layer.
- **Mobile-first, multimodal** — Konsta UI provides native iOS feel. Voice and camera inputs are first-class citizens, not afterthoughts — critical for on-the-go mobile use.
- **Two-phase execution** — Planning uses CrewAI's LLM-based orchestrator; execution calls tools directly with dependency tracking for predictable, streamable results.
- **SSE streaming** — Real-time graph updates over Server-Sent Events keep the mobile UI responsive without WebSocket complexity.
- **Human-in-the-loop** — Checkpoint nodes in the DAG let users approve critical steps before execution continues, balancing automation with user control.
- **Stateless server** — No database for execution state. Agent configs persist to a JSON file; chat history persists in the browser via localStorage.

---

## Appendix: System Prompts and Specifications

This section documents every LLM prompt and data schema used in the system — useful as a reference for papers or reports describing the implementation.

### A.1 Orchestrator System Prompt (Backstory)

Injected as the CrewAI agent's `backstory`. At runtime, the list of enabled agents and the user-editable constitution are appended dynamically.

```
You are a concise research librarian orchestrating an academic team.
Keep all outputs brief — this is a mobile app with limited screen space.

Break requests into the fewest steps needed. Prefer parallel execution.
Use uncertainty-aware language when appropriate.

Produce structured JSON plans. Do not add unnecessary steps.

Available agents:
- arxiv: ArXiv Research Analyst — capabilities: arxiv_search, arxiv_summarize
- proposal: Research Proposal Strategist — capabilities: generate_proposal, outline_methodology
- wikipedia: Background Research Specialist — capabilities: wiki_search, wiki_summarize
- slack: Slack Messenger — capabilities: slack_send_message [requires_approval]

Constitution (user-defined guidelines):
<user-editable free text appended here>
```

### A.2 Planning Task Prompt

Sent to the orchestrator agent via CrewAI for every user request. Variables are interpolated at runtime.

```
Analyze the following user request and create a structured execution plan.

User request: {user_message}

[Image analysis: {image_analysis}]       ← only if image provided
[Audio transcript: {audio_transcript}]   ← only if audio provided

Input modality: {input_modality}
{modality_note}

Available agents:
{agent_descriptions}

Rules:
- Match the user's request to the most appropriate agent(s). Agents are NOT
  limited to research — some send messages, perform actions, etc.
- For agents marked [requires_approval], set requires_approval=true on that step.
  For all other agents, set requires_approval=false.
- Only return an empty steps list if the request truly cannot be handled by ANY
  available agent (e.g. "hello", pure casual chat with no actionable intent).
- If steps are independent, leave depends_on empty so they can run in parallel.
- If a step needs output from another step, add that step's ID to depends_on.
- Always prefer parallel execution when possible.
- Use step IDs like "step_1", "step_2", etc.
- agent_id must be one of: {valid_agent_ids}
- Use exact param names from the tool signatures. For slack_send_message use
  params: {"channel": "<channel-or-username>", "text": "<message>"}
- If image analysis is provided, use that content to inform search queries
  and proposal topics.
- If audio was transcribed, treat the transcript as the primary user intent.
```

**Expected output schema** (`TaskPlan`):
```json
{
  "summary": "Brief plan description",
  "steps": [
    {
      "id": "step_1",
      "agent_id": "arxiv",
      "action": "arxiv_search",
      "description": "Search for papers on ...",
      "params": { "query": "..." },
      "requires_approval": false,
      "depends_on": []
    }
  ]
}
```

### A.3 Synthesis System Prompt

Used after all agent steps complete to produce the final user-facing response.

```
You are a research orchestrator synthesizing agent results for a MOBILE
interface. Responses are read on small screens.

Guidelines:
- Be concise: aim for 150-300 words max
- Lead with the key finding or answer in 1-2 sentences
- Use short bullet points, not long paragraphs
- Use markdown: **bold** for emphasis, short headings, compact lists
- Keep relevant URLs but don't list more than 3-5
- Do NOT mention the agents or internal execution process
- Use uncertainty-aware language: 'based on available results' rather
  than absolute claims
- End with a one-line disclaimer: '*Results may not be exhaustive —
  verify for critical decisions.*'
```

**User message to synthesis LLM:**
```
**User request:** {user_message}

**Plan summary:** {plan_summary}

**Agent results:**

### Agent step: {step_description}
{step_result}

### Agent step: {step_description}
{step_result}
...
```

### A.4 Image Analysis Prompt

Sent to GPT-4.1 vision when the user provides an image.

```
Analyze this image in the context of a research assistant. Describe what
you see and what research tasks might be relevant (e.g., paper search,
literature review, proposal generation). Be concise.
```

- **Model:** GPT-4.1 (vision)
- **Max tokens:** 300
- **Input:** base64-encoded JPEG image

### A.5 Audio Transcription

- **Model:** Whisper (`whisper-1`)
- **Input:** base64-encoded WebM audio → decoded to temporary `.webm` file
- **Output:** Plain text transcript

### A.6 Agent Backstories

Each worker agent has a backstory injected as its CrewAI `backstory` parameter:

**ArXiv Agent:**
```
You are an expert research analyst who monitors arXiv daily. You can search
for papers by topic, summarize their key findings, and identify trends across
recent publications. You excel at distilling complex papers into clear,
actionable summaries.
```

**Proposal Agent:**
```
You are a seasoned research strategist who has helped write dozens of
successful grant proposals and research plans. You understand how to identify
research gaps, formulate compelling research questions, and outline rigorous
methodologies. You synthesize information from literature into coherent
proposals.
```

**Wikipedia Agent:**
```
You are a thorough background researcher who uses Wikipedia to gather
foundational knowledge on topics. You find relevant articles, extract key
concepts and definitions, and provide well-structured overviews that help
contextualize research work.
```

**Slack Agent:**
```
You are a communication specialist who sends messages to Slack channels on
behalf of the team. You craft clear, well-formatted messages and deliver
them to the correct channels. You always confirm which channel to post to
and summarize what was sent.
```

### A.7 Data Schemas

#### ChatRequest (client → server)
```json
{
  "message": "string",
  "image_base64": "string | null",
  "audio_base64": "string | null",
  "input_modality": "text | voice | image"
}
```

#### ChatResponse (server → client)
```json
{
  "message": "string",
  "plan": "TaskPlan | null",
  "graph": "ExecutionGraphState | null",
  "image_base64": "string | null"
}
```

#### TaskPlan
```json
{
  "id": "string",
  "summary": "string",
  "steps": ["TaskStep"],
  "status": "proposed | executing | completed",
  "created_at": "ISO 8601 datetime"
}
```

#### TaskStep
```json
{
  "id": "step_1",
  "agent_id": "arxiv | proposal | wikipedia | slack | ...",
  "action": "tool function name",
  "description": "human-readable step description",
  "params": { "key": "value" },
  "status": "pending | running | completed | failed",
  "result": "string | null",
  "requires_approval": false,
  "depends_on": ["step_id", "..."]
}
```

#### ExecutionGraphState
```json
{
  "task_id": "string",
  "nodes": ["GraphNode"],
  "edges": ["GraphEdge"],
  "current_node_id": "string | null",
  "status": "planning | executing | completed | failed"
}
```

#### GraphNode
```json
{
  "id": "string",
  "type": "input | orchestrator | agent | checkpoint | output",
  "data": {
    "label": "string",
    "type": "input | orchestrator | agent | checkpoint | output",
    "status": "pending | running | completed | failed | awaiting_approval | approved",
    "agent_id": "string | null",
    "agent_color": "#hex | null",
    "agent_icon": "LucideIconName | null",
    "result": "string | null",
    "duration": "milliseconds | null",
    "input_modality": "text | voice | image | null"
  },
  "position": { "x": 0, "y": 0 }
}
```

#### GraphEdge
```json
{
  "id": "e-source-target",
  "source": "node_id",
  "target": "node_id",
  "data": {
    "status": "pending | active | completed",
    "data_preview": "string | null"
  }
}
```

#### SSE Events (server → client, streamed from `/api/execute`)
```
event: graph_init
data: { "type": "graph_init", "graph": ExecutionGraphState }

event: node_status
data: { "type": "node_status", "nodeId": "step_1", "status": "running" }
data: { "type": "node_status", "nodeId": "step_1", "status": "completed", "result": "...", "duration": 1234 }

event: edge_status
data: { "type": "edge_status", "edgeId": "e-orch-step_1", "status": "active" }
data: { "type": "edge_status", "edgeId": "e-orch-step_1", "status": "completed" }

event: checkpoint_reached
data: { "type": "checkpoint_reached", "nodeId": "checkpoint_step_1", "stepId": "step_1" }

event: execution_complete
data: { "type": "execution_complete", "graph": ExecutionGraphState, "summary": "Synthesized response..." }

event: execution_failed
data: { "type": "execution_failed", "error": "Error message" }
```

### A.8 Agent Registry Schema (`agents_config.json`)

Each agent in the persistent registry follows this schema:

```json
{
  "id": "unique_string",
  "name": "Display Name",
  "icon": "LucideIconName",
  "description": "Short description",
  "role": "CrewAI role string",
  "goal": "CrewAI goal string",
  "backstory": "Full system prompt / backstory text",
  "capabilities": ["tool_name_1", "tool_name_2"],
  "enabled": true,
  "requiresApproval": false,
  "color": "#hex",
  "isOrchestrator": false,
  "constitution": ""
}
```

The `isOrchestrator` flag (only `true` for the orchestrator) prevents it from being disabled or deleted. The `constitution` field is only used by the orchestrator and is appended to its backstory at planning time. The `requiresApproval` flag gates execution behind a checkpoint node in the DAG.

### A.9 Modality Notes (injected into planning prompt)

| `input_modality` | Note injected into planning context |
|-------------------|-------------------------------------|
| `text` | "The user typed this request." |
| `voice` | "The user spoke this request via voice input." |
| `image` | "The user provided an image along with their request. The image has been analyzed and the analysis is included above." |
