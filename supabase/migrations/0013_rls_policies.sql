-- ANSTAT AI ENGINE - Database Migration 0013: Row Level Security (RLS) Policies
-- Enforces tenant isolation and RBAC across all 32 database tables

-- 1. Core Identity & Multi-Tenancy Tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_organizations_select ON organizations FOR SELECT TO authenticated
    USING (id = auth.current_organization_id());

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_profiles_select ON profiles FOR SELECT TO authenticated
    USING (id = auth.uid());
CREATE POLICY rls_profiles_update ON profiles FOR UPDATE TO authenticated
    USING (id = auth.uid());

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_memberships_select ON memberships FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());

-- 2. Commercial & Billing Tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_plans_select ON plans FOR SELECT TO authenticated USING (true);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_subscriptions_select ON subscriptions FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_subscription_events_select ON subscription_events FOR SELECT TO authenticated
    USING (subscription_id IN (SELECT id FROM subscriptions WHERE organization_id = auth.current_organization_id()));

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_entitlements_select ON entitlements FOR SELECT TO authenticated USING (true);

ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_billing_customers_select ON billing_customers FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_invoices_select ON invoices FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());

ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_usage_counters_select ON usage_counters FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());

ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;
-- Webhooks accessible only via service_role (No browser policies)

-- 3. ProposalOS Tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_clients_all ON clients FOR ALL TO authenticated
    USING (organization_id = auth.current_organization_id())
    WITH CHECK (organization_id = auth.current_organization_id());

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_proposals_all ON proposals FOR ALL TO authenticated
    USING (organization_id = auth.current_organization_id())
    WITH CHECK (organization_id = auth.current_organization_id());

ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_proposal_versions_select ON proposal_versions FOR SELECT TO authenticated
    USING (proposal_id IN (SELECT id FROM proposals WHERE organization_id = auth.current_organization_id()));

-- 4. Version Control & GitHub Tables
ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_github_installations_select ON github_installations FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());

ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_repositories_all ON repositories FOR ALL TO authenticated
    USING (organization_id = auth.current_organization_id())
    WITH CHECK (organization_id = auth.current_organization_id());

ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_pull_requests_select ON pull_requests FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());

-- 5. Code Generation Engine Tables
ALTER TABLE code_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_code_jobs_all ON code_jobs FOR ALL TO authenticated
    USING (organization_id = auth.current_organization_id())
    WITH CHECK (organization_id = auth.current_organization_id());

ALTER TABLE code_job_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_code_job_events_select ON code_job_events FOR SELECT TO authenticated
    USING (code_job_id IN (SELECT id FROM code_jobs WHERE organization_id = auth.current_organization_id()));

ALTER TABLE validation_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_validation_results_select ON validation_results FOR SELECT TO authenticated
    USING (code_job_id IN (SELECT id FROM code_jobs WHERE organization_id = auth.current_organization_id()));

-- 6. Security Center Tables
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_security_scans_all ON security_scans FOR ALL TO authenticated
    USING (organization_id = auth.current_organization_id())
    WITH CHECK (organization_id = auth.current_organization_id());

ALTER TABLE security_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_security_findings_all ON security_findings FOR ALL TO authenticated
    USING (organization_id = auth.current_organization_id())
    WITH CHECK (organization_id = auth.current_organization_id());

-- 7. Debugging Hub Tables
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_incidents_all ON incidents FOR ALL TO authenticated
    USING (organization_id = auth.current_organization_id())
    WITH CHECK (organization_id = auth.current_organization_id());

ALTER TABLE incident_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_incident_signals_select ON incident_signals FOR SELECT TO authenticated
    USING (incident_id IN (SELECT id FROM incidents WHERE organization_id = auth.current_organization_id()));

ALTER TABLE incident_hypotheses ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_incident_hypotheses_select ON incident_hypotheses FOR SELECT TO authenticated
    USING (incident_id IN (SELECT id FROM incidents WHERE organization_id = auth.current_organization_id()));

-- 8. Universal Platform Infrastructure Tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_jobs_all ON jobs FOR ALL TO authenticated
    USING (organization_id = auth.current_organization_id())
    WITH CHECK (organization_id = auth.current_organization_id());

ALTER TABLE job_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_job_events_select ON job_events FOR SELECT TO authenticated
    USING (job_id IN (SELECT id FROM jobs WHERE organization_id = auth.current_organization_id()));

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_audit_events_select ON audit_events FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());
-- Append-only: No browser UPDATE or DELETE policies for audit_events

ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_usage_records_select ON usage_records FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());
-- Append-only: No browser UPDATE or DELETE policies for usage_records

ALTER TABLE billing_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_billing_budgets_select ON billing_budgets FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());

ALTER TABLE ai_invocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_ai_invocations_select ON ai_invocations FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());

ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_deployments_select ON deployments FOR SELECT TO authenticated
    USING (organization_id = auth.current_organization_id());
