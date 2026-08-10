# Row-Level Security (RLS), Authorization & Entitlement Policies — ANSTAT AI ENGINE

> **Phase 7 Blueprint Document**  
> *Database Row-Level Security Policies, Server-Side Entitlement Check Engine, RBAC Permission Matrix, and Secret Boundary Definitions.*

---

## 1. Database Row-Level Security (RLS) Policies

All 32 PostgreSQL tables in Zone 3 MUST have RLS enabled (`ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`).

### Canonical Tenant Isolation Policy Pattern
```sql
-- Helper function to extract organization_id from authenticated JWT
CREATE OR REPLACE FUNCTION public.current_organization_id() 
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'org_id', '')::UUID;
$$ LANGUAGE sql STABLE;

-- Example: RLS Policy for Security Findings Table
CREATE POLICY tenant_isolation_security_findings ON security_findings
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());
```

---

## 2. Server-Side Entitlement Check Engine

The browser UI displays usage gauges (e.g. `677 / 1,000 AI Credits`), but **ONLY** the server backend evaluates whether an operation is permitted before execution.

```
[API / Worker Request] ──> [Extract Organization ID] ──> [Query Active Subscription & Usage Counters]
                                                                     │
                                                           [Entitlement Allowed?]
                                                           ├── YES ──> Execute Operation & Deduct Usage
                                                           └── NO  ──> Throw EntitlementExceededError (HTTP 402)
```

### Server Entitlement Methods
- `canCreateProposal(orgId: string): Promise<boolean>`
- `canCreateCodeJob(orgId: string): Promise<boolean>`
- `canRunSecurityScan(orgId: string): Promise<boolean>`
- `canUseAI(orgId: string, estimatedCredits: number): Promise<boolean>`

---

## 3. RBAC Permission Matrix

| Role | Proposals | Code Generation | Security Center | Debugging Hub | GitHub Settings | Workspace Admin |
|---|---|---|---|---|---|---|
| **Owner** | Full (CRUD) | Full (CRUD) | Full (CRUD) | Full (CRUD) | Manage Apps | Full Admin |
| **Admin** | Full (CRUD) | Full (CRUD) | Full (CRUD) | Full (CRUD) | Manage Apps | Read-Only |
| **Senior Engineer** | Read-Only | Full (Create/Patch) | Triage & Autofix | Investigate & Fix | Read-Only | None |
| **Developer** | Read-Only | Create & Plan | Read-Only | Read & Investigate | Read-Only | None |
| **Viewer** | Read-Only | Read-Only | Read-Only | Read-Only | Read-Only | None |

---

## 4. Server Secret Isolation Matrix

| Secret Name | Environment Scope | Exposed to Browser? | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | **YES** | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | **YES** | Public client key (Subject to RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server Only** | **NEVER** | Privileged backend worker ops (Bypasses RLS) |
| `ANTHROPIC_API_KEY` | **Server Only** | **NEVER** | AI Gateway Claude model invocations |
| `OPENAI_API_KEY` | **Server Only** | **NEVER** | AI Gateway GPT model invocations |
| `GITHUB_APP_PRIVATE_KEY` | **Server Only** | **NEVER** | GitHub App JWT signing for installation tokens |
| `GITHUB_WEBHOOK_SECRET` | **Server Only** | **NEVER** | Webhook HMAC-SHA256 signature verification |
| `REDIS_URL` | **Server Only** | **NEVER** | Queue connection string for BullMQ workers |
