-- ANSTAT AI ENGINE - Database Migration 0004: Commercial & Subscription Billing Tables
-- Tables: plans, subscriptions, subscription_events, entitlements, billing_customers, invoices, usage_counters, payment_webhook_events

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price_inr_monthly NUMERIC(12,2) NOT NULL,
    included_ai_credits INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status subscription_status NOT NULL DEFAULT 'trialing',
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE UNIQUE,
    max_members INT NOT NULL,
    max_repositories INT NOT NULL,
    monthly_proposals INT NOT NULL,
    monthly_code_jobs INT NOT NULL,
    monthly_security_scans INT NOT NULL,
    monthly_debugging_investigations INT NOT NULL,
    monthly_ai_credits INT NOT NULL,
    github_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    advanced_security BOOLEAN NOT NULL DEFAULT FALSE,
    team_rbac BOOLEAN NOT NULL DEFAULT FALSE,
    priority_workers BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS billing_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    provider_customer_id VARCHAR(255) NOT NULL,
    billing_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
    amount_inr NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
    pdf_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    billing_period_start TIMESTAMPTZ NOT NULL,
    billing_period_end TIMESTAMPTZ NOT NULL,
    used_ai_credits INT NOT NULL DEFAULT 0,
    used_proposals INT NOT NULL DEFAULT 0,
    used_code_jobs INT NOT NULL DEFAULT 0,
    used_scans INT NOT NULL DEFAULT 0,
    used_incidents INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_org_billing_period UNIQUE (organization_id, billing_period_start)
);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) NOT NULL UNIQUE, -- Idempotency Key
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
