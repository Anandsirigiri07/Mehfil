# Contributing to Mehfil

Thank you for your interest in contributing to **Mehfil**!

## Code Quality Standards

1. **Deterministic Calculation**: All mathematical calculations, budget distributions, and timeline projections must reside in `src/engine/`. Components must only render state and dispatch events.
2. **Integer Minor Units**: All monetary arithmetic must use integer paise/cents.
3. **Strict TypeScript**: No `any` types; all indexed accesses are checked (`noUncheckedIndexedAccess`).
4. **File Length**: All files must stay under 250 lines for modularity.
5. **Accessibility**: Every new component must meet WCAG 2.1 AA and include tests verifying `jest-axe` compliance.

## Local Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Run validation check (typecheck, lint, format, test, coverage)
npm run check
```
