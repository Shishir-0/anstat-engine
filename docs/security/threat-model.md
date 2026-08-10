# Comprehensive Threat Model & Security Contract — ANSTAT AI ENGINE

> **Phase 7 Blueprint Document**  
> *5 Trust Zones, Attack Surface Analysis, Mitigation Matrix, and Core Security Invariants.*

---

## 1. Five Security Trust Zones

```
ZONE 1: Browser User Interface (Untrusted)
   │
   │ HTTPS / TLS 1.3 Requests with JWT Bearer Token
   ▼
ZONE 2: Next.js API Layer / Edge (Authenticated Application Process)
   │
   │ Privileged Service Connections (Server-side Only)
   ▼
ZONE 3: PostgreSQL Database & Redis Queue (Data Boundary with RLS)
   │
   │ Worker Queue Messages
   ▼
ZONE 4: Asynchronous Background Workers (Privileged Execution)
   │
   │ Ephemeral Worker Dispatch
   ▼
ZONE 5: Execution Sandbox (Network Restricted Untrusted Container)
```

---

## 2. Security Invariants (Non-Negotiable Rules)

1. **Browser Code Execution Invariant**: Generated source code, patch diffs, and security scanner evidence are treated strictly as inert text data. The browser NEVER executes generated code.
2. **Server Execution Invariant**: Untrusted repository code or generated patches NEVER execute inside the main Next.js application process.
3. **Rescan Invariant**: AI patch generation or unit test completion CANNOT mark a security finding as resolved. Resolution requires a clean security rescan.
4. **Branch Protection Invariant**: Generated code is proposed through reviewable feature branches (`anstat/*`). Direct pushes to default `main` branch are architecturally disabled.
5. **Secret Boundary Invariant**: Privileged service keys (`SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_PRIVATE_KEY`, AI provider API keys) exist ONLY inside Zone 3/4 server environments and are NEVER exposed to Zone 1 browser clients.

---

## 3. Threat Vector & Mitigation Matrix

| Threat Category | Specific Attack Vector | Potential Impact | Architecture Mitigation Strategy |
|---|---|---|---|
| **Identity & Auth** | Credential stuffing, JWT forgery, session theft | Unauthorized workspace access | Supabase Auth with PKCE flow; server-side JWT signature verification; short-lived access tokens. |
| **Multi-Tenancy** | IDOR, `organization_id` header tampering | Cross-tenant data leakage | Server derives identity strictly from verified session token. Database Row-Level Security (RLS) enforces `organization_id = auth.jwt().org_id`. |
| **API & Data** | Parameter tampering, SQL injection, CSRF | Unauthorized state mutation | Zod schema validation on 100% of API endpoints; anti-CSRF token verification on state-changing routes; parameterized queries via ORM/PostgreSQL. |
| **AI Systems** | Prompt injection via untrusted repository files | Data exfiltration, system command override | System policy enforced via prompt isolation (System prompt > User task > Repository content as inert data). Schema validation on all AI outputs. |
| **GitHub App** | Forged webhook payloads, stolen installation tokens | Unauthorized repository access | Webhook HMAC-SHA256 signature verification (`X-Hub-Signature-256`); short-lived GitHub App installation tokens (1-hour expiry). |
| **Sandbox Run** | Container escape, host filesystem traversal, fork bombs | Server compromise, resource exhaustion | Ephemeral Docker container; network disabled (`network: off`); read-only root filesystem; non-root user; CPU (0.5 cores), memory (512MB), PID limits. |
| **Infrastructure** | Environment variable leak, exposed Redis/DB ports | Credentials exposure | Firewall (UFW) blocking public ports 3000/6379/5432; non-root deploy user; secrets managed via server environment variables. |
