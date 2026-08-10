-- ANSTAT AI ENGINE - Database Migration 0005: ProposalOS Commercial Tables
-- Tables: clients, proposals, proposal_versions

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    total_revenue_usd NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_clients_organization_id_id UNIQUE (organization_id, id)
);

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    status proposal_status NOT NULL DEFAULT 'draft',
    total_amount_usd NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_proposals_client_org FOREIGN KEY (organization_id, client_id) REFERENCES clients(organization_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS proposal_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_version_per_proposal UNIQUE (proposal_id, version_number)
);
