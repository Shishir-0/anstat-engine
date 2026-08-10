-- ANSTAT AI ENGINE - Database Migration 0008: Security Control Plane & Autofix Tables
-- Tables: security_scans, security_findings

CREATE TABLE IF NOT EXISTS security_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL,
    profile VARCHAR(50) NOT NULL DEFAULT 'standard',
    status job_status NOT NULL DEFAULT 'pending',
    total_findings INT NOT NULL DEFAULT 0,
    risk_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_sec_scan_repo_org FOREIGN KEY (organization_id, repository_id) REFERENCES repositories(organization_id, id) ON DELETE RESTRICT,
    CONSTRAINT unique_sec_scan_org_id UNIQUE (organization_id, id)
);

CREATE TABLE IF NOT EXISTS security_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL REFERENCES security_scans(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity severity_level NOT NULL DEFAULT 'medium',
    status finding_status NOT NULL DEFAULT 'open',
    file VARCHAR(500) NOT NULL,
    line INT NOT NULL,
    cwe VARCHAR(50),
    owasp VARCHAR(50),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    resolution JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_sec_finding_repo_org FOREIGN KEY (organization_id, repository_id) REFERENCES repositories(organization_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_sec_finding_scan_org FOREIGN KEY (organization_id, scan_id) REFERENCES security_scans(organization_id, id) ON DELETE CASCADE
);
