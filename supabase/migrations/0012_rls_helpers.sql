-- ANSTAT AI ENGINE - Database Migration 0012: RLS Helper Functions
-- Security Context Extractors for Supabase JWT Claims

CREATE OR REPLACE FUNCTION auth.current_organization_id() 
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'org_id', '')::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.current_user_role() 
RETURNS user_role AS $$
DECLARE
    v_org_id UUID;
    v_user_id UUID;
    v_role user_role;
BEGIN
    v_org_id := auth.current_organization_id();
    v_user_id := auth.uid();
    
    IF v_org_id IS NULL OR v_user_id IS NULL THEN
        RETURN 'viewer'::user_role;
    END IF;

    SELECT role INTO v_role 
    FROM memberships 
    WHERE organization_id = v_org_id AND user_id = v_user_id;

    RETURN COALESCE(v_role, 'viewer'::user_role);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
