-- ANSTAT AI ENGINE - Database Migration 0006: GitHub Version Control Integration Tables
-- Tables: github_installations, repositories, pull_requests

CREATE TABLE IF NOT EXISTS github_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    installation_id BIGINT NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    installation_id UUID NOT NULL REFERENCES github_installations(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    default_branch VARCHAR(100) NOT NULL DEFAULT 'main',
    security_score INT NOT NULL DEFAULT 85,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_repo_per_org UNIQUE (organization_id, full_name),
    CONSTRAINT unique_repo_org_id UNIQUE (organization_id, id)
);

CREATE TABLE IF NOT EXISTS pull_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE RESTRICT,
    number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    html_url TEXT NOT NULL,
    base_branch VARCHAR(100) NOT NULL DEFAULT 'main',
    feature_branch VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_pr_repo_org FOREIGN KEY (organization_id, repository_id) REFERENCES repositories(organization_id, id) ON DELETE RESTRICT
);
