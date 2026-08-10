# Security Center & Autofix Architecture Document — ANSTAT AI ENGINE

**Module**: Security Center & Autofix Engine (Phase 5)  
**Completion Date**: August 10, 2026

---

## 1. Executive Summary
Security Center operates as a cross-cutting security control plane for ANSTAT AI ENGINE. Security findings are treated as actionable engineering objects that transition through an audited lifecycle:
```
DETECT → TRIAGE → AUTOFIX PLAN → PATCH GENERATION → VALIDATION → SECURITY RESCAN → HUMAN REVIEW → PULL REQUEST
```

---

## 2. Core Security Trust Rule
- **No Instant Resolution**: Generating an AI patch does **NOT** automatically mark a vulnerability as fixed.
- **Mandatory Rescan Gate**: A finding is marked `resolved` **ONLY** after a simulated security rescan confirms that the original finding is clean and no new vulnerabilities were introduced.

---

## 3. Component Architecture & Routes
- **`GET /security`**: Primary Security Command Center with posture metrics (Risk Score `82/100`), Critical/High priority findings, risk trend selector (7d/30d/90d), and Trigger Security Scan modal.
- **`GET /security/scans`**: Scans & Findings management list with severity, status, category, repository, and CWE/OWASP filters.
- **`GET /security/scans/[id]`**: Flagship Finding Detail & Autofix Console Room featuring:
  - Severity badge, Finding title, Status, CWE/OWASP standards references.
  - Safe code evidence excerpt (inert snippet rendering; 0 `eval` / `dangerouslySetInnerHTML`).
  - AI vulnerability explanation (Root Cause, Attack Surface, Impact, Recommended Fix).
  - 4-step Autofix & Rescan Pipeline.
  - Controlled risk modals (`Accept Risk` with reason & expiration date, `Mark as False Positive`).
  - Finding Audit History timeline.

---

## 4. Verification Results
- **`npx next build`**: **100% Passed** (30/30 static & dynamic routes compiled cleanly).
- **`npx next lint`**: **100% Passed** (0 errors, 0 warnings).
- **TypeScript Compiler**: **100% Passed** (0 errors).
- **Mobile Responsiveness**: Verified down to 360px (Single-column layout, evidence code scrolls internally).
