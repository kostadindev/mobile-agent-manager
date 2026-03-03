# MobileAgents

**Designing and Evaluating a Mobile Multimodal Interface for Controlling Teams of AI Agents On the Go**

MobileAgents is an open-source, mobile-first platform that lets users bring their own AI agents and manage them via text, voice, and images. An LLM orchestrator (CrewAI) decomposes requests into a dependency-aware execution plan; a live DAG graph streams agent progress in real time. Users can choose how much control they want — from full autonomy to step-by-step transparency.

---

## Motivation

AI agents are increasingly capable, but controlling them typically requires desktop apps or programmatic access. MobileAgents addresses the need for a mobile agent platform that enables frictionless management of agents on-the-go with adjustable levels of control and governance.

**Primary persona:** Jessica is a PhD student who runs literature-review agents. She wants to monitor progress, redirect agents, and share results with her lab via Slack while commuting.

---

## Design

Three core values guided the design via Value Sensitive Design (VSD):

| Value | Design Decision |
|-------|----------------|
| **V1 Mobility** — reach agents on the go | Text, image, and voice input; push-to-talk; multimodal interaction |
| **V2 Control** — understand and supervise agents | Plan approval, real-time execution graph, agent toggles, constitution editor |
| **V3 Ease** — simple and intuitive | Simple settings, concise responses, clear visualizations, in-app docs |

### Transparency Configurations

| Mode | What the user sees |
|------|--------------------|
| **C1: Black Box** | Agents auto-execute. Query in, answer out. |
| **C2: Plan Preview** | Orchestrator's task plan shown as a card. User approves with one tap. |
| **C3: Full Transparency** | Plan card + live DAG graph with animated node/edge status, step-by-step results, checkpoint approval gates. |

### Input Modalities

| Mode | Description |
|------|-------------|
| **M1: Multimodal** | Text + speech input (transcribed by Whisper) + images |
| **M2: Text + Images** | Typed text with camera/gallery image capture |
| **M3: Voice Only** | Push-to-talk; hands-free, no plan/graph controls |

---

## Agents

The platform ships with an orchestrator and five demo agents. Any agent can be registered at runtime — no code changes required.

| Agent | Tools | Description |
|-------|-------|-------------|
| **Orchestrator** | planning, delegation, synthesis | Plans and coordinates all agent tasks. Editable constitution for user-defined guidelines. Always active. |
| **ArXiv** | `arxiv_search`, `arxiv_summarize` | Searches and summarizes academic papers from arXiv |
| **Proposal** | `generate_proposal`, `outline_methodology` | Generates structured research proposals |
| **Wikipedia** | `wiki_search`, `wiki_summarize` | Searches and summarizes Wikipedia articles |
| **Slack** | `slack_send_message` | Sends messages to Slack channels — requires approval before execution |
| **Semantic Scholar** | `semantic_scholar_search`, `semantic_scholar_cite` | Searches all academic literature and retrieves citation metrics |

---

## Study and Results

A within-subjects study with 13 participants (university students with LLM experience) evaluated three research questions.

### RQ1 — Transparency: Usability/Control Tradeoff

| Metric | C1: Black Box | C2: Plan | C3: Transparency |
|--------|--------------|----------|-----------------|
| Trust (1–7) | 4.3 (1.7) | 5.0 (1.5) | 5.8 (1.0) |
| Control (1–7) | 3.2 (2.1) | 5.4 (1.3) | 5.7 (1.1) |
| Satisfaction (1–7) | 4.4 (2.3) | 3.9 (1.1) | 5.8 (1.1) |

Trust and control increase monotonically from C1 to C3. C3 scored highest in satisfaction; C2 was lowest — users preferred either full autonomy or full control. C2 and C3 showed significant improvements in control over C1 (Wilcoxon, Bonferroni-corrected). C3 was significantly more satisfying than C2 (*p* = .012, *d* = −1.16).

### RQ2 — Modality: Mobile Experience

| Metric | M1: Multimodal | M2: Text + Image | M3: Voice Only |
|--------|---------------|-----------------|----------------|
| SEQ ease (1–7) | 4.2 (2.0) | 4.5 (2.1) | 5.4 (1.6) |
| NASA-TLX composite (1–10) | 4.2 (0.6) | 4.1 (0.9) | 4.6 (0.6) |
| Felt natural (1–7) | 4.2 (1.1) | 4.9 (1.7) | 4.1 (2.0) |
| OK in public (1–7) | 4.0 (1.6) | 3.3 (1.4) | 2.8 (1.3) |

No single modality dominated. Voice was easiest (SEQ 5.4) but most demanding (TLX 4.6) and least appropriate in public (2.8). Text + Image felt most natural (4.9). Modalities are complementary; all three remain available in settings.

### RQ3 — Orchestration Customization

| Item | Mean (SD) |
|------|-----------|
| Discoverability | 3.8 (1.6) |
| Mental Model | 4.5 (1.8) |
| Effectiveness | 5.2 (1.4) |
| Controllability | 5.7 (1.0) |
| Ownership | 4.8 (1.1) |
| Adoption | 4.2 (1.5) |

Controllability, effectiveness, and ownership were significantly above neutral. Discoverability was not — the constitution editor was hard to find. Agent toggles were rated as simple and effective; the constitution remains a power-user feature.

### Key Qualitative Findings

- **Intervention is powerful with high observability.** Participants valued the ability to act while watching real-time execution. The live graph was the most-trusted feature.
- **Multimodal enables mobile.** Voice valued for on-the-go use but avoided in public. Images useful for capturing physical context. Text remains the standard for sensitive tasks.
- **Constitution is confusing; toggles are not.** Users found the constitution unfamiliar but quickly understood agent on/off switches.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Mobile-First React Client (Konsta iOS UI)              │
│  Chat (text/voice/image) · Agents · History · Guide     │
└────────────────────────┬────────────────────────────────┘
                         │  POST /api/chat   POST /api/execute (SSE)
                         ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI Server                                         │
│  Orchestrator (CrewAI) · Execution Tracker (SSE)        │
│  Image Analyzer (GPT-4.1) · Audio (Whisper)             │
│  Auth (Supabase JWT) · Agent Registry (JSON)            │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

**Client** — React 19, TypeScript, Vite, Tailwind CSS, Zustand, ReactFlow, Konsta UI, Lucide icons

**Server** — FastAPI, CrewAI, OpenAI SDK (GPT-4.1 + Whisper), Supabase (auth + DB), Pydantic, Uvicorn

## Project Structure

```
agentflow/
├── client/src/
│   ├── components/      # Chat, Agents, Graph, TaskPlan, Camera, Voice, Settings, Guide
│   ├── state/store.ts   # Zustand (state + API + localStorage)
│   ├── types/           # TypeScript interfaces
│   └── i18n/            # EN / ZH / AR / BG
└── server/
    ├── routers/         # /chat  /execute  /approve  /agents  /conversations
    ├── crew/            # Orchestrator, agent definitions, tools
    ├── models/          # Pydantic schemas
    └── services/        # Execution tracker, image analyzer, audio transcriber, DB
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- OpenAI API key
- Supabase project (for auth + conversation storage)

### Setup

```bash
# Install client dependencies
npm run install:client

# Install server dependencies
npm run install:server
```

Create `server/.env`:
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=...
SLACK_BOT_TOKEN=xoxb-...   # Optional — Slack agent only
CREWAI_TRACING_ENABLED=false
```

Create `client/.env`:
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### Run

```bash
npm run dev          # starts both client (port 5173) and server (port 8000)
```

Open [http://localhost:5173](http://localhost:5173) in your browser or on mobile via local network.

---

## Features

- **Bring Your Own Agents** — register any agent via the API or Agents tab at runtime; no code changes needed
- **Three transparency modes** — Black Box, Plan Preview, Full Transparency (live DAG)
- **Three input modalities** — Text, Text + Images, Voice Only, Multimodal
- **Human-in-the-loop** — checkpoint approval gates for high-risk actions (e.g., Slack messages)
- **Constitution editor** — natural-language policy appended to the orchestrator's system prompt
- **SSE streaming** — real-time graph updates over Server-Sent Events
- **Internationalization** — English, Chinese (Simplified), Arabic (RTL), Bulgarian
- **Theme support** — Light, Dark, Auto
- **Accessibility** — `aria-label` on all icon buttons, `aria-live` on graph status, `focus-visible` rings
- **Privacy consent** — shown on first microphone/camera use; stored in localStorage

---

## Ethical Considerations

- **Self-hosted** — released as open-source so users and organizations own their data; no third-party agent storage
- **Privacy** — audio and images are processed by OpenAI (Whisper / GPT-4.1); users are informed via consent dialogs before first use
- **Safety** — approval gates prevent irreversible actions; future work should add guardrails against prompt injection by malicious agents
- **Wellbeing** — potential for cognitive offloading and work exploitation via smartphone; future research should assess impact on wellbeing
