# Production PostgreSQL, Supabase & RLS Database Implementation Guide

**Module**: Database Foundation (Phase 7 Step 2)  
**Completion Date**: August 10, 2026  

---

## 1. Executive Summary
This document provides the definitive implementation guide for the **Production PostgreSQL & Supabase Database Layer** of **ANSTAT AI ENGINE**.

The database persistence layer implements all **32 Canonical Relational Tables**, domain state machine enums, foreign keys, numeric monetary precision (`numeric(12,2)` / `numeric(12,4)`), security context helper functions, Row-Level Security (RLS) tenant isolation policies, B-tree performance indexes, and seed baseline data for the four commercial tiers.

---

## 2. Versioned Migration Inventory (`supabase/migrations/`)

| Migration File | Primary Responsibility & Content |
|---|---|
| `0001_extensions.sql` | Enables PostgreSQL extensions `pgcrypto` (UUID generation) and `pg_trgm` (text search). |
| `0002_enums.sql` | Defines domain state machine enums (`user_role`, `subscription_status`, `proposal_status`, `finding_status`, `incident_status`, `job_status`, `severity_level`, `log_level`, `incident_source`). |
| `0003_core_identity.sql` | Implements `organizations`, `profiles` (1:1 with `auth.users`), and `memberships` (with unique compound constraint `(organization_id, user_id)`). |
| `0004_billing.sql` | Implements commercial billing tables (`plans`, `subscriptions`, `subscription_events`, `entitlements`, `billing_customers`, `invoices`, `usage_counters`, `payment_webhook_events`). Idempotency key `event_id` UNIQUE constraint. |
| `0005_proposals.sql` | Implements ProposalOS tables (`clients`, `proposals`, `proposal_versions`). Compound foreign key `(organization_id, client_id)` ensures org integrity. |
| `0006_github.sql` | Implements Version Control tables (`github_installations`, `repositories`, `pull_requests`). |
| `0007_codegen.sql` | Implements Code Generation tables (`code_jobs`, `code_job_events`, `validation_results`). `estimated_cost_usd` uses exact `numeric(12,4)`. |
| `0008_security.sql` | Implements Security Control Plane tables (`security_scans`, `security_findings`). |
| `0009_debugging.sql` | Implements Debugging Hub tables (`incidents`, `incident_signals`, `incident_hypotheses`). |
| `0010_jobs_audit_usage.sql` | Implements Universal Platform infrastructure (`jobs`, `job_events`, `audit_events`, `usage_records`, `billing_budgets`, `ai_invocations`, `deployments`). Immutable append-only semantics for audit and historical usage. |
| `0011_indexes.sql` | Creates B-tree performance indexes on `organization_id`, foreign keys, status fields, and created_at timestamps. |
| `0012_rls_helpers.sql` | Implements Supabase JWT security helper functions `auth.current_organization_id()` and `auth.current_user_role()`. |
| `0013_rls_policies.sql` | Enables RLS on all tenant tables and defines tenant isolation policies (`organization_id = auth.current_organization_id()`). |
| `0014_seed_plans.sql` | Seeds commercial plan tiers (**Starter ₹499/mo**, **Pro ₹999/mo**, **Studio ₹2,499/mo**, **Business ₹5,999+/mo**) and entitlement limits. |

---

## 3. Security & Tenant Isolation Principles
- **No Floating-Point Money**: Subscription prices, invoices, rate cards, and AI token costs use exact `numeric(...)` database types.
- **Append-Only Auditing**: `audit_events` and historical `usage_records` have no browser UPDATE/DELETE RLS policies. User deletions on parent resources use `RESTRICT` or `SET NULL` so historical financial/security logs survive ordinary resource deletions.
- **Service Role Boundary**: `SUPABASE_SERVICE_ROLE_KEY` exists exclusively inside server environments.

---

## 4. Automated Database Verification Suite
Run the migration parser verification script via:
```bash
npx tsx scripts/verify-database-migrations.ts
```
Expected Output: `All 32 canonical PostgreSQL tables defined. RLS enabled. Verification Suite Passed.`
