# ANSTAT AI ENGINE

> **Production-Grade AI-Native Software Delivery Platform**  
> *Architected with Next.js App Router, Decoupled Typed Service Layer, and Strict Engineering Trust Boundaries.*

---

## ⚡ Executive Summary

**ANSTAT AI ENGINE** is an AI-native software delivery platform designed for engineering agencies, software studios, and SaaS teams. It unifies commercial deliverables, AI code generation, and automated security posture management into a single operational cockpit.

> **Architecture Status**: This repository represents the complete **Frontend Product Experience & Decoupled Service Layer** (Phases 1–5 Approved). All backend services, AI models, security scanners, and GitHub integrations currently operate via deterministic, strongly typed mock services (`lib/services/mock/*`) behind an injected service registry (`lib/services/registry.ts`).

---

## 🚀 Key Product Modules

### 1. ProposalOS (Commercial Wedge)
- **Brief Intake & AI Analysis**: Upload client briefs, transcripts, or RFPs; receives an automated brief quality assessment (completeness score).
- **Rate-Card Driven Pricing**: Calculates SOW pricing based on workspace rate cards (`Role × Hours × Rate = Subtotal`). AI suggestions cannot overwrite configured rates.
- **3-Column Document Editor**: Side-by-side section navigator, live document canvas, and AI drafting assistant with visual **Current vs Proposed** diff preview.
- **Client-Ready Export**: PDF/DOCX export and simulated client email delivery.

### 2. Code Generation Engine (Assisted Delivery)
- **Engineering Task Intake**: Repository selector, AST token budget inspector (42,800 context token estimator), and model selector.
- **AI Implementation Planner**: Multi-step implementation plan with engineer approval and re-planning feedback loop.
- **Inert Code Diff Viewer**: Unified and Split diff modes with explicit semantic text badges (`[ADD]`, `[DEL]`) and AI change explanations. Code is treated as data—never executed in browser.
- **Mandatory Quality Gates**: TypeScript compilation, ESLint, Jest unit tests, Next.js build, and Static Security SAST scans.
- **Review & PR Handoff**: Proposes changes to reviewable feature branches (e.g. `anstat/autofix-rbac-104`). Direct pushes to default `main` are architecturally disabled.

### 3. Security Center & Autofix Engine (Cross-Cutting Control Plane)
- **Security Posture Score**: Risk score gauge (`24 / 100`) and severity breakdown across Critical, High, Medium, and Low findings.
- **Actionable Findings**: Canonical vulnerability objects (`SecurityFinding`) mapping to CWE (`CWE-352`) and OWASP (`OWASP A01:2021`) standards.
- **4-Step Autofix & Rescan Pipeline**: `Plan → Patch → Validation → Security Rescan → Resolution`.
- **Rescan Integrity Rule**: A finding is marked `resolved` **ONLY** after a simulated security rescan verifies that the vulnerability is clean and no new findings were introduced.
- **Controlled Risk Management**: Support for `Accept Risk` (with business justification & expiration date) and `Mark as False Positive` without purging audit trails.

---

## 🏛️ Frontend Architecture & Service Decoupling

```
┌─────────────────────────────────────────────────────────────────┐
│                      ANSTAT UI COMPONENTS                       │
├─────────────────────────────────────────────────────────────────┤
│  ProposalOS    │    Code Engine    │     Security Center        │
└───────┬─────────────────────┬───────────────────┬───────────────┘
        │                     │                   │
        ▼                     ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE REGISTRY FACTORY                     │
│                    (lib/services/registry.ts)                   │
├─────────────────────────────────────────────────────────────────┤
│  getProposalService() │ getCodeService() │ getSecurityService() │
└───────┬─────────────────────┬───────────────────┬───────────────┘
        │                     │                   │
        ▼                     ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TYPED SERVICE CONTRACTS                      │
│                   (lib/services/interfaces/*)                   │
├─────────────────────────────────────────────────────────────────┤
│  Mock Implementations (Current) │ Real Backend API (Phase 7-10)  │
└─────────────────────────────────────────────────────────────────┘
```

The application UI strictly consumes services via `ServiceRegistry`. UI components **NEVER** import mock singletons directly or perform raw `fetch()` calls. Connecting real backend infrastructure in future phases requires zero frontend component redesign.

---

## 🛠️ Tech Stack & Deployment

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Vanilla CSS Custom Property Token System (`app/globals.css`)
- **Icons**: Lucide React
- **Target Deployment**: Node.js Standalone Server (Hostinger VPS / Custom Linux container)

---

## 🚦 Getting Started (Local Development)

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or later

### Installation
```bash
# Clone the repository
git clone https://github.com/Shishir-0/anstat-engine.git
cd anstat-engine

# Install dependencies
npm install

# Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the platform.

### Verification & Automated Checks
```bash
# Run ESLint
npm run lint

# Run TypeScript compilation check
npx tsc --noEmit

# Run Next.js production build
npm run build
```

---

## 📑 Documentation Directory

- [`docs/architecture/frontend-architecture.md`](file:///c:/Users/shish/OneDrive/Desktop/ai-engine/docs/architecture/frontend-architecture.md): Complete design system, token definitions, and route hierarchy.
- [`docs/backend-integration-map.md`](file:///c:/Users/shish/OneDrive/Desktop/ai-engine/docs/backend-integration-map.md): Interface contracts and mapping for future backend connections.
- [`docs/proposalos-release-audit.md`](file:///c:/Users/shish/OneDrive/Desktop/ai-engine/docs/proposalos-release-audit.md): Release audit report for ProposalOS (Phase 3).
- [`docs/codegen-release-audit.md`](file:///c:/Users/shish/OneDrive/Desktop/ai-engine/docs/codegen-release-audit.md): Release audit report for Code Engine (Phase 4).
- [`docs/security-center-release-audit.md`](file:///c:/Users/shish/OneDrive/Desktop/ai-engine/docs/security-center-release-audit.md): Release audit report for Security Center (Phase 5).

---

## 🛡️ Security & Privacy Notice

This repository contains **NO** live API keys, database credentials, secret keys, or cloud platform access tokens. All security scanners, execution sandboxes, and AI integrations are simulated through deterministic mock contracts.

---

## 📄 License
Commercial Product Source Code — All Rights Reserved by ANSTAT AI ENGINE.
