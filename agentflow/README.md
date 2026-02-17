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

---

## Assignment Context: Designing AI Experiences

This prototype is built for the *Designing AI Experiences* module assessment. The sections below frame the system in terms of the assignment requirements and propose improvements to strengthen the submission.

### Use Case and Motivation

**Use case:** A multimodal AI research assistant that helps academics and students explore research topics through natural interaction — typing a question, speaking it aloud, or photographing a diagram/whiteboard.

**Why multimodal?** Research is inherently multimodal. Users sketch ideas on whiteboards, discuss them verbally, and write queries. A text-only assistant forces users to translate these artifacts into typed prompts, creating friction. Supporting voice and image input lets users interact in the mode closest to their current context — photographing a conference poster to find related work, or dictating a rough idea while walking.

**Why multi-agent?** Research tasks are composite: finding papers, reading background material, and drafting proposals are distinct skills. Decomposing them into specialized agents makes the system's reasoning transparent and lets users inspect, approve, and steer individual steps — a key consideration for trust and user control.

### Stakeholders

| Stakeholder | Type | Key Needs / Values |
|-------------|------|-------------------|
| Graduate researchers | Direct user | Efficient literature discovery, trustworthy summaries, low friction input |
| Undergraduate students | Direct user | Guided exploration, comprehensible output, learning support |
| Research supervisors | Indirect | Accurate citations, no hallucinated claims, academic integrity |
| Paper authors (on arXiv) | Indirect | Fair representation of their work, proper attribution |
| Institution (university) | Indirect | Responsible AI use, data privacy, accessibility compliance |

### Current Modalities

| Modality | Input | Output | Implementation |
|----------|-------|--------|----------------|
| **Text** | Typed message | Markdown response, task plan card, execution graph | Direct pass-through to orchestrator |
| **Voice** | Recorded audio (MediaRecorder → WebM → base64) | Transcribed text shown in chat, then same as text | OpenAI Whisper transcription |
| **Image** | Camera/gallery capture (base64) | Image description used as context for planning | GPT-4.1 vision analysis |

---

## Proposed Improvements

The improvements below are prioritized by assignment rubric impact. Each maps to a rubric criterion.

### 1. Design Variation System — Three Transparency Configurations (Rubric: Research Question + Design Variations, 20%)

This is the most critical addition. The assignment requires a research question and 3+ design configurations to compare.

**Research question:** *How does the level of AI planning transparency affect user trust, perceived control, and task completion satisfaction in a multimodal research assistant?*

**Three configurations:**

| Config | Name | What the user sees |
|--------|------|-------------------|
| **A** | Black Box | No plan shown. The user submits a query and receives only the final synthesized answer after all agents finish. No execution graph, no step list, no approval step. |
| **B** | Plan Preview | The orchestrator's plan is shown as a task list before execution. The user clicks "Execute" to approve. No live graph — a spinner shows until the final result appears. |
| **C** | Full Transparency | Current behavior: plan card + live DAG graph with animated node/edge status, step-by-step results streaming in real time, checkpoint approval gates. |

**Implementation approach:**
- Add a `transparencyLevel` setting to the Zustand store (`'black_box' | 'plan_preview' | 'full_transparency'`).
- In `ChatView`, conditionally render the `TaskPlanCard` and `ExecutionGraph` components based on this setting.
- For Config A, call `/api/execute` immediately after `/api/chat` without showing the plan, and only display the final `execution_complete` message.
- For Config B, show the plan card but hide the graph and stream — show a loading state until completion.
- Add a configuration toggle in a settings panel or as a top-bar dropdown (useful for A/B evaluation sessions).

### 2. Post-Task Evaluation Survey (Rubric: Evaluation of Prototype, 20%)

Embed a brief survey after each completed execution to collect quantitative metrics during user testing.

**Suggested metrics (at least 2 required):**
- **Trust** — "I trust the results this system produced" (7-point Likert)
- **Perceived control** — "I felt in control of what the system was doing" (7-point Likert)
- **Satisfaction** — "I am satisfied with how the system handled my request" (7-point Likert)
- **Understanding** — "I understood what the system was doing and why" (7-point Likert)

**Implementation approach:**
- Create a `SurveyModal` component that appears after `execution_complete`.
- Store responses locally (localStorage or POST to a `/api/survey` endpoint that writes to a JSON file).
- Tag each response with the active `transparencyLevel` so results can be compared across configs.

**Evaluation methods (at least 2, one with users):**
1. **Think-aloud user study** (with users) — 3-5 participants each try all 3 configurations on the same task. Record observations and verbal feedback.
2. **Post-interaction survey** (with users) — the embedded Likert scales above, compared across configs.
3. **Heuristic evaluation** (optional, without users) — evaluate each config against Nielsen's 10 usability heuristics, noting where transparency helps/hurts.

### 3. Interaction Design Polish (Rubric: Interaction & UX Design Quality, 20%)

**a) AI Persona and Tone**
- Define an explicit persona for the orchestrator (e.g., "a knowledgeable but concise research librarian").
- Add a system prompt preamble in `orchestrator.py` that sets tone: helpful, non-authoritative ("Here's what I found..." rather than "The answer is..."), and uncertainty-aware ("I found limited results on this topic — you may want to verify with additional sources").

**b) Multimodal Affordances**
- Add input mode indicators — when voice is recording, pulse the microphone icon and show a waveform or timer (partially implemented). When an image is attached, show a thumbnail with a remove button (partially implemented).
- Add output modality cues — prefix voice-originated messages with a microphone icon; show a camera icon on image-originated messages.

**c) Accessibility**
- Add `aria-label` attributes to icon-only buttons (send, voice, camera).
- Ensure keyboard navigation works across all tabs (tab order, focus rings).
- Add `role="status"` and `aria-live="polite"` to the execution graph status updates so screen readers announce progress.
- Ensure color is not the only status indicator — the graph nodes already use icons (spinner, checkmark, X) in addition to color, which is good.

**d) Safety and Transparency Measures**
- Add a visible disclaimer: "AI-generated summaries may contain errors. Always verify claims against original sources."
- Include source links in agent results (arXiv URLs, Wikipedia links) — partially implemented via tool output.
- Add a confidence/source-count indicator to synthesized results.

### 4. Ethical, Social, and Value Reflection Material (Rubric: Ethical & Value Reflection, 20%)

These are topics to address in the report, supported by evidence from the prototype:

| Theme | Tension / Trade-off | Evidence from Prototype |
|-------|---------------------|------------------------|
| **Transparency vs. cognitive load** | Full transparency (Config C) shows every step but may overwhelm novice users. Black box (Config A) is simpler but erodes trust. | Compare survey scores across configs. |
| **Automation vs. user control** | Auto-execution is faster but removes the user's ability to catch errors before they propagate. Checkpoint approval adds friction but keeps the human in the loop. | Approval gates in the execution tracker; compare Config A (no approval) vs. Config C (with approval). |
| **Accuracy and hallucination risk** | LLM synthesis may misrepresent paper findings. Showing raw agent outputs (Config C) lets users verify; hiding them (Config A) does not. | Include an example where synthesis drifts from the source. |
| **Privacy** | Voice recordings and images are sent to OpenAI's API. Users may not realize their data leaves the device. | Add a consent notice before first voice/image use. Note the `.env`-only API key storage. |
| **Accessibility and inclusion** | Voice input benefits users who struggle with typing; image input benefits visual thinkers. But voice requires a quiet environment, and image requires a camera. | Document which modalities help/hinder which user groups. |
| **Academic integrity** | Generated proposals could be submitted as-is. The system should frame outputs as starting points, not finished work. | Persona tone adjustment (see improvement 3a). |

### 5. Minor UX Improvements

- **Empty states** — The History tab shows a blank screen when no execution has run. Add an illustration and "Run your first research query to see results here."
- **Error feedback** — When an agent fails (e.g., arXiv API timeout), show the error inline in the graph node rather than silently failing.
- **Loading states** — Add a skeleton loader while the orchestrator is planning (the current dot animation is minimal).
- **Conversation history** — Messages are lost on page refresh (in-memory only). Persist to localStorage for session continuity.

---

## Suggested Evaluation Plan

```
                 ┌─────────────────────────────────────────┐
                 │        Within-subjects study             │
                 │     (each participant tries all 3)       │
                 │                                          │
  Task prompt    │  Config A ──► Config B ──► Config C      │
  (same for all) │  (Black Box)  (Plan)    (Full Graph)    │
                 │                                          │
                 │  After each: 4-item Likert survey        │
                 │  During each: think-aloud (recorded)     │
                 │  After all 3: semi-structured interview   │
                 └─────────────────────────────────────────┘
```

**Participants:** 3-5 (sufficient for qualitative HCI study at prototype stage)

**Task:** "Find recent papers on [topic], summarize the key findings, and draft a short research proposal."

**Counterbalance** configuration order across participants to control for learning effects.

**Metrics:**
1. Trust (Likert)
2. Perceived control (Likert)
3. Satisfaction (Likert)
4. Qualitative themes from think-aloud and interview transcripts

**Analysis:** Compare mean Likert scores across configs; thematic analysis of qualitative data.

---

## Implementation Priority

Given the ~1 week prototype scope noted in the assignment brief:

| Priority | Improvement | Effort | Rubric Impact |
|----------|-------------|--------|---------------|
| **P0** | Transparency config toggle (3 modes) | ~3-4 hours | Research Question + Variations (20%) |
| **P0** | Post-task survey modal | ~2 hours | Evaluation (20%) |
| **P1** | Persona/tone in orchestrator prompt | ~30 min | Interaction & UX (20%) |
| **P1** | Accessibility: aria-labels, keyboard nav | ~1-2 hours | Interaction & UX (20%) |
| **P1** | Safety disclaimer + source links | ~1 hour | Ethical Reflection (20%) |
| **P2** | Empty states, error feedback, loading | ~2 hours | Implementation (10%) |
| **P2** | Persist chat to localStorage | ~1 hour | Implementation (10%) |
