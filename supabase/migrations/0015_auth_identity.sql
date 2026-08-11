-- ANSTAT AI ENGINE - Database Migration 0015: Auth & Identity Integration
-- Establishes 1:1 relationship between profiles and auth.users, user provisioning trigger, and hardened RLS helpers

-- 1. Enforce Foreign Key Relationship between profiles and auth.users
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_profiles_auth_users' AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT fk_profiles_auth_users
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Unique Organization Slug Generator Function
CREATE OR REPLACE FUNCTION public.generate_unique_org_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_slug TEXT;
    v_counter INT := 1;
    v_candidate TEXT;
BEGIN
    -- Normalize base_name to a URL-friendly slug
    v_slug := LOWER(REGEXP_REPLACE(COALESCE(base_name, 'workspace'), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := TRIM(BOTH '-' FROM v_slug);
    IF v_slug = '' THEN
        v_slug := 'workspace';
    END IF;

    v_candidate := v_slug;
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = v_candidate) LOOP
        v_counter := v_counter + 1;
        v_candidate := v_slug || '-' || v_counter;
    END LOOP;

    RETURN v_candidate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Identity Provisioning Trigger Function for New Auth Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_org_name TEXT;
    v_org_slug TEXT;
    v_org_id UUID;
BEGIN
    -- Read metadata supplied during Supabase signup
    v_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        SPLIT_PART(NEW.email, '@', 1)
    );

    v_org_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'workspace_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'organization_name'), ''),
        v_full_name || '''s Studio'
    );

    -- 1. Create User Profile
    INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
        updated_at = NOW();

    -- Check if user already owns an organization to avoid duplicate organization creation on trigger re-runs
    IF NOT EXISTS (
        SELECT 1 FROM public.memberships
        WHERE user_id = NEW.id AND role = 'owner'
    ) THEN
        -- 2. Generate unique organization slug
        v_org_slug := public.generate_unique_org_slug(v_org_name);

        -- 3. Create Initial Organization
        INSERT INTO public.organizations (id, name, slug, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            v_org_name,
            v_org_slug,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_org_id;

        -- 4. Link User as Owner of the Organization
        INSERT INTO public.memberships (id, organization_id, user_id, role, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            v_org_id,
            NEW.id,
            'owner'::user_role,
            NOW(),
            NOW()
        )
        ON CONFLICT (organization_id, user_id) DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user provisioning error: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 4. Trigger Definition on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Hardened RLS Helper Functions
-- Verify organization membership server-side & prevent arbitrary org spoofing
CREATE OR REPLACE FUNCTION public.current_organization_id() 
RETURNS UUID AS $$
DECLARE
    v_claims JSON;
    v_org_id UUID;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Extract JWT claims if present
    BEGIN
        v_claims := NULLIF(current_setting('request.jwt.claims', true), '')::json;
    EXCEPTION WHEN OTHERS THEN
        v_claims := NULL;
    END;

    IF v_claims IS NOT NULL THEN
        -- Check org_id claim in JWT
        v_org_id := NULLIF(v_claims->>'org_id', '')::UUID;
        IF v_org_id IS NOT NULL THEN
            -- Validate user is a member of this organization
            IF EXISTS (SELECT 1 FROM public.memberships WHERE organization_id = v_org_id AND user_id = v_user_id) THEN
                RETURN v_org_id;
            END IF;
        END IF;

        -- Check user_metadata organization_id
        v_org_id := NULLIF(v_claims->'user_metadata'->>'organization_id', '')::UUID;
        IF v_org_id IS NOT NULL THEN
            IF EXISTS (SELECT 1 FROM public.memberships WHERE organization_id = v_org_id AND user_id = v_user_id) THEN
                RETURN v_org_id;
            END IF;
        END IF;
    END IF;

    -- Fallback: Default to user's first created membership organization
    SELECT organization_id INTO v_org_id
    FROM public.memberships
    WHERE user_id = v_user_id
    ORDER BY created_at ASC
    LIMIT 1;

    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.current_user_role() 
RETURNS user_role AS $$
DECLARE
    v_org_id UUID;
    v_user_id UUID;
    v_role user_role;
BEGIN
    v_org_id := public.current_organization_id();
    v_user_id := auth.uid();
    
    IF v_org_id IS NULL OR v_user_id IS NULL THEN
        RETURN 'viewer'::user_role;
    END IF;

    SELECT role INTO v_role 
    FROM public.memberships 
    WHERE organization_id = v_org_id AND user_id = v_user_id;

    RETURN COALESCE(v_role, 'viewer'::user_role);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;
