-- ANSTAT AI ENGINE - Database Migration 0009: Debugging Hub & Incident Intelligence Tables
-- Tables: incidents, incident_signals, incident_hypotheses

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL,
    environment VARCHAR(50) NOT NULL DEFAULT 'production',
    title VARCHAR(255) NOT NULL,
    severity severity_level NOT NULL DEFAULT 'high',
    status incident_status NOT NULL DEFAULT 'open',
    source incident_source NOT NULL DEFAULT 'manual_report',
    error_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_incident_repo_org FOREIGN KEY (organization_id, repository_id) REFERENCES repositories(organization_id, id) ON DELETE RESTRICT,
    CONSTRAINT unique_incident_org_id UNIQUE (organization_id, id)
);

CREATE TABLE IF NOT EXISTS incident_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    source incident_source NOT NULL DEFAULT 'manual_report',
    message TEXT NOT NULL,
    stack_trace JSONB DEFAULT '[]'::jsonb,
    logs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    confidence_score INT NOT NULL DEFAULT 85,
    is_working_hypothesis BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
