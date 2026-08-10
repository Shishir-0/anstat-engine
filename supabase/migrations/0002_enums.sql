-- ANSTAT AI ENGINE - Database Migration 0002: Enums
-- Phase 7 Step 2 Domain State Machines

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'senior_engineer', 'developer', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'grace_period', 'paused', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE proposal_status AS ENUM ('draft', 'generated', 'review', 'sent', 'won', 'lost', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE finding_status AS ENUM ('open', 'triaged', 'fix_proposed', 'validating', 'rescan_pending', 'resolved', 'accepted_risk', 'false_positive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM ('open', 'investigating', 'root_cause_identified', 'fix_proposed', 'validating', 'security_review', 'needs_review', 'resolved', 'closed', 'reopened');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('pending', 'running', 'passed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('critical', 'high', 'medium', 'low', 'info');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE log_level AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_source AS ENUM ('sentry', 'datadog', 'cloudwatch', 'opentelemetry', 'manual_report');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
