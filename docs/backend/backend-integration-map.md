# Backend Integration Roadmap & Data Schema Specification — ANSTAT AI ENGINE

## 1. Overview
This document specifies how the decoupled service interfaces in `lib/services/interfaces/*` map to real PostgreSQL / Supabase backend tables, Row-Level Security (RLS) policies, and REST/GraphQL API endpoints during Phases 7–10.

---

## 2. Core Service Mapping

| Service Interface | Current Mock Service | Future Backend Endpoint | Target DB Tables |
|---|---|---|---|
| `AuthService` | `MockAuthService` | `POST /api/v1/auth/*` | `users`, `organizations`, `user_roles` |
| `ProposalService` | `MockProposalService` | `POST/GET /api/v1/proposals/*` | `proposals`, `proposal_sections`, `clients` |
| `CodeService` | `MockCodeService` | `POST/GET /api/v1/code/*` | `code_jobs`, `code_plans`, `code_patches` |
| `SecurityService` | `MockSecurityService` | `POST/GET /api/v1/security/*` | `security_scans`, `security_findings` |
| `ValidationService` | `MockValidationService` | Worker Event Queue | `validation_results`, `validation_checks` |
| `GitHubService` | `MockGitHubService` | GitHub App Webhooks | `repositories`, `pull_requests` |
| `AIService` | `MockAIService` | AI Provider Gateway | `ai_invocations`, `usage_records` |
| `UsageService` | `MockUsageService` | Metering Worker | `usage_records`, `billing_budgets` |
| `AuditService` | `MockAuditService` | Audit Logger | `audit_events` |

---

## 3. Database Schema Overview (PostgreSQL)

```sql
-- Organizations Table (Multi-tenant boundary)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'agency',
  rate_card JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'developer',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Security Findings Table
CREATE TABLE security_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL,
  repository_id UUID NOT NULL,
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  file TEXT NOT NULL,
  line INT NOT NULL,
  cwe TEXT,
  owasp TEXT,
  evidence JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_findings ENABLE ROW LEVEL SECURITY;
```
