-- ANSTAT AI ENGINE - Database Migration 0007: Code Generation Engine Tables
-- Tables: code_jobs, code_job_events, validation_results

CREATE TABLE IF NOT EXISTS code_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL,
    branch VARCHAR(100) NOT NULL DEFAULT 'main',
    feature_branch VARCHAR(100) NOT NULL,
    issue JSONB NOT NULL DEFAULT '{}'::jsonb,
    status job_status NOT NULL DEFAULT 'pending',
    plan JSONB,
    patch JSONB,
    estimated_cost_usd NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_code_job_repo_org FOREIGN KEY (organization_id, repository_id) REFERENCES repositories(organization_id, id) ON DELETE RESTRICT,
    CONSTRAINT unique_code_job_org_id UNIQUE (organization_id, id)
);

CREATE TABLE IF NOT EXISTS code_job_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_job_id UUID NOT NULL REFERENCES code_jobs(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    severity severity_level NOT NULL DEFAULT 'info',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS validation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_job_id UUID NOT NULL REFERENCES code_jobs(id) ON DELETE CASCADE UNIQUE,
    status job_status NOT NULL DEFAULT 'pending',
    checks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
