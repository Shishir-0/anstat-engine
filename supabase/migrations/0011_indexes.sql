-- ANSTAT AI ENGINE - Database Migration 0011: Performance Indexes
-- B-tree and GIN indexes for tenant filtering, lookups, and chronology

-- Core & Billing Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_org_period ON usage_counters(organization_id, billing_period_start);

-- Proposals Indexes
CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_org_id ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(organization_id, status);

-- Repositories & GitHub Indexes
CREATE INDEX IF NOT EXISTS idx_repositories_org_id ON repositories(organization_id);
CREATE INDEX IF NOT EXISTS idx_pull_requests_repo_id ON pull_requests(repository_id);

-- Code Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_code_jobs_org_id ON code_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_code_jobs_repo_id ON code_jobs(repository_id);
CREATE INDEX IF NOT EXISTS idx_code_jobs_status ON code_jobs(organization_id, status);

-- Security Findings Indexes
CREATE INDEX IF NOT EXISTS idx_security_scans_org_id ON security_scans(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_findings_org_id ON security_findings(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_findings_repo_id ON security_findings(repository_id);
CREATE INDEX IF NOT EXISTS idx_security_findings_status ON security_findings(organization_id, status);

-- Incidents Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_org_id ON incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_repo_id ON incidents(repository_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(organization_id, status);

-- Infrastructure, Audit & Usage Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_org_status ON jobs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_events_org_created ON audit_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_records_org_created ON usage_records(organization_id, created_at DESC);
