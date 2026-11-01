# Mehfil Security Policy & Threat Model

> **Hardened Architecture for PromptWars Challenge 5**

---

## 1. Threat Model & Mitigations

### 1.1 API Key Compromise

- **Risk**: Exposure of Gemini API credentials via client-side bundles or source code leaks.
- **Mitigation**:
  - `GEMINI_API_KEY` is exclusively consumed inside `/api/` serverless functions.
  - Client application bundles contain zero references to backend API credentials.
  - `.env` is strictly gitignored; only sanitized `.env.example` is committed.

### 1.2 Prompt Injection & Jailbreaking

- **Risk**: Adversarial text in user prompts manipulating the language model into executing unwanted instructions, fabricating vendor rates, or bypassing business logic.
- **Mitigation**:
  - **Sanitization**: Strips HTML tags, `<script>` tags, control tokens (`<<<`, `>>>`), and instruction delimiters (`[INST]`).
  - **Data Boundary Encapsulation**: Untrusted user text is packaged inside explicit data boundaries:
    ```text
    <<<START_USER_INPUT>>>
    [Sanitized User Prompt]
    <<<END_USER_INPUT>>>
    ```
  - **Schema Enforcement**: Outputs are parsed through strict Zod schemas with disallowed extra fields and validated primitive types.
  - **Architectural Guard**: The LLM is strictly forbidden from calculating dates or currency numbers; all arithmetic is performed by the deterministic engine.

### 1.3 Denial of Service & Resource Exhaustion

- **Risk**: Large payload submissions, infinite loops, or request flooding consuming serverless credits.
- **Mitigation**:
  - **Payload Size Cap**: Request bodies exceeding $32\text{ KB}$ are rejected with `413 Payload Too Large`.
  - **Per-IP Rate Limiting**: Sliding-window rate limiter limits clients to 30 requests per minute with a `Retry-After` header on `429`.
  - **Server-Side Caching**: Fast in-memory cache returns cached outputs for identical inputs (`X-Cache: HIT`), eliminating redundant LLM invocations.
  - **Execution Timeouts**: All GenAI operations enforce an 8-second timeout via `Promise.race`, falling back to deterministic heuristics.

### 1.4 Cross-Site Scripting (XSS) & Clickjacking

- **Risk**: Malicious scripts executed in the user's browser context.
- **Mitigation**:
  - Zero usage of `dangerouslySetInnerHTML` across the entire codebase.
  - Strict Content Security Policy (CSP) defined in [vercel.json](./vercel.json):
    - `default-src 'self'`
    - `script-src 'self'`
    - `style-src 'self'`
    - `object-src 'none'`
    - `frame-ancestors 'none'`
  - Hardened HTTP headers:
    - `X-Frame-Options: DENY`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
    - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

---

## 2. Dependency Hygiene

- All packages audited against known CVEs.
- Automated vulnerability scanning runs via continuous integration.
