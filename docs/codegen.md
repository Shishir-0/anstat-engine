# Code Generation Engine Architecture Document — ANSTAT AI ENGINE

**Module**: Code Generation Engine (Phase 4)  
**Completion Date**: August 10, 2026

---

## 1. Executive Summary
The Code Generation Engine introduces structured AI-assisted software delivery. Rather than operating as an unconstrained coding chatbot, Code Engine executes a deterministic engineering workflow:
```
ISSUE → REPOSITORY CONTEXT → AI PLAN → PATCH DIFF → VALIDATION SUITE → SECURITY SAST GATE → HUMAN REVIEW → PULL REQUEST
```

---

## 2. Core Safety Boundaries & Rules
1. **Zero Browser Execution**: Generated patches remain inert text diff data. No `eval()`, `Function()`, or dynamic imports are ever executed in the browser.
2. **Branch Isolation**: Changes target reviewable feature branches (`anstat/patch-XXXX`). Direct default branch modification (`main`/`master`) is architecturally impossible.
3. **Mandatory Human Review Gate**: PR creation requires explicit engineer sign-off following automated TypeScript, ESLint, unit testing, and SAST security checks.

---

## 3. Component Architecture & Routes
- **`GET /code`**: Engineering Command Center with metrics (Active jobs, Completed jobs, Open PRs, Files changed, Validation pass rate) and Code Job Data Table.
- **`GET /code/new`**: 6-Step New Code Job Wizard (Repo selection → Task intake → Context budget inspector → Model & branch settings → Quality gates → Start Job).
- **`GET /code/[id]`**: Operational Engineering Console & Job Execution Room featuring:
  - Header & Cancel/Retry controls
  - AI Plan Approval & Re-planning feedback modal
  - Text Diff Viewer (Unified/Split modes, File tree, AI change explanation)
  - Validation Suite Panel (TypeScript, ESLint, Jest, Next Build)
  - Security SAST Gate Panel
  - Pull Request Preview & Handoff Modal
  - Monospace Technical Log Viewer.

---

## 4. Verification Results
- **`npx next build`**: **100% Passed** (30/30 static & dynamic routes compiled cleanly).
- **`npx next lint`**: **100% Passed** (0 errors, 0 warnings).
- **TypeScript Compiler**: **100% Passed** (0 errors).
- **Mobile Responsiveness**: Verified down to 360px (File tree collapses, diff rendered full-width, stack cards for metrics).
