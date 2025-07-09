# Refactor Opportunities

_Last updated: 2025-07-08_

This document tracks potential refactors and tech-debt clean-ups discovered during audits and development.  Each item should eventually be promoted to the main roadmap or a dedicated GitHub issue.

---

## 1. Loader & Include System

| Priority | Area | Opportunity |
|---|---|---|
| 🟢 | generatorLoader.js | Extract **`resolveIncludes`** into its own module (e.g. `src/utils/resolveIncludes.js`) so it can be unit-tested in isolation and reused by other loaders. |
| 🟡 | resolveIncludes | Add explicit **circular-include guard** (depth-limited or visited-set) – current implementation could recurse infinitely. Unit tests partially drafted in `tests/generatorLoader_includes.test.js`. |
| 🟢 | Include pattern | Support asynchronous includes (e.g. network `fetch`) by returning `Promise` from resolver and awaiting in loader. |

## 2. GeneratorLoader Structure

| Priority | Area | Opportunity |
|---|---|---|
| 🟢 | generatorLoader.js | Extract **`fetchGeneratorSpec()`** helper (wraps `fetch()` + error handling). |
| 🟢 | generatorLoader.js | Extract **`registerGenerator()`** utility – aligns with plan.md section 3. |
| 🟡 | Error handling | Replace nested callbacks with `async/await` for readability. |

## 3. UI – Advanced Options Modal

| Priority | Area | Opportunity |
|---|---|---|
| 🟢 | advancedModal.js | Move injected `<style>` block (currently inside JS) into `src/styles/advancedModal.css`; import via Vite for better caching and theming. |
| 🟡 | advancedModal.js | **Throttle / debounce** successive `buildModal()` calls to prevent unnecessary DOM churn when many locks are toggled quickly. |

## 4. Engine Core

| Priority | Area | Opportunity |
|---|---|---|
| 🟢 | JS & Python parity | Extract shared **weighted-random** helper into dedicated module so both implementations stay in sync. |
| 🟡 | State encapsulation | Consider making internal engine state private (`#private` fields or closures) to prevent accidental external mutation. |

## 5. Build & Tooling

| Priority | Area | Opportunity |
|---|---|---|
| 🟡 | Vite | Add **local bundle-size check** (`npm run size`) mirroring CI step to catch regressions earlier. |
| 🟢 | ESLint | Introduce rule to forbid inline CSS in JS (`no-inline-styles`) to reinforce modal-style move. |

Legend: 🟢 = quick win / high value · 🟡 = medium effort · 🔴 = larger redesign
