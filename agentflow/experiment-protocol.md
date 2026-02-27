# MobileAgents User Study — Experiment Protocol

## Overview

| Detail | Value |
|---|---|
| **RQ** | How does the level of transparency in a multi-agent AI orchestrator affect user trust, perceived control, and task efficiency? |
| **Design** | Within-subjects, 3 conditions (counterbalanced) |
| **Participants** | 10–15 university students/staff with LLM experience |
| **Duration** | ~35–45 min per participant |
| **Materials** | MobileAgents app (deployed), Google Form, screen recorder, printed abstract, interview script |

---

## 1. Participant Recruitment

### Eligibility Criteria
- Age 18+
- Experience using LLM-based tools (ChatGPT, Copilot, Claude, etc.)
- No prior experience with multi-agent orchestration systems
- Comfortable using a smartphone

### Recruitment Message (email/Slack/poster)

> **Participants needed for a 40-minute AI interaction study!**
>
> We're looking for 10–15 people to test MobileAgents, a mobile app for controlling AI agents via text, voice, and camera. You'll complete short research tasks using your phone and share your thoughts.
>
> **Who:** Anyone 18+ who has used ChatGPT or similar tools
> **Time:** ~40 minutes
> **Where:** [Room/location]
> **When:** [Date range]
>
> Interested? Sign up here: [link]

### Sign-Up Form Fields
1. Name
2. Email
3. Age
4. Gender
5. "How often do you use LLM tools (ChatGPT, Claude, Copilot)?" [Daily / Weekly / Monthly / Rarely]
6. "Have you used a multi-agent AI system before (e.g., CrewAI, AutoGen, LangGraph)?" [Yes / No]
7. Preferred time slot

---

## 2. Counterbalancing Schedule (Latin Square)

Each participant sees all 3 configurations in a different order. Tasks are also rotated so no task is always paired with the same configuration.

| Group | Session 1 | Session 2 | Session 3 |
|-------|-----------|-----------|-----------|
| A (P1, P4, P7, P10, P13) | C1 + T1 | C2 + T2 | C3 + T3 |
| B (P2, P5, P8, P11, P14) | C2 + T3 | C3 + T1 | C1 + T2 |
| C (P3, P6, P9, P12, P15) | C3 + T2 | C1 + T3 | C2 + T1 |

**Configurations:**
- **C1: Black Box** — Query in, answer out. No plan card, no graph, no approval.
- **C2: Plan Preview** — Plan card shown, user taps approve, spinner during execution.
- **C3: Full Transparency** — Plan card + live DAG graph + checkpoint approval gates.

**Tasks:**
- **T1 (Text):** Type a query to find and compare two recent papers on a topic.
- **T2 (Camera):** Photograph a printed paper abstract, ask the system to find related work and draft a proposal.
- **T3 (Voice):** Use voice to request a summary of results and send to a Slack channel.

---

## 3. Session Protocol (Step-by-Step)

### Pre-Session Setup (~2 min)
- [ ] Set the app to the correct transparency configuration for Session 1
- [ ] Open screen recorder on the participant's phone (or use a secondary device)
- [ ] Have the printed abstract ready for T2
- [ ] Open the Google Form on a laptop/tablet for the participant
- [ ] Start a new conversation in the app

### Introduction (~5 min)
Read aloud or paraphrase:

> "Thank you for participating. Today you'll use MobileAgents, a mobile app that lets you control multiple AI agents using text, voice, and camera. The app has agents for academic paper search, Wikipedia, proposal writing, and Slack messaging.
>
> You'll complete three short tasks, each using a different version of the app. After each task, you'll fill out a brief survey. At the end, I'll ask you some questions about your experience.
>
> Please think aloud as you work — say whatever comes to mind about what you're doing, expecting, confused by, or noticing. There are no right or wrong answers; we're evaluating the system, not you.
>
> Your participation is voluntary and you can stop at any time. Your responses are anonymous. Do you have any questions?"

### Obtain Consent
- [ ] Hand participant the consent form (see Section 7)
- [ ] Collect signed consent before proceeding

### Session 1: Configuration [X] + Task [Y] (~7 min)
1. **Brief the task** — read the task card aloud (see Section 4)
2. **Start timer** when participant begins first input
3. **Think-aloud** — listen and take timestamped notes on:
   - Hesitations or confusion
   - Positive reactions ("oh cool", "that makes sense")
   - Interaction breakdowns or errors
   - Comments about trust, control, or privacy
   - Modality-specific reactions (voice comfort, camera ease)
4. **Stop timer** when the system displays the final synthesised response
5. **Record task time** in seconds
6. **Post-task survey** — participant fills out the 7-item Google Form (see Section 5)

### Session 2: Configuration [X] + Task [Y] (~7 min)
- [ ] Switch app to the next configuration in Settings
- [ ] Start a new conversation
- [ ] Repeat steps 1–6

### Session 3: Configuration [X] + Task [Y] (~7 min)
- [ ] Switch app to the next configuration in Settings
- [ ] Start a new conversation
- [ ] Repeat steps 1–6

### Post-Study Interview (~10 min)
- [ ] Conduct the semi-structured interview (see Section 6)
- [ ] Audio record (with consent) or take written notes

### Debrief (~2 min)
> "Thank you! The three versions you used had different levels of transparency — one showed nothing, one showed the plan, and one showed the full execution graph. We're studying how these affect trust and control. Do you have any final questions?"

---

## 4. Task Cards (Read to Participant)

### Task T1 — Text Input
> "Using the text input, ask the system to find and compare two recent papers on **[topic]**. You can phrase this however feels natural."
>
> Topics (rotate across participants): reinforcement learning from human feedback / multimodal large language models / AI agents for scientific discovery

### Task T2 — Camera Input
> "Here is a printed paper abstract. Use the camera button to photograph it, then ask the system to find related work and draft a short research proposal based on it."
>
> [Hand participant the printed abstract — use the same abstract for all participants for consistency]

### Task T3 — Voice Input
> "Using the voice button, speak a request to summarise the results from a previous search and send the summary to the team Slack channel."
>
> [If no prior results exist, pre-load a conversation with a completed search so the participant has context to summarise]

---

## 5. Post-Task Google Form Survey

**Create one Google Form with 3 sections (one per configuration). Each section has the same 7 items.**

### Form Header
> **MobileAgents Post-Task Survey**
> Please rate your experience with the version of the system you just used. There are no right or wrong answers.

### Section: After Configuration [C1/C2/C3]

*All items: 7-point Likert scale (1 = Strongly Disagree, 7 = Strongly Agree)*

| # | Item | Construct |
|---|------|-----------|
| Q1 | I trusted the system's output enough to act on it. | Trust |
| Q2 | I felt in control of what the system did on my behalf. | Perceived Control |
| Q3 | I am satisfied with this interaction. | Satisfaction |
| Q4 | The system made it clear what it was going to do before doing it. | Expectation Setting |
| Q5 | It was easy to correct or stop the system when needed. | Repairability |
| Q6 | I understood why the system made the decisions it did. | Explainability |
| Q7 | I felt comfortable with the information I shared during this task. | Privacy Comfort |

### Additional Fields (end of form, after all 3 sections)

| Field | Type |
|-------|------|
| Participant ID | Short answer (assigned by researcher) |
| Which version would you most want to use daily? | Dropdown: C1 (Black Box) / C2 (Plan Preview) / C3 (Full Transparency) |
| Any other thoughts? | Long answer (optional) |

### Google Form Structure

```
Page 1: Consent confirmation + Participant ID
Page 2: "You just used Version A" — Q1–Q7 (Likert 1-7)
Page 3: "You just used Version B" — Q1–Q7 (Likert 1-7)
Page 4: "You just used Version C" — Q1–Q7 (Likert 1-7)
Page 5: Overall preference + open comments
```

Note: Label configurations as "Version A/B/C" (not C1/C2/C3) to avoid biasing participants toward "higher" versions.

---

## 6. Semi-Structured Interview Questions

Conduct after all three conditions are complete. Audio record if consented. Duration: ~10 minutes.

### Core Questions

1. You used three different versions of the system. Can you describe how each felt different?
2. Which version would you prefer for everyday use? Why?
3. Was there a moment where you particularly trusted — or distrusted — the system? What caused that?
4. The system showed you a plan before executing [in some versions]. Did that change how you interacted with it? How?
5. For the version with the live graph, was seeing the execution progress helpful or distracting?
6. The system required approval before sending a Slack message. How did that approval step feel? Too cautious? About right?
7. How did you decide whether to use text, voice, or camera input? Were there situations where you avoided a modality? Why?
8. Did any of the system's responses feel overconfident or uncertain? How did that affect your trust?

### Privacy & Ethics Probes

9. If this system stored your conversation history across sessions, how would you feel about that? What controls would you want?
10. Can you think of a situation where a system like this could cause harm — to you or someone else?

### Wrap-Up

11. What is the single most important change you would make to improve this system?

### Interview Notes Template

| Timestamp | Question # | Key Quote / Observation | Theme Tag |
|-----------|------------|------------------------|-----------|
| 0:00 | Q1 | | |
| | | | |

---

## 7. Consent Form

> **Participant Consent Form**
>
> **Study Title:** Evaluating Transparency in a Mobile Multi-Agent AI System
> **Researcher:** [Your name], [Your email]
> **Institution:** [University name]
>
> **Purpose:** This study evaluates different interface designs for a mobile app that controls AI agents. You will complete short tasks using the app and share your experience through surveys and a brief interview.
>
> **What you'll do:** Use a mobile app to complete 3 short research-related tasks (~5 min each), fill out a survey after each task, and participate in a 10-minute interview.
>
> **Duration:** Approximately 40 minutes.
>
> **Data collected:**
> - Screen recordings of your app interactions
> - Survey responses (anonymous)
> - Audio recording of the interview (if you consent below)
> - Think-aloud observations (researcher notes)
>
> **Data handling:** All data will be anonymised. Recordings will be stored securely and deleted after analysis. No personally identifiable information will appear in any report.
>
> **Risks:** Minimal. The app sends queries to external AI services (OpenAI). A consent dialog in the app explains this. You may skip voice or camera input if you prefer.
>
> **Voluntary participation:** You may withdraw at any time without giving a reason.
>
> **Consent:**
>
> - [ ] I have read and understood the above information
> - [ ] I agree to participate in this study
> - [ ] I agree to have my screen recorded during tasks
> - [ ] I agree to have the interview audio recorded (optional — you may still participate without this)
>
> **Name:** ___________________________
> **Signature:** ________________________
> **Date:** ____________________________

---

## 8. Data Collection Checklist

### Per Participant
- [ ] Signed consent form
- [ ] Participant ID assigned (P01, P02, ...)
- [ ] Counterbalancing group noted (A, B, or C)
- [ ] Screen recording started
- [ ] Task times recorded (3 values in seconds)
- [ ] Think-aloud notes taken (timestamped)
- [ ] Google Form completed (3 sections + overall)
- [ ] Interview conducted and recorded/noted
- [ ] Debrief given

### Master Spreadsheet Columns

| Column | Description |
|--------|-------------|
| Participant ID | P01–P15 |
| Age | Years |
| Gender | M/F/Other |
| LLM Experience | Daily/Weekly/Monthly/Rarely |
| Group | A, B, or C |
| Order | e.g., C1→C2→C3 |
| C1 Trust | 1–7 |
| C1 Control | 1–7 |
| C1 Satisfaction | 1–7 |
| C1 Expectation | 1–7 |
| C1 Repairability | 1–7 |
| C1 Explainability | 1–7 |
| C1 Privacy | 1–7 |
| C1 Time (s) | seconds |
| C2 Trust | 1–7 |
| C2 Control | 1–7 |
| C2 Satisfaction | 1–7 |
| C2 Expectation | 1–7 |
| C2 Repairability | 1–7 |
| C2 Explainability | 1–7 |
| C2 Privacy | 1–7 |
| C2 Time (s) | seconds |
| C3 Trust | 1–7 |
| C3 Control | 1–7 |
| C3 Satisfaction | 1–7 |
| C3 Expectation | 1–7 |
| C3 Repairability | 1–7 |
| C3 Explainability | 1–7 |
| C3 Privacy | 1–7 |
| C3 Time (s) | seconds |
| Preferred Config | C1/C2/C3 |
| Interview Notes File | path |

---

## 9. Analysis Plan

### Quantitative (Google Form + Task Times)

1. **Descriptive statistics:** Mean, SD for each metric per configuration (report in Table 2 of paper)
2. **Within-subjects comparison:** Friedman test (non-parametric, N < 20) for each metric across C1/C2/C3, followed by Wilcoxon signed-rank post-hoc tests with Bonferroni correction if significant
3. **Preference distribution:** Count of participants preferring each configuration
4. **Task time comparison:** Mean time per configuration

### Qualitative (Think-Aloud + Interview)

1. **Transcribe** interview recordings (or use detailed notes)
2. **Braun & Clarke reflexive thematic analysis** (6 phases):
   - Phase 1: Familiarisation — read all transcripts twice
   - Phase 2: Generate initial codes — tag segments (e.g., "trust from intervention", "voice privacy concern", "graph overload")
   - Phase 3: Generate themes — cluster codes into candidate themes
   - Phase 4: Review — check themes against data, merge/split
   - Phase 5: Define and name — write theme definitions
   - Phase 6: Write up — select illustrative quotes
3. **Code the think-aloud notes** using the same coding scheme
4. **Count qualitative patterns** (e.g., "6 of 12 mentioned privacy concerns with voice in public")

---

## 10. Timeline

| Day | Activity |
|-----|----------|
| Day 1 | Send recruitment message, set up Google Form, print consent forms + abstracts |
| Day 2–3 | Run pilot session (1 participant, not included in data) — refine protocol |
| Day 3–5 | Run sessions (3–5 per day, ~45 min each) |
| Day 5 | Export Google Form data, consolidate think-aloud notes |
| Day 5–6 | Transcribe interviews, run thematic analysis |
| Day 6 | Compute descriptive statistics, run Friedman tests |
| Day 7 | Write up results section of report |

---

## 11. Printed Materials Needed

- [ ] 15× Consent forms (printed, double-sided)
- [ ] 1× Printed paper abstract for T2 (same for all participants)
- [ ] 15× Task cards (laminated or printed — one set of T1/T2/T3 per participant)
- [ ] 1× Interview question sheet (for the researcher)
- [ ] Notebook + pen for think-aloud timestamped notes
- [ ] Backup: portable charger for participant's phone
