# Phase 2 Completion Architecture Document — ANSTAT AI ENGINE

**Phase**: Phase 2 — Authentication UI, Workspace Identity, Onboarding Wizard & Operational Command Center  
**Completion Date**: August 10, 2026

---

## 1. Auth State Architecture
The frontend manages auth states via the typed `AuthService` contract (`lib/services/interfaces/auth.service.ts`):
- States: `signed_out` -> `signing_in` -> `authenticated` -> `signing_out` -> `error`
- Demo Session: `demo@anstat.ai` (Shishir Kumar / Owner role)
- Operations: `login()`, `signup()`, `logout()`, `resetPassword()`, `switchWorkspace()`
- Disclaimer: Frontend auth state is purely UX session persistence; actual authorization will be enforced server-side upon Supabase integration in Phase 10.

---

## 2. Workspace Identity & Switcher Model
- Multi-workspace dropdown switcher component (`components/layout/WorkspaceSwitcher.tsx`) integrated directly into the sidebar.
- Metadata tracked: Workspace Name, Slug, Logo, Industry, Currency, Timezone, Rate Card, and Monthly AI Budget.
- Interactive workspace creation dialog with instant switching between `Northstar Studio` and `Personal Dev Workspace`.

---

## 3. 7-Step Onboarding Wizard (`/onboarding`)
Full progressive wizard guiding agency teams through initial setup:
1. **Welcome**: Product capabilities overview.
2. **Workspace Identity**: Studio name, Industry, Website, Country, Currency, and Live Preview.
3. **Profile**: Full Name, Role selection (Agency Owner, Architect, Senior Dev, PM, Founder).
4. **Rate Card Configuration**: Default hourly rates for ProposalOS calculations + sample team monthly rate preview.
5. **AI Preferences**: Model selection using `AIModel` domain models (`Claude 3.5 Sonnet`, `GPT-4o`, `ANSTAT Code Engine V2`).
6. **GitHub Integration (Simulated)**: Permissions overview & mock authorization trigger.
7. **Complete**: Summary card, completion state, and direct navigation to Dashboard Command Center.

---

## 4. Operational Dashboard Command Center (`/dashboard`)
Refined cockpit answering all operational questions in a single surface:
- **Header**: Dynamic greeting + contextual CTAs (`+ New Proposal`, `Generate Code`, `Run Security Scan`).
- **Attention Required Section**: Alert items requiring engineer sign-off (e.g. High severity security findings, pending PR reviews).
- **Executive Metrics**: Proposals Generated, Won Proposal Value, Active AI Jobs, Open PRs, and Monthly AI Spend (with trend badges).
- **Active AI Jobs Panel**: Live progress indicators, elapsed duration, and worker steps.
- **Security Posture Summary**: Risk score gauge (e.g. 24/100 Low Risk) with one-click navigation to Security Center.
- **AI Usage Budget Gauge**: Visual quota progress bar with threshold alert states (<70%, 70-85%, 85-95%, >95%).
- **Delivery Quick Actions**: Route triggers to New Proposal, Code Gen, Security Scan, Debug Error, and Deployment.
- **Recent Delivery Stream**: Chronological events driven by `AuditEvent` model.

---

## 5. Verification & Quality Gate Results
- **`npx next build`**: **100% Passed** (30/30 static & dynamic routes compiled cleanly).
- **`npx next lint`**: **100% Passed** (0 errors, 0 warnings).
- **TypeScript Compiler**: **100% Passed** (Strict type compliance across all components and services).
- **Responsiveness**: Verified down to 360px without horizontal overflow.
