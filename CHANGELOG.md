# Changelog — ANSTAT AI ENGINE

All notable changes to the ANSTAT AI ENGINE codebase will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] - 2026-08-10 — Phase 5: Security Center & Autofix Engine
### Added
- **Security Command Center (`/security`)**: Posture Summary Widget (`24 / 100` Risk Score), severity breakdown, priority action items, and trigger scan modal.
- **Scans & Findings Management (`/security/scans`)**: Data table with severity, status, category, repository, and CWE/OWASP filters.
- **Finding Detail & Autofix Console (`/security/scans/[id]`)**:
  - Safe code evidence excerpt (0 `eval`, inert rendering).
  - AI vulnerability explanation (Root Cause, Impact, Recommendation).
  - 4-step Autofix & Rescan Pipeline (`Plan → Patch → Validation → Security Rescan → Resolution`).
  - **Rescan Integrity Rule**: Status transitions to `resolved` ONLY upon clean security rescan.
  - Controlled Risk Dialogs (`Accept Risk` with reason & expiration date, `Mark as False Positive`).
  - Finding Audit History stream.
- **Centralized Security Policy**: Added `getCentralizedSecurityPolicy()` helper in `lib/constants/status.ts`.
- Documentation: Added `docs/security-center.md` and `docs/security-center-release-audit.md`.

---

## [0.4.0] - 2026-08-10 — Phase 4: Code Generation Engine
### Added
- **Code Engine Command Center (`/code`)**: Active jobs metrics, completed jobs, open PRs, files changed count, and Code Job Data Table.
- **New Code Job Wizard (`/code/new`)**: 6-step creation flow with AST context budget inspector (42,800 token estimator) and quality gate configuration.
- **Operational Engineering Console (`/code/[id]`)**:
  - AI Implementation Plan with Approval / Request Changes feedback loop.
  - Inert Code Diff Viewer (Unified & Split modes, File Tree, AI explanations, `[ADD]`/`[DEL]` semantic text badges).
  - Validation Suite Gate (TypeScript `tsc`, ESLint, Jest, Next Build).
  - Static Analysis SAST Security Gate.
  - Human Review Gate & PR Creation Modal (Feature branch target only).
  - Technical Monospace Logs Viewer.
- Documentation: Added `docs/codegen.md` and `docs/codegen-release-audit.md`.

---

## [0.3.0] - 2026-08-10 — Phase 3: ProposalOS Commercial Wedge
### Added
- **Proposal Creation Wizard (`/proposals/new`)**: Brief Intake & simulated Quality Analysis Score (82% completeness check).
- **Rate-Card Driven Pricing Engine**: Auto-calculates proposal pricing based on workspace rate cards (`Role × Hours × Rate = Subtotal`).
- **3-Column Document Editor (`/proposals/[id]`)**: Section navigator, live document canvas, and AI drafting assistant with visual **Current vs Proposed** diff preview.
- **Client Handoff**: PDF/DOCX export and simulated client email delivery.
- Documentation: Added `docs/proposalos.md` and `docs/proposalos-release-audit.md`.

---

## [0.2.0] - 2026-08-10 — Phase 2: Auth, Workspace, Onboarding & Operational Dashboard
### Added
- Auth state machine (`signed_out` → `signing_in` → `authenticated` → `signing_out` → `error`).
- Auth screens (`/login`, `/signup`, `/forgot-password`).
- Workspace Switcher component (`WorkspaceSwitcher.tsx`).
- 7-step Onboarding Wizard (`/onboarding`).
- Operational Command Center (`/dashboard`).

---

## [0.1.0] - 2026-08-10 — Phase 1: Platform Foundation & Decoupled Architecture
### Added
- Next.js 16 App Router foundation with Turbopack.
- Vanilla CSS Custom Property Token System (`app/globals.css`).
- Typed domain models (`lib/types/*`) and 12 service interfaces (`lib/services/interfaces/*`).
- Service Registry Injection Pattern (`lib/services/registry.ts`).
- Deterministic mock backend (`lib/services/mock/*` & `lib/mock/seed-data.ts`).
