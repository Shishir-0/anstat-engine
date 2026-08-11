-- ANSTAT AI ENGINE - Database Migration 0016: Atomic Entitlements & Quota Engine
-- Hardened PostgreSQL Stored Procedures with Strict Tenant Membership & Privilege Control

-- 1. Helper function to ensure active usage counter record exists for current billing period
CREATE OR REPLACE FUNCTION public.ensure_active_usage_counter(p_org_id UUID)
RETURNS UUID AS $$
DECLARE
    v_counter_id UUID;
    v_period_start TIMESTAMPTZ;
    v_period_end TIMESTAMPTZ;
BEGIN
    v_period_start := DATE_TRUNC('month', NOW());
    v_period_end := v_period_start + INTERVAL '1 month';

    INSERT INTO public.usage_counters (
        id, organization_id, billing_period_start, billing_period_end, 
        used_ai_credits, used_proposals, used_code_jobs, used_scans, used_incidents, updated_at
    )
    VALUES (
        gen_random_uuid(), p_org_id, v_period_start, v_period_end, 
        0, 0, 0, 0, 0, NOW()
    )
    ON CONFLICT (organization_id, billing_period_start) DO NOTHING;

    SELECT id INTO v_counter_id
    FROM public.usage_counters
    WHERE organization_id = p_org_id AND billing_period_start = v_period_start;

    RETURN v_counter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Read-Only Quota Check Procedure (Preflight / UI only)
CREATE OR REPLACE FUNCTION public.check_quota_atomic(
    p_org_id UUID,
    p_resource TEXT,
    p_amount INT DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_target_org_id UUID;
    v_sub_status subscription_status;
    v_plan_code TEXT;
    v_limit INT := 0;
    v_used INT := 0;
    v_remaining INT := 0;
    v_period_start TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();

    -- Validate Authentication Presence
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'PERMISSION_DENIED',
            'message', 'Authentication required for quota operations.'
        );
    END IF;

    -- Input Parameter Validation
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'INVALID_AMOUNT',
            'message', 'Consumption amount must be a positive integer.'
        );
    END IF;

    IF p_resource NOT IN ('seats', 'repositories', 'proposals', 'code_jobs', 'security_scans', 'ai_credits') THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'INVALID_RESOURCE',
            'message', format('Invalid resource type: %s', p_resource)
        );
    END IF;

    -- Validate Tenant Membership Security Boundary
    IF p_org_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.memberships 
            WHERE organization_id = p_org_id AND user_id = v_user_id
        ) THEN
            RETURN jsonb_build_object(
                'allowed', false,
                'resource', p_resource,
                'used', 0,
                'limit', 0,
                'remaining', 0,
                'reason', 'PERMISSION_DENIED',
                'message', 'Cross-tenant violation: Authenticated user is not a member of the requested organization.'
            );
        END IF;
        v_target_org_id := p_org_id;
    ELSE
        v_target_org_id := public.current_organization_id();
    END IF;

    IF v_target_org_id IS NULL THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'ORGANIZATION_NOT_FOUND',
            'message', 'Organization context is required for quota checks.'
        );
    END IF;

    -- Retrieve active subscription
    SELECT s.status, p.code
    INTO v_sub_status, v_plan_code
    FROM public.subscriptions s
    JOIN public.plans p ON s.plan_id = p.id
    WHERE s.organization_id = v_target_org_id
    ORDER BY s.created_at DESC
    LIMIT 1;

    IF v_sub_status IS NULL THEN
        v_sub_status := 'active'::subscription_status;
        v_plan_code := 'starter';
    END IF;

    IF v_sub_status IN ('expired', 'cancelled') THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'SUBSCRIPTION_EXPIRED',
            'message', 'Workspace subscription is expired or cancelled. Read-only mode enabled.'
        );
    END IF;

    -- Retrieve Limit
    SELECT 
        CASE p_resource
            WHEN 'seats' THEN e.max_members
            WHEN 'repositories' THEN e.max_repositories
            WHEN 'proposals' THEN e.monthly_proposals
            WHEN 'code_jobs' THEN e.monthly_code_jobs
            WHEN 'security_scans' THEN e.monthly_security_scans
            WHEN 'ai_credits' THEN e.monthly_ai_credits
            ELSE 0
        END INTO v_limit
    FROM public.entitlements e
    JOIN public.plans p ON e.plan_id = p.id
    WHERE p.code = v_plan_code;

    v_limit := COALESCE(v_limit, 0);

    PERFORM public.ensure_active_usage_counter(v_target_org_id);
    v_period_start := DATE_TRUNC('month', NOW());

    -- Retrieve Current Usage
    SELECT 
        CASE p_resource
            WHEN 'seats' THEN (SELECT COUNT(*)::INT FROM public.memberships WHERE organization_id = v_target_org_id)
            WHEN 'repositories' THEN (SELECT COUNT(*)::INT FROM public.repositories WHERE organization_id = v_target_org_id)
            WHEN 'proposals' THEN uc.used_proposals
            WHEN 'code_jobs' THEN uc.used_code_jobs
            WHEN 'security_scans' THEN uc.used_scans
            WHEN 'ai_credits' THEN uc.used_ai_credits
            ELSE 0
        END INTO v_used
    FROM public.usage_counters uc
    WHERE uc.organization_id = v_target_org_id AND uc.billing_period_start = v_period_start;

    v_used := COALESCE(v_used, 0);
    v_remaining := GREATEST(0, v_limit - v_used);

    IF (v_used + p_amount) > v_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', v_used,
            'limit', v_limit,
            'remaining', v_remaining,
            'reason', CASE WHEN p_resource = 'ai_credits' THEN 'AI_CREDIT_LIMIT_REACHED' ELSE 'RESOURCE_LIMIT_REACHED' END,
            'message', format('Quota limit reached for %s.', p_resource)
        );
    END IF;

    RETURN jsonb_build_object(
        'allowed', true,
        'resource', p_resource,
        'used', v_used,
        'limit', v_limit,
        'remaining', v_remaining - p_amount,
        'reason', NULL,
        'message', 'Preflight check passed.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Authoritative Atomic Quota Consumption Procedure
CREATE OR REPLACE FUNCTION public.consume_quota_atomic(
    p_org_id UUID,
    p_resource TEXT,
    p_amount INT DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_target_org_id UUID;
    v_sub_status subscription_status;
    v_plan_code TEXT;
    v_limit INT := 0;
    v_used INT := 0;
    v_period_start TIMESTAMPTZ;
    v_updated_rows INT := 0;
BEGIN
    v_user_id := auth.uid();

    -- Validate Authentication Presence
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'PERMISSION_DENIED',
            'message', 'Authentication required for quota operations.'
        );
    END IF;

    -- Input Parameter Validation
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'INVALID_AMOUNT',
            'message', 'Consumption amount must be a positive integer.'
        );
    END IF;

    IF p_resource NOT IN ('seats', 'repositories', 'proposals', 'code_jobs', 'security_scans', 'ai_credits') THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'INVALID_RESOURCE',
            'message', format('Invalid resource type: %s', p_resource)
        );
    END IF;

    -- Validate Tenant Membership Security Boundary
    IF p_org_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.memberships 
            WHERE organization_id = p_org_id AND user_id = v_user_id
        ) THEN
            RETURN jsonb_build_object(
                'allowed', false,
                'resource', p_resource,
                'used', 0,
                'limit', 0,
                'remaining', 0,
                'reason', 'PERMISSION_DENIED',
                'message', 'Cross-tenant violation: Authenticated user is not a member of the requested organization.'
            );
        END IF;
        v_target_org_id := p_org_id;
    ELSE
        v_target_org_id := public.current_organization_id();
    END IF;

    IF v_target_org_id IS NULL THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'ORGANIZATION_NOT_FOUND',
            'message', 'Organization context is required for quota consumption.'
        );
    END IF;

    -- Retrieve active subscription status and plan
    SELECT s.status, p.code
    INTO v_sub_status, v_plan_code
    FROM public.subscriptions s
    JOIN public.plans p ON s.plan_id = p.id
    WHERE s.organization_id = v_target_org_id
    ORDER BY s.created_at DESC
    LIMIT 1;

    IF v_sub_status IS NULL THEN
        v_sub_status := 'active'::subscription_status;
        v_plan_code := 'starter';
    END IF;

    IF v_sub_status IN ('expired', 'cancelled') THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', 0,
            'limit', 0,
            'remaining', 0,
            'reason', 'SUBSCRIPTION_EXPIRED',
            'message', 'Workspace subscription is expired or cancelled.'
        );
    END IF;

    -- Retrieve Limit
    SELECT 
        CASE p_resource
            WHEN 'seats' THEN e.max_members
            WHEN 'repositories' THEN e.max_repositories
            WHEN 'proposals' THEN e.monthly_proposals
            WHEN 'code_jobs' THEN e.monthly_code_jobs
            WHEN 'security_scans' THEN e.monthly_security_scans
            WHEN 'ai_credits' THEN e.monthly_ai_credits
            ELSE 0
        END INTO v_limit
    FROM public.entitlements e
    JOIN public.plans p ON e.plan_id = p.id
    WHERE p.code = v_plan_code;

    v_limit := COALESCE(v_limit, 0);
    PERFORM public.ensure_active_usage_counter(v_target_org_id);
    v_period_start := DATE_TRUNC('month', NOW());

    -- Non-cumulative resource validation (seats, repositories)
    IF p_resource IN ('seats', 'repositories') THEN
        SELECT 
            CASE p_resource
                WHEN 'seats' THEN (SELECT COUNT(*)::INT FROM public.memberships WHERE organization_id = v_target_org_id)
                WHEN 'repositories' THEN (SELECT COUNT(*)::INT FROM public.repositories WHERE organization_id = v_target_org_id)
            END INTO v_used;
        v_used := COALESCE(v_used, 0);

        IF (v_used + p_amount) > v_limit THEN
            RETURN jsonb_build_object(
                'allowed', false,
                'resource', p_resource,
                'used', v_used,
                'limit', v_limit,
                'remaining', GREATEST(0, v_limit - v_used),
                'reason', 'RESOURCE_LIMIT_REACHED',
                'message', format('Resource limit reached for %s.', p_resource)
            );
        END IF;

        RETURN jsonb_build_object(
            'allowed', true,
            'resource', p_resource,
            'used', v_used + p_amount,
            'limit', v_limit,
            'remaining', GREATEST(0, v_limit - (v_used + p_amount)),
            'reason', NULL,
            'message', 'Resource consumption validated.'
        );
    END IF;

    -- Atomic Cumulative UPDATE with strict limit boundary check (used + p_amount <= limit)
    IF p_resource = 'proposals' THEN
        UPDATE public.usage_counters
        SET used_proposals = used_proposals + p_amount, updated_at = NOW()
        WHERE organization_id = v_target_org_id 
          AND billing_period_start = v_period_start
          AND (used_proposals + p_amount) <= v_limit;
    ELSIF p_resource = 'code_jobs' THEN
        UPDATE public.usage_counters
        SET used_code_jobs = used_code_jobs + p_amount, updated_at = NOW()
        WHERE organization_id = v_target_org_id 
          AND billing_period_start = v_period_start
          AND (used_code_jobs + p_amount) <= v_limit;
    ELSIF p_resource = 'security_scans' THEN
        UPDATE public.usage_counters
        SET used_scans = used_scans + p_amount, updated_at = NOW()
        WHERE organization_id = v_target_org_id 
          AND billing_period_start = v_period_start
          AND (used_scans + p_amount) <= v_limit;
    ELSIF p_resource = 'ai_credits' THEN
        UPDATE public.usage_counters
        SET used_ai_credits = used_ai_credits + p_amount, updated_at = NOW()
        WHERE organization_id = v_target_org_id 
          AND billing_period_start = v_period_start
          AND (used_ai_credits + p_amount) <= v_limit;
    END IF;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    -- Fetch current usage for accurate response reporting
    SELECT 
        CASE p_resource
            WHEN 'proposals' THEN uc.used_proposals
            WHEN 'code_jobs' THEN uc.used_code_jobs
            WHEN 'security_scans' THEN uc.used_scans
            WHEN 'ai_credits' THEN uc.used_ai_credits
            ELSE 0
        END INTO v_used
    FROM public.usage_counters uc
    WHERE uc.organization_id = v_target_org_id AND uc.billing_period_start = v_period_start;

    v_used := COALESCE(v_used, 0);

    IF v_updated_rows = 0 THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'resource', p_resource,
            'used', v_used,
            'limit', v_limit,
            'remaining', GREATEST(0, v_limit - v_used),
            'reason', CASE WHEN p_resource = 'ai_credits' THEN 'AI_CREDIT_LIMIT_REACHED' ELSE 'RESOURCE_LIMIT_REACHED' END,
            'message', 'Atomic quota consumption rejected due to limit exhaustion or concurrency constraint.'
        );
    END IF;

    RETURN jsonb_build_object(
        'allowed', true,
        'resource', p_resource,
        'used', v_used,
        'limit', v_limit,
        'remaining', GREATEST(0, v_limit - v_used),
        'reason', NULL,
        'message', 'Quota successfully consumed.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Function Execution Privileges (Hardened Security Policy)
REVOKE EXECUTE ON FUNCTION public.ensure_active_usage_counter(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_active_usage_counter(UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.check_quota_atomic(UUID, TEXT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_quota_atomic(UUID, TEXT, INT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.consume_quota_atomic(UUID, TEXT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_quota_atomic(UUID, TEXT, INT) TO authenticated, service_role;
