# Production Database Schema & Relational Specifications — ANSTAT AI ENGINE

> **Phase 7 Blueprint Document**  
> *PostgreSQL Schema Specification, Entity-Relationship Mapping, and Multi-Tenant Foreign Keys.*

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
┌──────────┐      ┌───────────┐   ┌───────────┐   ┌───────────┐     ┌─────────────┐
│ profiles │      │  clients  │   │ proposals │   │  repos    │     │ audit_events│
└────┬─────┘      └─────┬─────┘   └─────┬─────┘   └─────┬─────┘     └─────────────┘
     │                  │               │               │
     ▼                  ▼               ▼               ▼
┌──────────┐            └───────┬───────┘         ┌───────────┐
│memberships│                    │                 │ code_jobs │
└──────────┘                    ▼                 └─────┬─────┘
                        ┌───────────────┐               │
                        │proposal_vers. │               ▼
                        └───────────────┘         ┌───────────┐
                                                  │ incidents │
                                                  └─────┬─────┘
                                                        │
                                                        ▼
                                                  ┌───────────┐
                                                  │ sec_scans │
                                                  └───────────┘
```

---

## 2. Table Specifications (24 Canonical Tables)

### Core Tenant & Auth Layer
1. **`organizations`**: `id` (UUID PK), `name`, `slug` (UNIQUE), `plan`, `rate_card` (JSONB), `monthly_ai_budget_usd`, `created_at`.
2. **`profiles`**: `id` (UUID PK, references `auth.users`), `email` (UNIQUE), `full_name`, `avatar_url`, `created_at`.
3. **`memberships`**: `id` (UUID PK), `organization_id` (FK `organizations`), `user_id` (FK `profiles`), `role` (`owner` | `admin` | `senior_engineer` | `developer` | `viewer`), `created_at`.

### Client & Commercial Layer (ProposalOS)
4. **`clients`**: `id` (UUID PK), `organization_id` (FK `organizations`), `name`, `company_name`, `industry`, `total_revenue_usd`, `created_at`.
5. **`proposals`**: `id` (UUID PK), `organization_id` (FK `organizations`), `client_id` (FK `clients`), `title`, `status`, `total_amount_usd`, `created_at`.
6. **`proposal_versions`**: `id` (UUID PK), `proposal_id` (FK `proposals`), `version_number`, `sections` (JSONB), `created_at`.

### Version Control & Code Engine Layer
7. **`github_installations`**: `id` (UUID PK), `organization_id` (FK `organizations`), `installation_id` (BIGINT UNIQUE), `account_name`, `created_at`.
8. **`repositories`**: `id` (UUID PK), `organization_id` (FK `organizations`), `installation_id` (FK `github_installations`), `name`, `full_name`, `default_branch`, `security_score`, `created_at`.
9. **`code_jobs`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `branch`, `feature_branch`, `issue` (JSONB), `status`, `plan` (JSONB), `patch` (JSONB), `estimated_cost_usd`, `created_at`.
10. **`code_job_events`**: `id` (UUID PK), `code_job_id` (FK `code_jobs`), `stage`, `message`, `severity`, `created_at`.

### Incident & Debugging Layer
11. **`incidents`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `environment`, `title`, `severity`, `status`, `source`, `error_type`, `created_at`.
12. **`incident_signals`**: `id` (UUID PK), `incident_id` (FK `incidents`), `source`, `message`, `stack_trace` (JSONB), `logs` (JSONB), `created_at`.
13. **`incident_hypotheses`**: `id` (UUID PK), `incident_id` (FK `incidents`), `title`, `explanation`, `confidence_score`, `is_working_hypothesis`, `created_at`.

### Security Control Plane Layer
14. **`security_scans`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `profile`, `status`, `total_findings`, `risk_score`, `created_at`.
15. **`security_findings`**: `id` (UUID PK), `organization_id` (FK `organizations`), `scan_id` (FK `security_scans`), `repository_id` (FK `repositories`), `title`, `severity`, `status`, `file`, `line`, `cwe`, `owasp`, `evidence` (JSONB), `resolution` (JSONB), `created_at`.

### Deployment & Pull Request Layer
16. **`pull_requests`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `number`, `title`, `html_url`, `base_branch`, `feature_branch`, `status`, `created_at`.
17. **`deployments`**: `id` (UUID PK), `organization_id` (FK `organizations`), `repository_id` (FK `repositories`), `environment`, `commit_sha`, `status`, `created_at`.

### Universal Platform Layer
18. **`jobs`**: `id` (UUID PK), `organization_id` (FK `organizations`), `job_type`, `status`, `progress`, `created_at`.
19. **`job_events`**: `id` (UUID PK), `job_id` (FK `jobs`), `stage`, `message`, `created_at`.
20. **`audit_events`**: `id` (UUID PK), `organization_id` (FK `organizations`), `actor_id` (FK `profiles`), `action`, `resource_type`, `resource_id`, `metadata` (JSONB), `created_at`.
21. **`usage_records`**: `id` (UUID PK), `organization_id` (FK `organizations`), `user_id` (FK `profiles`), `job_id` (FK `jobs`), `provider`, `model`, `input_tokens`, `output_tokens`, `estimated_cost_usd`, `created_at`.
22. **`billing_budgets`**: `id` (UUID PK), `organization_id` (FK `organizations`), `monthly_budget_usd`, `alert_threshold_percent`, `created_at`.
23. **`ai_invocations`**: `id` (UUID PK), `organization_id` (FK `organizations`), `feature`, `model_id`, `latency_ms`, `created_at`.
24. **`validation_results`**: `id` (UUID PK), `code_job_id` (FK `code_jobs`), `status`, `checks` (JSONB), `created_at`.
