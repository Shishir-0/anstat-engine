# ANSTAT AI ENGINE — Subscription Entitlement Engine Architecture

## Overview

The **Subscription Entitlement Engine** is the centralized server-side subsystem responsible for evaluating, tracking, and atomically enforcing resource quotas, feature entitlements, and AI credit balances across all multi-tenant organizations.

```
Authenticated Request
       ↓
Server Context (auth.uid())
       ↓
Tenant Membership Check (public.memberships)
       ↓
Active Subscription Status Check (public.subscriptions)
       ↓
Plan Entitlement Limit Resolution (public.entitlements)
       ↓
Atomic Consumption Procedure (public.consume_quota_atomic)
       ↓
ALLOW / DENY (Machine-Readable Reason Code)
```

---

## 1. Structural Invariant: `PLAN ≠ PERMISSION`

ANSTAT AI ENGINE strictly separates subscription entitlements from RBAC permissions:

- **Plan Entitlements** determine workspace resource quotas (`seats`, `repositories`, `proposals`, `code_jobs`, `security_scans`, `ai_credits`).
- **RBAC Permissions** determine user action capabilities (`owner`, `admin`, `senior_engineer`, `developer`, `viewer`).

> An `owner` or `admin` cannot bypass a subscription quota limit. Conversely, upgrading to `Studio` plan does not elevate a `viewer` to an `admin`.

---

## 2. Resource Quotas & Commercial Plan Matrix

| Resource / Feature | STARTER (₹499/mo) | PRO (₹999/mo) | STUDIO (₹2,499/mo) | BUSINESS (₹5,999+/mo) |
|:---|:---|:---|:---|:---|
| **Max Seats (`seats`)** | 2 Seats | 5 Seats | 15 Seats | Custom (Unlimited) |
| **Max Repositories (`repositories`)** | 3 Repos | 10 Repos | 25 Repos | Custom (Unlimited) |
| **Monthly Proposals (`proposals`)** | 10 Proposals | 50 Proposals | 200 Proposals | Unlimited |
| **Monthly Code Jobs (`code_jobs`)** | 25 Jobs | 100 Jobs | 500 Jobs | Custom (Unlimited) |
| **Monthly Security Scans (`security_scans`)** | 10 Scans | 50 Scans | 250 Scans | Unlimited |
| **Monthly AI Credits (`ai_credits`)** | **300 Credits** | **1,000 Credits** | **3,000 Credits** | **10,000+ Credits** |

---

## 3. AI Credit Accounting Formula

Users consume abstract **AI Credits**, decoupling provider token cost variations from public subscription pricing:

$$\text{AI Credits Consumed} = \left( \frac{\text{Input Tokens} \times \$0.003}{1000} + \frac{\text{Output Tokens} \times \$0.015}{1000} \right) \times 100$$

- **Minimum Deducted**: 1 AI Credit per inference.
- **Negative Balances**: Strictly prohibited. If `remaining < credits_required`, the operation is blocked with `AI_CREDIT_LIMIT_REACHED`.

---

## 4. Tenant Membership Security & Atomic Consumption

### PostgreSQL Stored Procedures
Implemented in `supabase/migrations/0016_entitlements_atomic.sql`:

1. `public.check_quota_atomic(p_org_id, p_resource, p_amount)`
   - **Read-Only Preflight Check**: Evaluates subscription status and remaining quota for UI preflight without modifying database counters.

2. `public.consume_quota_atomic(p_org_id, p_resource, p_amount)`
   - **Authoritative Gate**: Atomically validates tenant membership, checks subscription status, verifies `used + p_amount <= limit`, and performs atomic `UPDATE` on `public.usage_counters`.
   - **Tenant Security Boundary**: Rejects any request where `auth.uid()` is not a member of `p_org_id` with `PERMISSION_DENIED` to prevent cross-tenant quota attacks.

---

## 5. Machine-Readable Reason Codes

The engine returns deterministic machine-readable reason codes upon failure:

- `SUBSCRIPTION_REQUIRED`
- `SUBSCRIPTION_EXPIRED`
- `SUBSCRIPTION_PAST_DUE`
- `RESOURCE_LIMIT_REACHED`
- `AI_CREDIT_LIMIT_REACHED`
- `SEAT_LIMIT_REACHED`
- `REPOSITORY_LIMIT_REACHED`
- `PERMISSION_DENIED`
- `ORGANIZATION_NOT_FOUND`

---

## 6. Service Architecture & Decoupling

- **Interface**: `lib/services/interfaces/entitlement.service.ts`
- **Mock Implementation**: `lib/services/mock/mock-entitlement.service.ts`
- **Production Implementation**: `lib/services/supabase/supabase-entitlement.service.ts`
- **Registry**: `lib/services/registry.ts` -> `getEntitlementService()`

All service boundaries (`ProposalService`, `CodeService`, `SecurityService`, `AIService`) invoke `getEntitlementService()` on the server side. UI components do not perform entitlement authorization.
