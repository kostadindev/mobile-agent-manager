# AgentFlow

A multimodal, multi-agent research assistant with real-time execution visualization. Users interact via text, voice, or image — an orchestrator plans a sequence of agent tasks, and a live DAG graph streams execution progress back to the client.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React Client (Vite + TypeScript)                       │
│  ┌───────────┐  ┌───────────┐  ┌────────────────────┐  │
│  │  ChatView  │  │ AgentList │  │  ExecutionView     │  │
│  │ (text/     │  │           │  │  ┌──────────────┐  │  │
│  │  voice/    │  │           │  │  │ ExecutionGraph│  │  │
│  │  image)    │  │           │  │  │ (ReactFlow)  │  │  │
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
│  │  Tools: ArXiv API · Wikipedia API · OpenAI LLM    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Services: Image Analyzer (GPT-4.1) · Audio (Whisper)   │
└─────────────────────────────────────────────────────────┘
```

## How It Works

1. **User sends a request** — text message, voice recording, or image — via the chat interface.
2. **Server processes input** — images are analyzed with GPT-4.1 vision, audio is transcribed with Whisper.
3. **Orchestrator plans** — a CrewAI orchestrator agent breaks the request into a dependency graph of agent tasks.
4. **Client shows the plan** — a task plan card and DAG graph are rendered for the user to review.
5. **User approves execution** — the plan is sent to `/api/execute`.
6. **Streaming execution** — the server executes steps respecting dependency order, streaming SSE events that update nodes and edges in real time.
7. **Synthesis** — after all steps complete, GPT-4.1 synthesizes results into a coherent final response.

## Agents

| Agent | Tools | Description |
|-------|-------|-------------|
| **ArXiv Agent** | `arxiv_search`, `arxiv_summarize` | Searches and summarizes academic papers from arXiv |
| **Proposal Agent** | `generate_proposal`, `outline_methodology` | Generates structured research proposals and methodology outlines |
| **Wikipedia Agent** | `wiki_search`, `wiki_summarize` | Searches and summarizes Wikipedia articles for background research |

## Tech Stack

**Client** — React 19, TypeScript, Vite, Tailwind CSS, Zustand, ReactFlow ([@xyflow/react](https://reactflow.dev)), Dagre, Konsta UI (iOS-style), Lucide icons, react-markdown

**Server** — FastAPI, CrewAI, OpenAI SDK (GPT-4.1 + Whisper), Pydantic, Uvicorn

## Project Structure

```
agentflow/
├── package.json              # Monorepo scripts (concurrently)
├── client/
│   ├── src/
│   │   ├── App.tsx           # Root — KonstaApp with dark theme
│   │   ├── main.tsx          # Entry point
│   │   ├── index.css         # Tailwind + custom animations
│   │   ├── state/
│   │   │   └── store.ts      # Zustand store (state + API calls)
│   │   ├── types/            # TypeScript interfaces
│   │   │   ├── agents.ts     #   Agent metadata
│   │   │   ├── messages.ts   #   Chat messages
│   │   │   ├── tasks.ts      #   Task plans and steps
│   │   │   └── graph.ts      #   Execution graph nodes/edges
│   │   └── components/
│   │       ├── Layout/       # Shell with tab navigation
│   │       ├── Chat/         # Chat interface + image preview
│   │       ├── Agents/       # Agent list view
│   │       ├── TaskPlan/     # Plan card + approval controls
│   │       ├── Graph/        # ReactFlow DAG (nodes, edges, legend)
│   │       ├── Execution/    # History view + step stream
│   │       ├── Camera/       # Image capture (base64)
│   │       └── Voice/        # Audio recording (MediaRecorder)
│   └── vite.config.ts        # Dev proxy: /api → localhost:8000
├── server/
│   ├── main.py               # FastAPI app + CORS + routers
│   ├── config.py             # Pydantic settings (from .env)
│   ├── requirements.txt
│   ├── routers/
│   │   ├── chat.py           # POST /api/chat — plan from input
│   │   ├── execute.py        # POST /api/execute — SSE streaming
│   │   └── approve.py        # POST/GET /api/approve/{step_id}
│   ├── crew/
│   │   ├── orchestrator.py   # CrewAI orchestrator — planning + graph
│   │   ├── agents.py         # Agent definitions + metadata
│   │   ├── tasks.py          # CrewAI task definitions
│   │   └── tools.py          # Tool implementations (arXiv, wiki, proposal)
│   ├── models/
│   │   ├── messages.py       # ChatRequest / ChatResponse
│   │   ├── tasks.py          # TaskPlan / PlanStep
│   │   └── graph.py          # GraphNode / GraphEdge / ExecutionGraphState
│   └── services/
│       ├── execution_tracker.py  # Step execution + dependency resolution
│       ├── image_analyzer.py     # GPT-4.1 vision
│       └── audio_transcriber.py  # Whisper transcription
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chat` | Send a message (text/image/audio) and receive a task plan + execution graph |
| `POST` | `/api/execute` | Execute an approved plan; returns an SSE stream of graph updates |
| `POST` | `/api/approve/{step_id}` | Approve or reject a checkpoint step |
| `GET`  | `/api/approve/{step_id}` | Check approval status for a step |
| `GET`  | `/api/agents` | List all available agents with metadata |
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
git clone git@github.com:kostadindev/mobile-agent-manager.git
cd agentflow

# Install client dependencies
npm run install:client

# Install server dependencies
npm run install:server

# Configure environment
cp server/.env.example server/.env   # then add your OPENAI_API_KEY
```

Create `server/.env`:
```
OPENAI_API_KEY=sk-...
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

Open [http://localhost:5173](http://localhost:5173) in your browser.

## UI Tabs

- **Chat** — Multimodal conversation interface. Send text, record voice, or capture an image. The orchestrator returns a task plan that renders inline as a card with an interactive execution graph.
- **Agents** — Browse the available agents, their capabilities, and approval requirements.
- **History** — Full-screen execution graph and a step-by-step result stream for the most recent run.

## Key Design Decisions

- **Two-phase execution** — Planning uses CrewAI's LLM-based orchestrator; execution calls tools directly with dependency tracking for predictable, streamable results.
- **SSE streaming** — Real-time graph updates over Server-Sent Events keep the UI responsive without WebSocket complexity.
- **Dependency-aware scheduling** — Steps declare `depends_on` relationships; the tracker resolves the DAG and executes independent steps where possible.
- **Stateless server** — No database. Plans and execution state live in memory for the duration of a request. Approval state is held in a simple in-memory dict.
- **Multimodal input** — GPT-4.1 vision for images, Whisper for audio, text pass-through — all unified into a single planning prompt.
