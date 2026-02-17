# AgentFlow

An open-source, mobile-first, multimodal agent manager. Users configure and orchestrate any AI agents through text, voice, or image input — an LLM orchestrator decomposes requests into a dependency-aware execution plan, and a live DAG graph streams agent progress in real time on mobile.

The current prototype ships with three research-focused agents (ArXiv, Proposal, Wikipedia), but the architecture is designed for any agent type — the platform manages agent lifecycles, orchestration, and multimodal interaction regardless of domain.

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

The platform ships with three demo agents. Any agent can be added by defining its role, tools, and metadata.

| Agent | Tools | Description |
|-------|-------|-------------|
| **ArXiv Agent** | `arxiv_search`, `arxiv_summarize` | Searches and summarizes academic papers from arXiv |
| **Proposal Agent** | `generate_proposal`, `outline_methodology` | Generates structured research proposals and methodology outlines |
| **Wikipedia Agent** | `wiki_search`, `wiki_summarize` | Searches and summarizes Wikipedia articles for background research |

## Tech Stack

**Client** — React 19, TypeScript, Vite, Tailwind CSS, Zustand, ReactFlow ([@xyflow/react](https://reactflow.dev)), Dagre, Konsta UI (iOS-style mobile components), Lucide icons, react-markdown

**Server** — FastAPI, CrewAI, OpenAI SDK (GPT-4.1 + Whisper), Pydantic, Uvicorn

## Project Structure

```
agentflow/
├── package.json              # Monorepo scripts (concurrently)
├── client/
│   ├── src/
│   │   ├── App.tsx           # Root — KonstaApp with iOS dark theme
│   │   ├── main.tsx          # Entry point
│   │   ├── index.css         # Tailwind + custom animations + focus-visible
│   │   ├── state/
│   │   │   └── store.ts      # Zustand store (state + API + localStorage persistence)
│   │   ├── types/            # TypeScript interfaces
│   │   │   ├── agents.ts     #   Agent metadata
│   │   │   ├── messages.ts   #   Chat messages
│   │   │   ├── tasks.ts      #   Task plans and steps
│   │   │   └── graph.ts      #   Execution graph nodes/edges
│   │   └── components/
│   │       ├── Layout/       # Shell with bottom tab navigation
│   │       ├── Chat/         # Chat interface + image preview + TTS
│   │       ├── Agents/       # Agent list + CRUD form + toggle/delete
│   │       ├── TaskPlan/     # Plan card + approval controls
│   │       ├── Graph/        # ReactFlow DAG (nodes, edges, legend)
│   │       ├── Execution/    # History view + step stream
│   │       ├── Camera/       # Image capture (base64) + privacy consent
│   │       ├── Voice/        # Audio recording (MediaRecorder) + privacy consent
│   │       ├── Settings/     # Transparency mode picker + clear history
│   │       ├── Survey/       # Post-task Likert survey modal
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
│   └── services/
│       ├── execution_tracker.py  # Step execution + dependency resolution
│       ├── image_analyzer.py     # GPT-4.1 vision
│       ├── audio_transcriber.py  # Whisper transcription
│       └── agent_store.py        # JSON-file-backed agent CRUD
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
git clone git@github.com:kostadindev/mobile-agent-manager.git
cd agentflow

# Install client dependencies
npm run install:client

# Install server dependencies
npm run install:server
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

Open [http://localhost:5173](http://localhost:5173) in your browser (or on mobile via local network).

## UI Tabs

- **Chat** — Multimodal conversation interface. Type, speak, or photograph your request. The orchestrator returns a task plan that renders inline as a card with an interactive execution graph.
- **Agents** — Browse and manage registered agents — their capabilities, approval requirements, and status.
- **History** — Full-screen execution graph and a step-by-step result stream for the most recent run.

## Key Design Decisions

- **Agent-agnostic orchestration** — The orchestrator selects agents from a registry based on the request. Adding a new agent means registering its role, tools, and metadata — no changes to the orchestration or UI layer.
- **Mobile-first, multimodal** — Konsta UI provides native iOS feel. Voice and camera inputs are first-class citizens, not afterthoughts — critical for on-the-go mobile use.
- **Two-phase execution** — Planning uses CrewAI's LLM-based orchestrator; execution calls tools directly with dependency tracking for predictable, streamable results.
- **SSE streaming** — Real-time graph updates over Server-Sent Events keep the mobile UI responsive without WebSocket complexity.
- **Human-in-the-loop** — Checkpoint nodes in the DAG let users approve critical steps before execution continues, balancing automation with user control.
- **Stateless server** — No database for execution state. Agent configs persist to a JSON file; chat history persists in the browser via localStorage.

## Features

### Transparency Configuration (3 Design Modes)

A settings gear in the chat navbar opens a bottom sheet where users switch between three transparency levels — the core independent variable for the within-subjects evaluation:

| Mode | What the user sees |
|------|-------------------|
| **Black Box** | Query goes in, final answer comes out. No plan, no graph, no approval step — agents auto-execute. |
| **Plan Preview** | The orchestrator's task plan is shown as a card. User approves with one tap. A spinner shows during execution (no live graph). |
| **Full Transparency** | Current default: plan card + live DAG graph with animated node/edge status, step-by-step results streaming in real time, checkpoint approval gates. |

The active mode is persisted to localStorage and tagged on every survey response.

### Post-Task Survey

After every `execution_complete` event, a bottom sheet presents 4 Likert-scale items (7-point scale): trust, perceived control, satisfaction, and understanding. Responses are tagged with the active transparency level and saved to localStorage (`agentflow_surveys`). A "Skip" option is always available.

### Agent Management CRUD

The Agents tab is fully interactive:

- **Create** — Fab button (+) opens a bottom sheet form with name, description, role, goal, icon picker (10 Lucide icons), and color picker (8 swatches).
- **Edit** — Tap any agent card to reopen the form pre-filled.
- **Enable/Disable** — Toggle switch on each card. Disabled agents are excluded from the orchestrator's planning prompt.
- **Delete** — Trash icon removes the agent from the registry.
- **Persistence** — Agent configs are stored in `agents_config.json` on the server; the orchestrator dynamically reads from this registry for every plan.

### Text-to-Speech (TTS)

Every assistant message has a small speaker icon. Tapping it reads the message aloud using the Web Speech API (`speechSynthesis`). Tapping again stops playback. Speech is cancelled on component unmount.

### AI Persona and Tone

The orchestrator's system prompt uses a "knowledgeable but concise research librarian" tone with uncertainty-aware language. The synthesis prompt instructs the LLM to say "based on available results" rather than making absolute claims and appends a brief accuracy disclaimer.

### Modality Indicators and Privacy Consent

- **Badges** — Voice-originated messages show an amber `Voice` badge; image-originated messages show a cyan `Image` badge.
- **Privacy consent** — The first time a user taps the microphone or camera button, a dialog explains that data is sent to OpenAI for processing. Consent is stored in localStorage and only asked once.

### Accessibility

- `aria-label` on all icon-only buttons (send, settings, voice, camera, image remove, graph expand/collapse, TTS, delete agent).
- `aria-live="polite"` on the graph status header so screen readers announce state changes.
- `focus-visible` ring styles (2px solid brand purple, 2px offset) on buttons, inputs, textareas, and links for keyboard navigation.

### Empty States and Error Styling

- **Agents tab** — When no agents exist: Bot icon + "No agents configured" + "Tap + to add one".
- **Step results** — Failed steps render in `text-red-400` with an "Error: " prefix.

### Conversation Persistence

Chat messages, the current plan, the graph state, and the transparency level are persisted to localStorage via a Zustand subscriber. On page load, the store initializes from persisted state. A "Clear History" button in settings wipes everything.

---

## Assignment Context: Designing AI Experiences

This prototype is built for the *Designing AI Experiences* module assessment. The sections below frame the system in terms of the assignment requirements.

### Use Case and Motivation

**Use case:** A mobile, open-source agent manager that lets users orchestrate AI agents through multimodal interaction — text, voice, and image — on their phone.

**Why mobile?** Agent workflows are increasingly relevant outside the desktop. A developer debugging in production, a researcher at a conference, a field worker collecting data — all benefit from managing agents from a phone. Mobile also naturally motivates multimodal input: typing on a small screen is slow, but speaking or photographing is fast.

**Why multimodal?** Each input modality fits a different context. Text is precise for structured queries. Voice is hands-free and fast for brainstorming or when moving. Image lets users point their camera at a whiteboard, diagram, or document and ask agents to act on what they see. Supporting all three removes friction by letting users interact in whatever mode fits their current situation.

**Why open-source agent manager (not a single-purpose tool)?** The value is in the orchestration layer and the multimodal interface, not in any specific agent. By making agents pluggable, the platform serves any domain — research today, customer support or DevOps tomorrow. Users should be able to bring their own agents.

### Stakeholders

| Stakeholder | Type | Key Needs / Values |
|-------------|------|-------------------|
| Mobile power users | Direct user | Fast, frictionless input on small screens; trust in agent outputs |
| Agent developers | Direct user | Easy registration of new agents; clear tool/capability contracts |
| Non-technical users | Direct user | Comprehensible plans; ability to approve/reject before execution |
| Organizations deploying agents | Indirect | Audit trails, approval gates, control over which agents are available |
| End-users affected by agent actions | Indirect | Safety, accuracy, transparency about what agents did and why |
| Open-source community | Indirect | Clean extensibility, documentation, contribution pathways |

### Current Modalities

| Modality | Input | Output | Mobile Rationale |
|----------|-------|--------|-----------------|
| **Text** | Typed message | Markdown response, task plan card, execution graph | Precise but slow on mobile — best for short, specific queries |
| **Voice** | Recorded audio (MediaRecorder → WebM → base64) | Transcribed text shown in chat, then planned and executed | Hands-free, fast on mobile — ideal for on-the-go use |
| **Image** | Camera/gallery capture (base64) | Image description used as context for agent planning | Leverages phone camera — point at a diagram, poster, or document |

---

## Implemented Product Updates

All features below are fully implemented and functional.

### 1. Agent Management from the Mobile UI — DONE

The Agents tab is fully interactive with CRUD operations: create via bottom sheet form (name, description, role, goal, icon picker, color picker), edit by tapping a card, enable/disable toggle, delete via trash icon. Backend REST endpoints (`POST/PUT/DELETE /api/agents`) persist to `agents_config.json`. The orchestrator dynamically reads enabled agents for planning.

### 2. Three Design Configurations for Evaluation — DONE

**Research question:** *How does the level of AI planning transparency affect user trust, perceived control, and task satisfaction in a mobile multimodal agent manager?*

| Config | Name | Behavior |
|--------|------|----------|
| **A** | Black Box | Auto-executes after planning. User sees only "Processing..." then the final answer. No plan card, no graph, no approval. |
| **B** | Plan Preview | Plan card shown for approval. No live graph — spinner with "Agents working..." during execution. |
| **C** | Full Transparency | Plan card + live DAG graph with animated nodes/edges, step-by-step streaming, checkpoint gates. |

Settings gear in navbar → bottom sheet with radio selector. Persisted to localStorage.

### 3. Multimodal Output (TTS) — DONE

"Read aloud" button (Volume2 icon) on every assistant message. Uses the Web Speech API (`speechSynthesis`) for zero-cost client-side TTS. Toggle to stop. Auto-cancelled on unmount.

### 4. Post-Task Evaluation Survey — DONE

`SurveyModal` appears after every `execution_complete` event. 4 Likert items (trust, control, satisfaction, understanding) on a 7-point scale. Responses tagged with `transparencyLevel` and stored to localStorage (`agentflow_surveys`). Skip always available.

**Evaluation plan:**

```
              Within-subjects study (each participant tries all 3 configs)

 Task: "Find papers on [topic], summarize findings, draft a proposal"

 Config A (Black Box) ──► Config B (Plan Preview) ──► Config C (Full Graph)

 After each: 4-item Likert survey (embedded)
 During each: think-aloud (screen-recorded)
 After all 3: semi-structured interview (5 min)

 Counterbalance config order across 3-5 participants
```

### 5. Interaction Design Polish — DONE

| Area | Implementation |
|------|---------------|
| **AI persona** | Orchestrator backstory: "knowledgeable but concise research librarian", uncertainty-aware. Synthesis prompt adds disclaimers and limitation notes. |
| **Modality indicators** | Amber `Voice` badge and cyan `Image` badge on user messages. |
| **Empty states** | Agent list: Bot icon + "No agents configured" + "Tap + to add one". Failed steps: red text with "Error:" prefix. |
| **Accessibility** | `aria-label` on all icon-only buttons, `aria-live="polite"` on graph status, `focus-visible` ring styles in CSS. |
| **Privacy notice** | First-time consent dialog before voice/image use, stored in localStorage. |

### 6. Conversation Persistence — DONE

Chat messages, current plan, graph state, and transparency level persisted to localStorage via Zustand subscriber. Restored on page load. "Clear History" button in settings.

---

## Ethical, Social, and Value Reflection

Topics to address in the report, grounded in prototype evidence:

| Theme | Tension | Evidence from Prototype |
|-------|---------|------------------------|
| **Transparency vs. cognitive load** | Full transparency (Config C) lets users verify every step but may overwhelm novice users. Black box (Config A) is simpler but erodes trust. | Compare trust and understanding scores across configs. |
| **Automation vs. user control** | Auto-execution is faster but removes the user's ability to catch errors. Checkpoint approval adds friction but keeps the human in the loop. | Config A (no approval) vs. Config C (with approval gates). |
| **Mobile-specific privacy** | Voice and camera access is intimate on a personal device. Users may not realize data leaves the device for cloud processing. | Privacy consent prompt; discussion of on-device vs. cloud trade-offs. |
| **Agent trust boundary** | In an open agent platform, users may register agents that produce unreliable or harmful outputs. The platform must decide what guardrails to enforce. | Approval gates, source attribution in agent results. |
| **Accessibility and inclusion** | Voice input helps users who struggle with typing on small screens; image input helps visual thinkers. But voice requires a quiet environment, and image requires a functioning camera. | Document which modalities help/hinder which user groups. |
| **Open-source governance** | Community-contributed agents could introduce quality or safety risks. Who reviews and approves agent submissions? | Discussion of agent review processes, sandboxing, rating systems. |

---

## Implementation Status

All planned features have been implemented:

| Feature | Status | Rubric Impact |
|---------|--------|---------------|
| Transparency config toggle (3 modes) | Done | Research Question + Variations (20%) |
| Post-task survey modal | Done | Evaluation (20%) |
| Agent management CRUD (add/edit/toggle/delete) | Done | Implementation (10%) + Interaction Design (20%) |
| TTS "Read aloud" button (Web Speech API) | Done | Multimodal depth (20%) |
| Persona/tone in orchestrator prompt | Done | Interaction & UX (20%) |
| Modality indicators + privacy consent | Done | Ethical Reflection (20%) |
| Accessibility (aria-labels, focus-visible, aria-live) | Done | Interaction & UX (20%) |
| Empty states + error styling | Done | Implementation (10%) |
| Conversation persistence (localStorage) | Done | Implementation (10%) |
