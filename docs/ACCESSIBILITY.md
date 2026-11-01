# Mehfil Accessibility Compliance (WCAG 2.1 AA)

> **Accessibility is a first-class engineering requirement.** Mehfil is audited and verified to meet all Web Content Accessibility Guidelines (WCAG) 2.1 Level AA criteria.

---

## 1. Compliance Checklist & Implementation Evidence

| WCAG Criteria                         | Requirement                        | Mehfil Implementation & Code Location                                                                                                                                                           |
| :------------------------------------ | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3.1.1 Language of Page**            | `lang` attribute on root `<html>`  | Set to `<html lang="en">` in [index.html](file:///c:/Users/anand/Mehfil/index.html#L2).                                                                                                         |
| **2.4.1 Bypass Blocks**               | Skip to main content link          | Accessible skip link at top of page in [SkipLink.tsx](file:///c:/Users/anand/Mehfil/src/components/common/SkipLink.tsx#L6-L13).                                                                 |
| **1.3.1 Info & Relationships**        | Semantic landmarks                 | `<header>`, `<nav role="tablist">`, `<main id="main-content">`, `<footer>`, and `<section aria-labelledby="...">` in [App.tsx](file:///c:/Users/anand/Mehfil/src/App.tsx#L55-L160).             |
| **3.3.2 Labels or Instructions**      | Explicit labels on all form inputs | Every `<input>` and `<select>` has a matching `<label htmlFor="...">` across all intake, budget, and RSVP forms.                                                                                |
| **3.3.1 Error Identification**        | Focusable Error Summary            | [ErrorSummary.tsx](file:///c:/Users/anand/Mehfil/src/components/common/ErrorSummary.tsx#L18-L34) has `tabIndex={-1}`, `role="alert"`, and shifts focus automatically upon validation errors.    |
| **2.4.7 Focus Visible**               | Distinct keyboard focus indicator  | High-contrast outline `outline: 2px solid #d75664; outline-offset: 2px` via `:focus-visible` in [index.css](file:///c:/Users/anand/Mehfil/src/index.css#L13-L16).                               |
| **2.1.1 Keyboard**                    | Keyboard-operable tabs & controls  | Tab buttons support standard keyboard navigation with `role="tab"`, `aria-selected`, and Enter/Space activation.                                                                                |
| **4.1.3 Status Messages**             | Asynchronous status announcements  | `aria-live="polite"` applied to the Gemini Assistant drawer output and toast container in [ToastContainer.tsx](file:///c:/Users/anand/Mehfil/src/components/common/ToastContainer.tsx#L17-L21). |
| **1.4.1 Use of Color**                | Status not conveyed by color alone | Every status combines a semantic text badge with an identifiable Lucide SVG icon (e.g., `Clock` for Pending, `CheckCircle` for Completed, `AlertTriangle` for Delayed).                         |
| **2.5.5 Target Size**                 | Minimum 44×44px touch targets      | Interactive buttons and controls use `.touch-target` with `min-height: 44px` and `min-width: 44px` defined in [index.css](file:///c:/Users/anand/Mehfil/src/index.css#L29-L35).                 |
| **2.3.3 Animation from Interactions** | Respects reduced motion            | `@media (prefers-reduced-motion: reduce)` resets transition and animation durations to `0.01ms` in [index.css](file:///c:/Users/anand/Mehfil/src/index.css#L19-L27).                            |
| **1.4.3 Contrast (Minimum)**          | $\ge 4.5:1$ text contrast ratio    | High-contrast palette in Tailwind with verified light mode (`stone-900` on `stone-50`) and dark mode (`stone-100` on `stone-950`). Audited by `jest-axe`.                                       |
| **1.4.10 Reflow**                     | Responsive down to 320px           | No horizontal scrolling at 320px CSS width. Fluid layout verified in [core-flow.spec.ts](file:///c:/Users/anand/Mehfil/tests/e2e/core-flow.spec.ts#L67-L77).                                    |

---

## 2. Automated Test Verification

Mehfil runs automated axe tests during continuous integration:

- **Component Level**: `jest-axe` in Vitest checks rendered components for light and dark themes.
- **End-to-End Level**: `@axe-core/playwright` audits full page states (initial intake, celebration dashboard, modal dialogs).
