# Mehfil System Architecture

> **PromptWars Challenge 5: Celebration & Event Planner**  
> Original GenAI Event Planning Assistant for Weddings, Birthdays, Community Events, and Milestones.

---

## 1. Architectural Philosophy

Mehfil separates **creative natural language understanding** from **deterministic calculation**:

```
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                   |
|   (Vite + React + TypeScript strict + Tailwind CSS + Lucide + WCAG 2.1 AA)        |
+-----------------------------------------+-----------------------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
+------------------------------------------+ +--------------------------------------+
|            DETERMINISTIC ENGINE          | |          SERVERLESS GENAI API        |
|               (src/engine/)              | |                 (api/)               |
|------------------------------------------| |--------------------------------------|
| * Pure TypeScript, zero clock inside     | | * Server-side only with @google/genai|
| * Integer minor currency (paise/cents)   | | * Strict Zod validation & JSON Schema|
| * Largest-remainder rounding (Hamilton)  | | * Prompt-injection guard & delimiters|
| * Backward-planned timeline with delays  | | * Origin check, rate limit, size cap |
| * Catering split (veg/vegan/jain/allergy)| | * In-memory response cache & timeout |
| * Scenario B cloning & side-by-side diff | | * Deterministic offline rule fallback|
+------------------------------------------+ +--------------------------------------+
```

### The Cardinal Rule

> **"The AI never computes money or dates, and never invents prices or vendors."**

Large language models excel at semantic interpretation, cultural theme curation, and empathetic advice. They fail unpredictably at exact fractional arithmetic, calendar leap-day arithmetic, and budget preservation. Mehfil delegates all arithmetic, scheduling, and risk evaluations to pure TypeScript functions.

---

## 2. Deterministic Engine Specifications (`src/engine/`)

### 2.1 Integer Money & Largest-Remainder Rounding (`src/engine/budget.ts`)

- All monetary values are strictly represented in **integer minor units** (e.g. 60,000 INR = `6000000` paise).
- Eliminates JavaScript IEEE-754 floating-point drift (e.g., `0.1 + 0.2 !== 0.3`).
- **Hamilton-Hare (Hare-Niemeyer) Method**:
  1. Computes contingency reserve: $\text{floor}(\text{Total} \times \text{Contingency}\%)$.
  2. Available budget: $\text{Total} - \text{Contingency}$.
  3. Locked categories retain their exact user-specified amounts.
  4. Remaining budget is split among unlocked categories proportional to priority-weighted base percentages.
  5. Fractional remainders are sorted descending, distributing individual minor units until:
     $$\sum \text{Allocated Categories} + \text{Contingency} \equiv \text{Total Budget}$$

### 2.2 Backward-Planned Timeline Engine (`src/engine/timeline.ts`)

- **Zero Clock Inside**: Accepts current reference date `today: string` (ISO `YYYY-MM-DD`). Allows 100% reproducible testing.
- Target event date serves as anchor: $\text{Base Date} = \text{Event Date} - \text{Offset Days}$.
- **Topological Delay Propagation**: If prerequisite task $A$ incurs a delay of $+N$ days, dependent task $B$ automatically advances to $\max(\text{Date}_B, \text{Date}_A + 1)$.
- Flags overdue tasks relative to `today` and detects when event date delivery is compromised.

### 2.3 RSVP & Dietary Catering Split (`src/engine/rsvp.ts`)

- RSVP state: `yes` (100% attendance), `maybe` (50% heuristic buffer), `no` (0%).
- Computes catering portions for caterers: Vegetarian, Vegan, Jain (strict satvik, no root vegetables), and allergy flags (nut-free, gluten-free).

### 2.4 Community Mode Operations (`src/engine/community.ts`)

- Operational checklist for large public gatherings:
  - Volunteer shift assignments (hours, roles, confirmations).
  - Municipal permits (police, fire safety, noise pollution clearance, BBMP waste segregation).
  - Sponsor tracker (committed funds vs. realized receipts, funding gap).

### 2.5 Scenario Comparison Engine (`src/engine/scenario.ts`)

- Clones a plan into Scenario B with modified variables (e.g. downsized guests, reduced budget).
- Computes mathematical deltas: budget delta, headcount delta, per-guest cost variance, and qualitative risk indicators.

### 2.6 Export Engine (`src/engine/export.ts`)

- Serializes plan milestones into RFC 5545 `.ics` iCalendar format.
- Generates URL-safe base64 shareable links capped strictly at 32 KB with Zod schema verification on import.

---

## 3. Serverless GenAI API Architecture (`api/`)

Endpoints are hosted as Vercel serverless functions:

- `/api/parse-intake`: Converts free-text prompts into validated event parameters.
- `/api/suggest-ideas`: Curates cultural themes, activities, and budget tips.
- `/api/review-plan`: Generates risk findings and an overall health score (0–100).
- `/api/ask-planner`: Q&A grounded exclusively in plan facts.

### 3.1 Security Hardening

- **HTTP POST & JSON Only**: Rejects other verbs with `405 Method Not Allowed` and `415 Unsupported Media Type`.
- **Payload Size Cap**: Rejects bodies $> 32 \text{ KB}$ with `413 Payload Too Large`.
- **Same-Origin Verification**: Validates `Origin` and `Host` headers.
- **Sliding-Window Rate Limiting**: 30 requests per minute per IP with `Retry-After` header.
- **Prompt-Injection Neutralization**: Strips closing tags, HTML entities, and token delimiters. All untrusted text is wrapped in explicit delimiters (`<<<START_USER_INPUT>>>...<<<END_USER_INPUT>>>`) and declared as raw data to the model.

### 3.2 Offline Rule Fallback

If `GEMINI_API_KEY` is missing or the external API times out ($> 8\text{s}$), endpoints return deterministic rule-based results marked with `{ isFallback: true }`, ensuring uninterrupted planner operation.
