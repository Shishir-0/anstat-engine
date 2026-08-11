# ANSTAT AI ENGINE — Authentication + Multi-Tenant Identity Architecture

## Overview

Phase 7 Step 3 transitions the ANSTAT AI ENGINE from mock-only identity assumptions into a production-grade Supabase Auth + PostgreSQL multi-tenant architecture.

```
AUTH USER (auth.users)
    ↓
PROFILE (public.profiles)
    ↓
ORGANIZATION (public.organizations)
    ↓
MEMBERSHIP (public.memberships)
    ↓
ROLE (user_role)
    ↓
TENANT-AWARE RLS (public.current_organization_id())
    ↓
APPLICATION (Next.js App Router)
```

---

## 1. Database Schema & Migration Strategy

### Migration Sequence Integrity
- Deployed migrations `0001` through `0014` remain completely unmodified.
- Schema changes for identity integration are introduced via additive migration:
  - `supabase/migrations/0015_auth_identity.sql`

### Foreign Key Enforcement
- Enforces 1:1 relationship between `profiles.id` and `auth.users.id`:
  ```sql
  ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_auth_users
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ```

---

## 2. Automated User Provisioning Lifecycle

When a new user registers via Supabase Auth (`supabase.auth.signUp`), an database trigger executes automatically:

```sql
auth.users INSERT 
       ↓
public.handle_new_user() [SECURITY DEFINER]
       ↓
INSERT INTO public.profiles
       ↓
INSERT INTO public.organizations (slug generated via generate_unique_org_slug)
       ↓
INSERT INTO public.memberships (role = 'owner')
```

### Signup Metadata Security
- Browser-supplied signup metadata (`full_name`, `workspace_name`) is used exclusively for display and display naming during workspace creation.
- Browser metadata is sanitized and NEVER trusted for authorization or privilege escalation.
- Organization slug is derived server-side via `generate_unique_org_slug(base_name)` to enforce uniqueness without user input collision.
- The trigger uses `ON CONFLICT` handlers and checks to prevent duplicate provisioning or profile duplication if executed multiple times.

---

## 3. Multi-Tenant Context & RLS Hardening

### Hardened RLS Helpers
The RLS helpers in `public.current_organization_id()` and `public.current_user_role()` derive security context from trusted authentication state:

1. Extract `sub` (user_id) from `auth.uid()`.
2. Inspect JWT claim `org_id` or `user_metadata->'organization_id'`.
3. **Membership Server Verification**: The helper validates that `user_id` actually possesses an active record in `public.memberships` for `org_id`. Any arbitrary client claim spoofing is rejected.
4. **Fallback**: If no valid `org_id` claim is active, defaults to the user's primary/first organization membership.

---

## 4. Supabase Client Architecture & Secret Boundaries

### Client Modules Architecture
- `lib/supabase/client.ts`: Browser-safe client using `@supabase/ssr` `createBrowserClient` with public/anon keys (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
- `lib/supabase/server.ts`: Server-side client using `@supabase/ssr` `createServerClient` with Next.js headers/cookies for Server Components and Actions.
- `lib/supabase/service-role.ts`: Server-only privileged client utilizing `SUPABASE_SERVICE_ROLE_KEY`. Explicitly throws a runtime security error if evaluated in client browser context (`typeof window !== 'undefined'`).

### Service Registry Abstraction
- UI components interact with identity strictly through `getAuthService()`.
- `ServiceRegistry` dynamically routes to `SupabaseAuthService` when Supabase credentials exist or `MockAuthService` when running in isolated mock mode.

---

## 5. Next.js SSR Middleware Route Protection

`middleware.ts` enforces session refreshing and route guards at the network boundary:

- **Public Routes**: `/login`, `/signup`, `/forgot-password`, landing pages.
- **Protected Routes**: `/dashboard`, `/proposals`, `/code`, `/security`, `/debugging`, `/jobs`, `/deployments`, `/settings`, `/onboarding`.
- Unauthenticated requests targeting protected routes are redirected to `/login?redirectTo=...`.
- Authenticated requests targeting `/login` or `/signup` are redirected to `/dashboard`.
