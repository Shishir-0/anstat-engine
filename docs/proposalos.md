# ProposalOS Architecture Document — ANSTAT AI ENGINE

**Module**: ProposalOS (Phase 3)  
**Completion Date**: August 10, 2026

---

## 1. Executive Summary
ProposalOS is the first commercially sellable product wedge inside ANSTAT AI ENGINE. It automates the end-to-end lifecycle of converting unstructured client brief inputs into rate-card backed, professional Statement of Work (SOW) proposals, interactive document editing with contextual AI diff previews, and simulated PDF/DOCX/email delivery.

---

## 2. 6-Stage User Workflow & Component Architecture
```
/proposals (Proposal List & Metrics)
      │
      ▼
/proposals/new (6-Stage Proposal Generator Wizard)
      ├── Step 1: Client Selection & Inline Client Creation
      ├── Step 2: Brief Intake (Text, Upload PDF/DOCX, Transcript) + Simulated Completeness Score
      ├── Step 3: AI Analysis Console + Live Requirement Extraction & Priority Editor
      ├── Step 4: Scope of Work, Deliverables, Milestones & Rate-Card Pricing Engine
      ├── Step 5: Document Review & 3-Column Proposal Editor (/proposals/[id])
      └── Step 6: Export (PDF / DOCX) & Client Email Delivery Modal
```

---

## 3. Rate-Card Pricing Engine Model
Unlike generic LLM wrappers that guess random pricing, ProposalOS computes commercial pricing using workspace rate card rules:
- **Role Billing Rates**: `Role x Hours x Hourly Rate = Subtotal`
- **Rate Origin Tracking**:
  - `rate_card`: Derived automatically from workspace rates (`lib/types/tenant.ts`)
  - `ai_suggested`: Suggested effort allocation
  - `manual_override`: Explicit engineer adjustment
- **Pricing Safety**: AI-suggested rates are visually highlighted and require explicit engineer approval before finalizing.

---

## 4. 3-Column Document Editor Layout (`ProposalEditorClient.tsx`)
- **Left Column**: Section Navigator (Cover, Executive Summary, Scope of Work, Deliverables, Technology Stack, Milestones, Rate-Card Pricing, Assumptions, Risks, Out of Scope, Terms, Next Steps).
- **Center Column**: Document Canvas styled as a professional business document with branded header/footer, structured section rendering, rate card pricing table, and milestone visual timeline.
- **Right Column**: Contextual AI Assistant panel with **AI Action Preview** modal displaying side-by-side **Current vs Proposed** text before applying changes.

---

## 5. Verification Results
- **`npx next build`**: **100% Passed** (30/30 static & dynamic routes compiled cleanly).
- **`npx next lint`**: **100% Passed** (0 errors, 0 warnings).
- **TypeScript Compiler**: **100% Passed** (0 errors).
- **Mobile Responsiveness**: Verified down to 360px (Section navigator collapses into drawer, pricing table converts to cards).
