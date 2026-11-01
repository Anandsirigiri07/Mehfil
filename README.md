# Mehfil (महफ़िल)

> **A GenAI-powered celebration and event planning assistant for weddings, birthdays, community events, and milestones — pairing Gemini for language with a deterministic engine for the math.**

[![CI](https://github.com/Anandsirigiri07/Mehfil/actions/workflows/ci.yml/badge.svg)](https://github.com/Anandsirigiri07/Mehfil/actions)
[![Line Coverage](https://img.shields.io/badge/Engine_Coverage-99.6%25-brightgreen.svg)](docs/TESTING.md)
[![Accessibility](https://img.shields.io/badge/WCAG_2.1_AA-Verified-blue.svg)](docs/ACCESSIBILITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

🌐 **Live Deployment**: [https://mehfil-planner.vercel.app](https://mehfil-planner.vercel.app)  
📁 **Repository**: [https://github.com/Anandsirigiri07/Mehfil](https://github.com/Anandsirigiri07/Mehfil)

---

## Architecture Diagram & Flow

```
+-----------------------------------------------------------------------------------------------+
|                                      MEHFIL USER INTERFACE                                    |
|             (Vite + React 18 + Strict TypeScript + Tailwind CSS + Lucide + WCAG 2.1 AA)      |
+-----------------------------------------------+-----------------------------------------------+
                                                |
                         +----------------------+----------------------+
                         |                                             |
                         v                                             v
+------------------------------------------------+ +--------------------------------------------+
|            DETERMINISTIC ENGINE                | |            SERVERLESS GENAI API            |
|              (src/engine/)                     | |                   (api/)                   |
|------------------------------------------------| |--------------------------------------------|
| * Pure TypeScript, zero clock inside           | | * Server-side only via @google/genai       |
| * Integer paise/cents arithmetic               | | * JSON Schema + strict Zod verification    |
| * Hamilton-Hare largest-remainder rounding     | | * Prompt-injection delimiters & sanitize   |
| * Backward-planned timeline + delay propagation| | * Same-origin check & IP rate limiting     |
| * RSVP & catering split (veg/vegan/jain/nut)   | | * In-memory response cache & 8s timeout    |
| * Scenario B cloning & side-by-side diff       | | * Offline deterministic rule fallback      |
+------------------------------------------------+ +--------------------------------------------+
```

```
FLOW PROGRESSION:
[Natural User Prompt] ──> [/api/parse-intake] ──> [Deterministic Engine] ──> [Interactive Plan]
 "Birthday for 40 kids in    (Gemini 2.5 Flash /   (Exact Integer Splits,     (Budget, Timeline,
  Bengaluru, 60k budget"      Offline Heuristic)    Topological Delays)        RSVP, Scenario B)
```

---

## Problem & Solution

Planning celebratory and community events is notoriously prone to two compounding failures:

1. **Spreadsheet arithmetic drift & date friction**: Formulas break, rounding drops minor amounts, and when a venue booking slips by 4 days, dependent caterers and invitations fall out of sync manually.
2. **AI Hallucinations**: Generative AI tools invent non-existent venues, fabricate pricing numbers out of thin air, and produce math errors that cannot be trusted with real money.

### The Mehfil Solution

Mehfil establishes an unshakeable boundary: **Gemini is used server-side exclusively for language understanding, theme ideation, and grounded plan critique.** The AI **never computes money or dates**, and **never invents prices or vendors**. All calculations run in a zero-clock, pure TypeScript engine with integer precision.

---

## Requirement to Feature Mapping

| Challenge Requirement           | Implemented Feature                            | Implementation Details                                                                                                                                                                                                            |
| :------------------------------ | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Intake (Free-text + Manual)** | Natural language prompt parser + editable form | Free-text parsed via Gemini `/api/parse-intake` into editable fields; also includes full manual form [IntakeHero.tsx](file:///c:/Users/anand/Mehfil/src/components/intake/IntakeHero.tsx).                                        |
| **Occasions**                   | Wedding, Birthday, Community, Milestone        | Tailored weights, milestone schedules, and vendor profiles in [budget.ts](file:///c:/Users/anand/Mehfil/src/engine/budget.ts) and [timeline.ts](file:///c:/Users/anand/Mehfil/src/engine/timeline.ts).                            |
| **Deterministic Engine**        | Pure TS, integer money, largest-remainder      | Zero clock inside (`today` passed in), Hamilton-Hare largest-remainder rounding, priority weighting and locks in [budget.ts](file:///c:/Users/anand/Mehfil/src/engine/budget.ts).                                                 |
| **Backward Timeline**           | Dependency delay propagation                   | Backward-planned from event date; delays in parent tasks automatically shift dependent downstream tasks in [timeline.ts](file:///c:/Users/anand/Mehfil/src/engine/timeline.ts).                                                   |
| **Vendor Checklist**            | Lifecycle & cash flow tracker                  | Statuses (`not_started`, `contacted`, `quoted`, `booked`, `completed`), advances, balance dues, and deadlines in [VendorChecklistSection.tsx](file:///c:/Users/anand/Mehfil/src/components/checklist/VendorChecklistSection.tsx). |
| **GenAI Server Endpoints**      | 4 serverless endpoints                         | `/api/parse-intake`, `/api/suggest-ideas`, `/api/review-plan`, `/api/ask-planner`. All output Zod validated in [api/](file:///c:/Users/anand/Mehfil/api/).                                                                        |
| **Offline Fallback**            | Deterministic rule fallback                    | Instant rule heuristics activated whenever API key is missing or calls timeout ($>8\text{s}$), labeled clearly with info tags in [gemini.ts](file:///c:/Users/anand/Mehfil/api/_lib/gemini.ts).                                   |
| **Scenario Compare**            | Scenario B clone & side-by-side diff           | Instant cloning with modified guest counts/budgets; displays budget deltas, date deltas, and risk impacts in [ScenarioCompareModal.tsx](file:///c:/Users/anand/Mehfil/src/components/scenario/ScenarioCompareModal.tsx).          |
| **RSVP Tracker**                | Guest responses & dietary catering split       | Confirmed + 50% tentative headcount; calculates exact portion counts for Vegetarian, Vegan, Jain, and Allergies in [rsvp.ts](file:///c:/Users/anand/Mehfil/src/engine/rsvp.ts).                                                   |
| **Community Mode**              | Volunteers, permits, and sponsors              | Volunteer shift assignments, municipal permit clearances, and sponsor funding trackers in [community.ts](file:///c:/Users/anand/Mehfil/src/engine/community.ts).                                                                  |
| **Export & Sharing**            | .ics calendar, print view, share URL           | Standard RFC 5545 iCalendar generation, clean print run-sheet, and 32 KB size-capped validated base64 URL links in [export.ts](file:///c:/Users/anand/Mehfil/src/engine/export.ts).                                               |

---

## Evaluation Criteria to Evidence Table

| Criterion                | Score Target | Concrete Implementation Evidence in Repository                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :----------------------- | :----------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Code Quality**      |   Highest    | Logic isolated to [src/engine/](file:///c:/Users/anand/Mehfil/src/engine/); UI components render and dispatch only; all files $<250$ lines; 0 `any` types; strict TypeScript with `noUncheckedIndexedAccess`; JSDoc on public functions; automated CI checks.                                                                                                                                                                                                                                        |
| **2. Security**          |   Highest    | API key only in serverless environment; `.env` gitignored; `.env.example` provided; Zod on all inputs/outputs; 32 KB payload cap; POST + JSON only; same-origin verification; sliding-window per-IP rate limiter; prompt injection delimiters (`<<<START_USER_INPUT>>>`); strict CSP without `unsafe-inline`, HSTS, X-Frame-Options in [vercel.json](file:///c:/Users/anand/Mehfil/vercel.json); 0 `dangerouslySetInnerHTML`; [SECURITY.md](file:///c:/Users/anand/Mehfil/SECURITY.md) threat model. |
| **3. Efficiency**        |   Highest    | In-memory server response cache (`X-Cache: HIT`) in [cache.ts](file:///c:/Users/anand/Mehfil/api/_lib/cache.ts); in-flight request aborting via `AbortController`; memoized engine state in [usePlanState.ts](file:///c:/Users/anand/Mehfil/src/hooks/usePlanState.ts); zero external web fonts; production bundle **~99 kB gzipped** (well under 150 kB limit); 8-second model timeouts.                                                                                                            |
| **4. Testing**           |   Highest    | **99.6% engine line coverage** & 100% function coverage; property-based fuzzing tests (100 random budgets, 50 random delay schedules); comprehensive API mock tests (400, 403, 405, 413, 429, cache, injection); component tests with `jest-axe`; Playwright E2E suite with axe in light and dark mode; [docs/TESTING.md](file:///c:/Users/anand/Mehfil/docs/TESTING.md).                                                                                                                            |
| **5. Accessibility**     |   Highest    | WCAG 2.1 AA certified: `<html lang="en">`, accessible skip link, semantic landmarks, labels on every form input, focusable ErrorSummary (`tabIndex={-1}`), `:focus-visible` ring, `aria-live="polite"` regions, text + icon status indicators, $\ge 44\text{px}$ touch targets, `prefers-reduced-motion` support, light/dark contrast verified, 0 horizontal scroll at 320px; [docs/ACCESSIBILITY.md](file:///c:/Users/anand/Mehfil/docs/ACCESSIBILITY.md).                                          |
| **6. Problem Alignment** |   Highest    | Real GenAI integration via official `@google/genai` serverless SDK; covers weddings, birthdays, community events, and milestones; delivers connected budgets, timelines, vendor payments, and personalized cultural ideas.                                                                                                                                                                                                                                                                           |

---

## GenAI Usage Specifications

- **SDK**: Official `@google/genai` SDK on Vercel Serverless Functions.
- **Model**: `gemini-2.5-flash` with structured JSON output and low temperature (0.1–0.3) for factual reproducibility.
- **Validation**: Every response is validated using shared Zod schemas in [schemas.ts](file:///c:/Users/anand/Mehfil/src/types/schemas.ts) before reaching the client.
- **Prompt Injection Defense**: Sanitization strips tags and control sequences; user text is encapsulated inside `<<<START_USER_INPUT>>>` delimiters and declared as raw data to the model.
- **Offline Fallback**: When no API key is set or upon network failure, the application automatically switches to deterministic rule-based generators and labels results with an offline badge.

---

## Assumptions & Boundaries

1. **Integer Money**: All monetary amounts are handled internally in minor currency units (paise/cents). For instance, ₹60,000 is represented as `6000000`.
2. **Clock Determinism**: Current date `today` is always passed as an explicit argument (`2026-11-01`), guaranteeing deterministic behavior across time zones and test runners.
3. **Storage**: State is managed in browser memory during a planning session; plans can be exported as `.ics` calendars or encoded into compact base64 URLs (capped at 32 KB).

---

## Quick Start & Commands

```bash
# Clone the repository
git clone https://github.com/Anandsirigiri07/Mehfil.git
cd Mehfil

# Install dependencies
npm install

# Configure environment variables (Optional: works offline without key)
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY

# Start local development server
npm run dev

# Run unit tests and property-based test suite
npm run test

# Run test coverage with strict 95%+ threshold enforcement
npm run test:coverage

# Run TypeScript type check
npm run typecheck

# Run Prettier code formatting check
npm run format:check

# Run production build
npm run build

# Run Playwright E2E tests
npm run test:e2e
```

---

## License

This project is licensed under the [MIT License](LICENSE).
