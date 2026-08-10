# Debugging Hub & Incident Intelligence Architecture Document — ANSTAT AI ENGINE

**Module**: Debugging Hub & Incident Intelligence (Phase 6)  
**Completion Date**: August 10, 2026  

---

## 1. Executive Summary
Debugging Hub operates as an AI-assisted incident response workspace that unifies signal collection, stack trace correlation, root-cause hypothesis generation, remediation planning, patch synthesis, validation checks, security reviews, regression verification, and GitHub Pull Request handoffs.

```
INCIDENT → SIGNALS → ROOT CAUSE → PLAN → PATCH → VALIDATION → SECURITY → REGRESSION → HUMAN REVIEW → PULL REQUEST
```

---

## 2. Core Architecture Rules
- **Delegated Service Architecture**: `DebuggingService` orchestrates existing platform services (`CodeService`, `ValidationService`, `SecurityService`, `GitHubService`, `AIService`, `UsageService`, `AuditService`) strictly via `lib/services/registry.ts`.
- **Inert Data Handling**: Stack traces, log streams, error signals, and patch diffs are handled strictly as inert data strings (`0 eval`, `0 Function()`, `0 dangerouslySetInnerHTML`).
- **Regression Verification Rule**: An incident transitions to `resolved` **ONLY** after simulated regression testing confirms the issue no longer reproduces AND validation/security gates pass cleanly.
- **PR Boundary**: Creating a PR proposes changes to a reviewable feature branch (`anstat/fix-inc-104`). Direct pushes to default `main` branch are architecturally disabled.

---

## 3. Architecture Status Mapping

| Feature Component | Status | Details |
|---|---|---|
| **Incident Model & Lifecycle** | **IMPLEMENTED** | `lib/types/debugging.ts` canonical types (`Incident`, `ErrorSignal`, `RootCauseHypothesis`, `RemediationPlan`). |
| **Debugging Service Registry** | **IMPLEMENTED** | `lib/services/interfaces/debugging.service.ts` & `MockDebuggingService`. |
| **Command Center (`/debugging`)** | **IMPLEMENTED** | Incident metrics, priority incidents, filterable incident data table. |
| **New Investigation Wizard (`/debugging/new`)** | **IMPLEMENTED** | 3-step intake, signal collection, AST context budget inspector. |
| **Flagship Debugging Console (`/debugging/[id]`)** | **IMPLEMENTED** | Stack trace viewer, monospace logs viewer, root cause hypotheses, plan approval/feedback dialog, inert text diff viewer, regression verification, PR handoff modal. |
| **Telemetry & Observability** | **MOCKED** | Signal collection, logs, and stack traces run via deterministic mock providers. |
| **Live Sentry/Datadog APIs** | **FUTURE** | OpenTelemetry/Sentry API ingestion planned for Phase 8. |

---

## 4. Verification Results
- **`npx tsc --noEmit`**: **100% Passed** (0 type errors).
- **`npx next lint`**: **100% Passed** (0 errors, 0 warnings).
- **`npx next build`**: **100% Passed** (Route count discovered: **31 routes**).
