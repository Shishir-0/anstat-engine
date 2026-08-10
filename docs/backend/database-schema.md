# Production Database Schema & Relational Specifications — ANSTAT AI ENGINE

> **Phase 7 Blueprint Document**  
> *PostgreSQL Schema Specification, Commercial Billing Entities, Entity-Relationship Mapping, and Multi-Tenant Foreign Keys.*

---

## 1. Relational Map Overview

```
                               ┌─────────────────┐
                               │  organizations  │
                               └────────┬────────┘
                                        │
     ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
     │                  │               │               │                  │
     ▼                  ▼               ▼               ▼                  ▼
┌──────────┐      ┌───────────┐   ┌───────────┐   ┌───────────┐     ┌──────────────┐
│ profiles │      │subscriptions│ │ proposals │   │  repos    │     │subscriptions │
└────┬─────┘      └─────┬─────┘   └─────┬─────┘   └─────┬─────┘     └──────┬───────┘
     │                  │               │               │                │
     ▼                  ▼               ▼               ▼                ▼
┌──────────┐      ┌───────────┐   ┌───────────┐   ┌───────────┐     ┌──────────────┐
│memberships│     │invoices   │   │proposal_v.│   │ code_jobs │     │entitlements  │
└──────────┘      └───────────┘   └───────────┘   └─────┬─────┘     └──────────────┘
                                                        │
                                                        ▼
                                                  ┌───────────┐
                                                  │ incidents │
                                                  └─────┬─────┘
                                                        │
                                                        ▼
                                                  ┌───────────┐
                                                  │ sec_scans │
                                                  └───────────┘
```

---

## 2. Table Specifications (32 Canonical Tables)

### Core Tenant & Auth Layer
1. **`organizations`**: `id` (UUID PK), `name`, `slug` (UNIQUE), `logo_url`, `brand_colors` (JSONB), `rate_card` (JSONB), `created_at`.
2. **`profiles`**: `id` (UUID PK, references `auth.users`), `email` (UNIQUE), `full_name`, `avatar_url`, `created_at`.
3. **`memberships`**: `id` (UUID PK), `organization_id` (FK `organizations`), `user_id` (FK `profiles`), `role` (`owner` | `admin` | `senior_engineer` | `developer` | `viewer`), `created_at`.

### Commercial & Subscription Billing Layer (Phase 7 Additions)
4. **`plans`**: `id` (UUID PK), `code` (`starter` | `pro` | `studio` | `business`), `name`, `price_inr_monthly`, `included_ai_credits`, `created_at`.
5. **`subscriptions`**: `id` (UUID PK), `organization_id` (FK `organizations`), `plan_id` (FK `plans`), `status` (`trialing` | `active` | `past_due` | `grace_period` | `cancelled` | `expired`), `cancel_at_period_end` (BOOLEAN), `current_period_start`, `current_period_end`, `created_at`.
6. **`subscription_events`**: `id` (UUID PK), `subscription_id` (FK `subscriptions`), `event_type`, `payload` (JSONB), `created_at`.
7. **`entitlements`**: `id` (UUID PK), `plan_id` (FK `plans`), `max_members`, `max_repositories`, `monthly_proposals`, `monthly_code_jobs`, `monthly_security_scans`, `monthly_debugging_investigations`, `monthly_ai_credits`, `github_enabled`, `advanced_security`, `team_rbac`, `priority_workers`.
8. **`billing_customers`**: `id` (UUID PK), `organization_id` (FK `organizations`), `provider_customer_id`, `billing_email`, `created_at`.
9. **`invoices`**: `id` (UUID PK), `organization_id` (FK `organizations`), `subscription_id` (FK `subscriptions`), `amount_inr`, `status`, `pdf_url`, `paid_at`, `created_at`.
10. **`usage_counters`**: `id` (UUID PK), `organization_id` (FK `organizations`), `billing_period_start`, `billing_period_end`, `used_ai_credits`, `used_proposals`, `used_code_jobs`, `used_scans`, `used_incidents`, `updated_at`.
11. **`payment_webhook_events`**: `id` (UUID PK), `event_id` (UNIQUE), `provider`, `event_type`, `processed_at`, `payload` (JSONB).

### Client & Commercial Layer (ProposalOS)
12. **`clients`**: `id` (UUID PK), `organization_id` (FK `organizations`), `name`, `company_name`, `industry`, `total_revenue_usd`, `created_at`.
13. **`proposals`**: `id` (UUID PK), `organization_id` (FK `organizations`), `client_id` (FK `clients`), `title`, `status`, `total_amount_usd`, `created_at`.
14. **`proposal_versions`**: `id` (UUID PK), `proposal_id` (FK `proposals`), `version_number`, `sections` (JSONB), `created_at`.

### Version Control & Code Engine Layer
15. **`github_installations`**: `id` (UUID PK), `organization_id` (FK `organizations`), `installation_id` (BIGINT UNIQUE), `account_name`, `created_at`.
16. **`repositories`**: `id` (UUID PK), `organization_id` (FK `organizations`), `installation_id` (FK `github_installations`), `name`, `full_name`, `default_branch`, `security_score`, `created_at`.
17. **`code_jobs`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `branch`, `feature_branch`, `issue` (JSONB), `status`, `plan` (JSONB), `patch` (JSONB), `estimated_cost_usd`, `created_at`.
18. **`code_job_events`**: `id` (UUID PK), `code_job_id` (FK `code_jobs`), `stage`, `message`, `severity`, `created_at`.

### Incident & Debugging Layer
19. **`incidents`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `environment`, `title`, `severity`, `status`, `source`, `error_type`, `created_at`.
20. **`incident_signals`**: `id` (UUID PK), `incident_id` (FK `incidents`), `source`, `message`, `stack_trace` (JSONB), `logs` (JSONB), `created_at`.
21. **`incident_hypotheses`**: `id` (UUID PK), `incident_id` (FK `incidents`), `title`, `explanation`, `confidence_score`, `is_working_hypothesis`, `created_at`.

### Security Control Plane Layer
22. **`security_scans`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `profile`, `status`, `total_findings`, `risk_score`, `created_at`.
23. **`security_findings`**: `id` (UUID PK), `organization_id` (FK `organizations`), `scan_id` (FK `security_scans`), `repository_id` (FK `repositories`), `title`, `severity`, `status`, `file`, `line`, `cwe`, `owasp`, `evidence` (JSONB), `resolution` (JSONB), `created_at`.

### Deployment & Pull Request Layer
24. **`pull_requests`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `number`, `title`, `html_url`, `base_branch`, `feature_branch`, `status`, `created_at`.
25. **`deployments`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `environment`, `commit_sha`, `status`, `created_at`.

### Universal Platform Layer
26. **`jobs`**: `id` (UUID PK), `organization_id` (FK `organizations`), `job_type`, `status`, `progress`, `created_at`.
27. **`job_events`**: `id` (UUID PK), `job_id` (FK `jobs`), `stage`, `message`, `created_at`.
28. **`audit_events`**: `id` (UUID PK), `organization_id` (FK `organizations`), `actor_id` (FK `profiles`), `action`, `resource_type`, `resource_id`, `metadata` (JSONB), `created_at`.
29. **`usage_records`**: `id` (UUID PK), `organization_id` (FK `organizations`), `user_id` (FK `profiles`), `job_id` (FK `jobs`), `provider`, `model`, `input_tokens`, `output_tokens`, `estimated_cost_usd`, `created_at`.
30. **`billing_budgets`**: `id` (UUID PK), `organization_id` (FK `organizations`), `monthly_budget_usd`, `alert_threshold_percent`, `created_at`.
31. **`ai_invocations`**: `id` (UUID PK), `organization_id` (FK `organizations`), `feature`, `model_id`, `latency_ms`, `created_at`.
32. **`validation_results`**: `id` (UUID PK), `code_job_id` (FK `code_jobs`), `status`, `checks` (JSONB), `created_at`.
