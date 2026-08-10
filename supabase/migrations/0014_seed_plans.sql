-- ANSTAT AI ENGINE - Database Migration 0014: Seed Commercial Plans & Entitlements
-- Seeds Starter (₹499), Pro (₹999), Studio (₹2,499), Business (₹5,999+)

-- 1. Starter Plan (₹499/mo)
INSERT INTO plans (id, code, name, price_inr_monthly, included_ai_credits)
VALUES ('11111111-1111-4111-8111-111111111111', 'starter', 'Starter', 499.00, 300)
ON CONFLICT (code) DO UPDATE SET
    price_inr_monthly = EXCLUDED.price_inr_monthly,
    included_ai_credits = EXCLUDED.included_ai_credits;

INSERT INTO entitlements (plan_id, max_members, max_repositories, monthly_proposals, monthly_code_jobs, monthly_security_scans, monthly_debugging_investigations, monthly_ai_credits, github_enabled, advanced_security, team_rbac, priority_workers)
VALUES ('11111111-1111-4111-8111-111111111111', 2, 3, 10, 25, 10, 10, 300, TRUE, FALSE, FALSE, FALSE)
ON CONFLICT (plan_id) DO UPDATE SET
    max_members = EXCLUDED.max_members,
    max_repositories = EXCLUDED.max_repositories,
    monthly_proposals = EXCLUDED.monthly_proposals,
    monthly_code_jobs = EXCLUDED.monthly_code_jobs,
    monthly_security_scans = EXCLUDED.monthly_security_scans,
    monthly_debugging_investigations = EXCLUDED.monthly_debugging_investigations,
    monthly_ai_credits = EXCLUDED.monthly_ai_credits;

-- 2. Pro Plan (₹999/mo)
INSERT INTO plans (id, code, name, price_inr_monthly, included_ai_credits)
VALUES ('22222222-2222-4222-8222-222222222222', 'pro', 'Pro', 999.00, 1000)
ON CONFLICT (code) DO UPDATE SET
    price_inr_monthly = EXCLUDED.price_inr_monthly,
    included_ai_credits = EXCLUDED.included_ai_credits;

INSERT INTO entitlements (plan_id, max_members, max_repositories, monthly_proposals, monthly_code_jobs, monthly_security_scans, monthly_debugging_investigations, monthly_ai_credits, github_enabled, advanced_security, team_rbac, priority_workers)
VALUES ('22222222-2222-4222-8222-222222222222', 5, 10, 50, 100, 50, 50, 1000, TRUE, TRUE, FALSE, FALSE)
ON CONFLICT (plan_id) DO UPDATE SET
    max_members = EXCLUDED.max_members,
    max_repositories = EXCLUDED.max_repositories,
    monthly_proposals = EXCLUDED.monthly_proposals,
    monthly_code_jobs = EXCLUDED.monthly_code_jobs,
    monthly_security_scans = EXCLUDED.monthly_security_scans,
    monthly_debugging_investigations = EXCLUDED.monthly_debugging_investigations,
    monthly_ai_credits = EXCLUDED.monthly_ai_credits;

-- 3. Studio Plan (₹2,499/mo)
INSERT INTO plans (id, code, name, price_inr_monthly, included_ai_credits)
VALUES ('33333333-3333-4333-8333-333333333333', 'studio', 'Studio', 2499.00, 3000)
ON CONFLICT (code) DO UPDATE SET
    price_inr_monthly = EXCLUDED.price_inr_monthly,
    included_ai_credits = EXCLUDED.included_ai_credits;

INSERT INTO entitlements (plan_id, max_members, max_repositories, monthly_proposals, monthly_code_jobs, monthly_security_scans, monthly_debugging_investigations, monthly_ai_credits, github_enabled, advanced_security, team_rbac, priority_workers)
VALUES ('33333333-3333-4333-8333-333333333333', 15, 25, 200, 500, 250, 250, 3000, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (plan_id) DO UPDATE SET
    max_members = EXCLUDED.max_members,
    max_repositories = EXCLUDED.max_repositories,
    monthly_proposals = EXCLUDED.monthly_proposals,
    monthly_code_jobs = EXCLUDED.monthly_code_jobs,
    monthly_security_scans = EXCLUDED.monthly_security_scans,
    monthly_debugging_investigations = EXCLUDED.monthly_debugging_investigations,
    monthly_ai_credits = EXCLUDED.monthly_ai_credits;

-- 4. Business Plan (₹5,999+/mo)
INSERT INTO plans (id, code, name, price_inr_monthly, included_ai_credits)
VALUES ('44444444-4444-4444-8444-444444444444', 'business', 'Business', 5999.00, 10000)
ON CONFLICT (code) DO UPDATE SET
    price_inr_monthly = EXCLUDED.price_inr_monthly,
    included_ai_credits = EXCLUDED.included_ai_credits;

INSERT INTO entitlements (plan_id, max_members, max_repositories, monthly_proposals, monthly_code_jobs, monthly_security_scans, monthly_debugging_investigations, monthly_ai_credits, github_enabled, advanced_security, team_rbac, priority_workers)
VALUES ('44444444-4444-4444-8444-444444444444', 999, 999, 99999, 99999, 99999, 99999, 10000, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (plan_id) DO UPDATE SET
    max_members = EXCLUDED.max_members,
    max_repositories = EXCLUDED.max_repositories,
    monthly_proposals = EXCLUDED.monthly_proposals,
    monthly_code_jobs = EXCLUDED.monthly_code_jobs,
    monthly_security_scans = EXCLUDED.monthly_security_scans,
    monthly_debugging_investigations = EXCLUDED.monthly_debugging_investigations,
    monthly_ai_credits = EXCLUDED.monthly_ai_credits;
