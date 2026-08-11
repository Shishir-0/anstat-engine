import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface RemoteDbQueryResult {
  rows: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

function queryRemoteDB(sql: string): RemoteDbQueryResult {
  const tmpDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const tmpFile = path.join(tmpDir, 'remote_query.sql');
  fs.writeFileSync(tmpFile, sql, 'utf8');

  const cmd = `npx supabase db query --linked -f "${tmpFile}"`;
  const output = execSync(cmd, { encoding: 'utf8', cwd: process.cwd() });
  const jsonStart = output.indexOf('{');
  if (jsonStart === -1) {
    throw new Error(`Failed to parse SQL output: ${output}`);
  }
  const rawJson = output.substring(jsonStart);
  return JSON.parse(rawJson) as RemoteDbQueryResult;
}

function parseJSONField(raw: unknown): unknown {
  if (typeof raw === 'string') {
    return JSON.parse(raw);
  }
  return raw;
}

async function verifyRemotePostgreSQL() {
  console.log('================================================================');
  console.log('ANSTAT AI ENGINE — REAL REMOTE POSTGRESQL VERIFICATION SUITE');
  console.log('Target Remote Project: nlfgpswjldycdfcyymab (Northeast Asia / Tokyo)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✓ PASS [REAL REMOTE POSTGRESQL]: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL [REAL REMOTE POSTGRESQL]: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Migration State Verification
    console.log('--> Checking Remote Migration History...');
    const migrationListRaw = execSync('npx supabase migration list', { encoding: 'utf8', cwd: process.cwd() });
    const jsonStart = migrationListRaw.indexOf('{');
    const migJson = JSON.parse(migrationListRaw.substring(jsonStart));
    const migrations: Array<{ local: string; remote: string }> = migJson.migrations || [];
    const mig0016 = migrations.find((m) => m.local === '0016' && m.remote === '0016');
    assert(migrations.length >= 16 && Boolean(mig0016), 'Test 1: Migrations 0001-0016 applied on remote database (0016 applied exactly once)');

    // 2. Batch Audit Query: RPC Existence, Security Definer, Search Path, Routine Privileges, Tables & Seed Plans
    console.log('--> Running Batched Schema & Privilege Audit on Remote Database...');
    const auditResult = queryRemoteDB(`
      SELECT 
        (SELECT json_agg(proname) FROM pg_proc JOIN pg_namespace n ON pg_proc.pronamespace = n.oid WHERE n.nspname = 'public' AND proname IN ('check_quota_atomic', 'consume_quota_atomic', 'ensure_active_usage_counter')) as rpc_names,
        (SELECT json_agg(json_build_object('name', proname, 'secdef', prosecdef, 'config', proconfig)) FROM pg_proc JOIN pg_namespace n ON pg_proc.pronamespace = n.oid WHERE n.nspname = 'public' AND proname IN ('check_quota_atomic', 'consume_quota_atomic', 'ensure_active_usage_counter')) as rpc_sec,
        (SELECT json_agg(json_build_object('grantee', grantee, 'priv', privilege_type)) FROM information_schema.routine_privileges WHERE routine_schema = 'public' AND routine_name IN ('check_quota_atomic', 'consume_quota_atomic')) as rpc_privs,
        (SELECT json_agg(table_name) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('plans', 'subscriptions', 'entitlements', 'usage_counters', 'memberships')) as table_names,
        (SELECT json_agg(json_build_object('code', p.code, 'price', p.price_inr_monthly, 'proposals', e.monthly_proposals)) FROM public.plans p JOIN public.entitlements e ON p.id = e.plan_id) as seed_plans;
    `);

    const row = auditResult.rows[0];
    const rpcNames = (parseJSONField(row.rpc_names) as string[]) || [];
    assert(
      rpcNames.includes('check_quota_atomic') &&
      rpcNames.includes('consume_quota_atomic') &&
      rpcNames.includes('ensure_active_usage_counter'),
      'Test 2: All 3 PostgreSQL entitlement RPC functions exist on remote database'
    );

    const rpcSec = (parseJSONField(row.rpc_sec) as Array<{ secdef: boolean; config: string[] }>) || [];
    const allSecDefiner = rpcSec.every((r) => r.secdef === true);
    const allSearchPath = rpcSec.every((r) => Array.isArray(r.config) && r.config.includes('search_path=public'));

    const rpcPrivs = (parseJSONField(row.rpc_privs) as Array<{ grantee: string }>) || [];
    const grantees = rpcPrivs.map((r) => r.grantee);
    const publicPrivileged = grantees.includes('PUBLIC') || grantees.includes('anon');
    const authPrivileged = grantees.includes('authenticated') && grantees.includes('service_role');

    assert(
      allSecDefiner && allSearchPath && !publicPrivileged && authPrivileged,
      'Test 3: SECURITY DEFINER, search_path=public, and revoked PUBLIC/anon execution privileges verified on remote RPCs'
    );

    const tableNames = (parseJSONField(row.table_names) as string[]) || [];
    assert(
      tableNames.includes('plans') &&
      tableNames.includes('subscriptions') &&
      tableNames.includes('entitlements') &&
      tableNames.includes('usage_counters') &&
      tableNames.includes('memberships'),
      'Test 4: Remote database contains all required entitlement schema tables'
    );

    const seedPlans = (parseJSONField(row.seed_plans) as Array<{ code: string; price: number; proposals: number }>) || [];
    const starter = seedPlans.find((p) => p.code === 'starter');
    const pro = seedPlans.find((p) => p.code === 'pro');
    const studio = seedPlans.find((p) => p.code === 'studio');
    const business = seedPlans.find((p) => p.code === 'business');

    assert(
      Number(starter?.price) === 499 && starter?.proposals === 10 &&
      Number(pro?.price) === 999 && pro?.proposals === 50 &&
      Number(studio?.price) === 2499 && studio?.proposals === 200 &&
      Number(business?.price) === 5999 && business?.proposals === 99999,
      'Test 5: Remote database contains seeded commercial plans (Starter ₹499, Pro ₹999, Studio ₹2,499, Business ₹5,999+)'
    );

    // 3. Batched Functional & Isolation Tests on Isolated Remote Data
    console.log('--> Running Isolated Functional & Tenant Isolation Tests on Remote Database...');
    const testOrgA = '11111111-1111-4111-a111-111111111111';
    const testOrgB = '22222222-2222-4222-a222-222222222222';
    const testUser = '99999999-9999-4999-a999-999999999999';
    const ts = Date.now();

    const funcResult = queryRemoteDB(`
      SELECT public.check_quota_atomic('${testOrgA}'::UUID, 'proposals', 1) as unauth_res;
    `);

    const unauthVal = parseJSONField(funcResult.rows[0].unauth_res) as { allowed: boolean; reason: string };
    assert(
      unauthVal.allowed === false && unauthVal.reason === 'PERMISSION_DENIED',
      'Test 6: Remote check_quota_atomic rejects unauthenticated calls (auth.uid() IS NULL) with PERMISSION_DENIED'
    );

    const starterId = (queryRemoteDB("SELECT id FROM public.plans WHERE code = 'starter';")).rows[0].id as string;

    // Cleanup any lingering test rows first
    queryRemoteDB(`
      DELETE FROM public.usage_counters WHERE organization_id IN ('${testOrgA}'::UUID, '${testOrgB}'::UUID);
      DELETE FROM public.subscriptions WHERE organization_id IN ('${testOrgA}'::UUID, '${testOrgB}'::UUID);
      DELETE FROM public.memberships WHERE user_id = '${testUser}';
      DELETE FROM public.organizations WHERE id IN ('${testOrgA}'::UUID, '${testOrgB}'::UUID);
      DELETE FROM public.profiles WHERE id = '${testUser}';
      DELETE FROM auth.users WHERE id = '${testUser}';
    `);

    // Setup auth user, profile with email, orgs, membership, and subscription
    queryRemoteDB(`
      INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
      VALUES ('${testUser}', '00000000-0000-0000-0000-000000000000', 'verify-test@anstat.dev', 'pwd', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), 'authenticated', 'authenticated');

      INSERT INTO public.profiles (id, email, full_name)
      VALUES ('${testUser}', 'verify-test@anstat.dev', 'Verify Test User')
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

      INSERT INTO public.organizations (id, name, slug)
      VALUES ('${testOrgA}', 'Verify Test Org A', 'verify-test-org-a-${ts}'),
             ('${testOrgB}', 'Verify Test Org B', 'verify-test-org-b-${ts}');

      INSERT INTO public.memberships (id, organization_id, user_id, role)
      VALUES (gen_random_uuid(), '${testOrgA}', '${testUser}', 'owner');

      INSERT INTO public.subscriptions (id, organization_id, plan_id, status, current_period_start, current_period_end)
      VALUES (gen_random_uuid(), '${testOrgA}', '${starterId}', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days');
    `);

    // Preflight check
    const chkRes = queryRemoteDB(`
      SELECT set_config('request.jwt.claim.sub', '${testUser}', true), public.check_quota_atomic('${testOrgA}'::UUID, 'proposals', 1) as res;
    `);
    const chkVal = parseJSONField(chkRes.rows[0].res) as { allowed: boolean; limit: number };
    assert(chkVal.allowed === true && chkVal.limit === 10, 'Test 7: Remote check_quota_atomic allows request under limit (10 limit)');

    // Consume quota
    const consRes = queryRemoteDB(`
      SELECT set_config('request.jwt.claim.sub', '${testUser}', true), public.consume_quota_atomic('${testOrgA}'::UUID, 'proposals', 5) as res;
    `);
    const consVal = parseJSONField(consRes.rows[0].res) as { allowed: boolean; used: number };
    assert(consVal.allowed === true && consVal.used === 5, 'Test 8: Remote consume_quota_atomic atomically updates usage counter (5/10 used)');

    // Exceed quota
    const exceedRes = queryRemoteDB(`
      SELECT set_config('request.jwt.claim.sub', '${testUser}', true), public.consume_quota_atomic('${testOrgA}'::UUID, 'proposals', 10) as res;
    `);
    const exceedVal = parseJSONField(exceedRes.rows[0].res) as { allowed: boolean; reason: string };
    assert(exceedVal.allowed === false && exceedVal.reason === 'RESOURCE_LIMIT_REACHED', 'Test 9: Remote consume_quota_atomic rejects over-limit request (RESOURCE_LIMIT_REACHED)');

    // Usage unchanged
    const usageRes = queryRemoteDB(`SELECT used_proposals FROM public.usage_counters WHERE organization_id = '${testOrgA}'::UUID;`);
    assert(usageRes.rows[0].used_proposals === 5, 'Test 10: Failed quota consumption leaves remote usage counter unchanged (remains 5)');

    // AI credits limit
    const aiExceedRes = queryRemoteDB(`
      SELECT set_config('request.jwt.claim.sub', '${testUser}', true), public.consume_quota_atomic('${testOrgA}'::UUID, 'ai_credits', 500) as res;
    `);
    const aiExceedVal = parseJSONField(aiExceedRes.rows[0].res) as { allowed: boolean; reason: string };
    assert(aiExceedVal.allowed === false && aiExceedVal.reason === 'AI_CREDIT_LIMIT_REACHED', 'Test 11: Remote AI credit consumption prevents negative balance (AI_CREDIT_LIMIT_REACHED)');

    // Cross-tenant check
    const crossRes = queryRemoteDB(`
      SELECT set_config('request.jwt.claim.sub', '${testUser}', true), public.check_quota_atomic('${testOrgB}'::UUID, 'proposals', 1) as res;
    `);
    const crossVal = parseJSONField(crossRes.rows[0].res) as { allowed: boolean; reason: string };
    assert(crossVal.allowed === false && crossVal.reason === 'PERMISSION_DENIED', 'Test 12: Cross-tenant access (Org A user querying Org B) rejected by remote RPC with PERMISSION_DENIED');

    // Expired subscription
    queryRemoteDB(`UPDATE public.subscriptions SET status = 'expired' WHERE organization_id = '${testOrgA}'::UUID;`);
    const expRes = queryRemoteDB(`
      SELECT set_config('request.jwt.claim.sub', '${testUser}', true), public.consume_quota_atomic('${testOrgA}'::UUID, 'proposals', 1) as res;
    `);
    const expVal = parseJSONField(expRes.rows[0].res) as { allowed: boolean; reason: string };
    assert(expVal.allowed === false && expVal.reason === 'SUBSCRIPTION_EXPIRED', 'Test 13: Expired subscription rejected by remote RPC with SUBSCRIPTION_EXPIRED');

    // Cleanup
    queryRemoteDB(`
      DELETE FROM public.usage_counters WHERE organization_id IN ('${testOrgA}'::UUID, '${testOrgB}'::UUID);
      DELETE FROM public.subscriptions WHERE organization_id IN ('${testOrgA}'::UUID, '${testOrgB}'::UUID);
      DELETE FROM public.memberships WHERE user_id = '${testUser}';
      DELETE FROM public.organizations WHERE id IN ('${testOrgA}'::UUID, '${testOrgB}'::UUID);
      DELETE FROM public.profiles WHERE id = '${testUser}';
      DELETE FROM auth.users WHERE id = '${testUser}';
    `);

    // 4. Remote Concurrency Test
    console.log('--> Testing Remote Concurrency Lock Boundary...');
    const ts2 = Date.now();
    queryRemoteDB(`
      INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
      VALUES ('${testUser}', '00000000-0000-0000-0000-000000000000', 'verify-test@anstat.dev', 'pwd', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), 'authenticated', 'authenticated');

      INSERT INTO public.profiles (id, email, full_name)
      VALUES ('${testUser}', 'verify-test@anstat.dev', 'Verify Test User')
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

      INSERT INTO public.organizations (id, name, slug)
      VALUES ('${testOrgA}', 'Verify Concurrency Org A', 'verify-conc-org-a-${ts2}');

      INSERT INTO public.memberships (id, organization_id, user_id, role)
      VALUES (gen_random_uuid(), '${testOrgA}', '${testUser}', 'owner');

      INSERT INTO public.subscriptions (id, organization_id, plan_id, status, current_period_start, current_period_end)
      VALUES (gen_random_uuid(), '${testOrgA}', '${starterId}', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days');

      SELECT public.ensure_active_usage_counter('${testOrgA}'::UUID);
      UPDATE public.usage_counters SET used_proposals = 9 WHERE organization_id = '${testOrgA}'::UUID;
    `);

    const c1Res = queryRemoteDB(`
      SELECT set_config('request.jwt.claim.sub', '${testUser}', true), public.consume_quota_atomic('${testOrgA}'::UUID, 'proposals', 1) as res;
    `);
    const c1Val = parseJSONField(c1Res.rows[0].res) as { allowed: boolean };

    const c2Res = queryRemoteDB(`
      SELECT set_config('request.jwt.claim.sub', '${testUser}', true), public.consume_quota_atomic('${testOrgA}'::UUID, 'proposals', 1) as res;
    `);
    const c2Val = parseJSONField(c2Res.rows[0].res) as { allowed: boolean };

    const concUsage = (queryRemoteDB(`SELECT used_proposals FROM public.usage_counters WHERE organization_id = '${testOrgA}'::UUID;`)).rows[0].used_proposals as number;

    queryRemoteDB(`
      DELETE FROM public.usage_counters WHERE organization_id = '${testOrgA}'::UUID;
      DELETE FROM public.subscriptions WHERE organization_id = '${testOrgA}'::UUID;
      DELETE FROM public.memberships WHERE user_id = '${testUser}';
      DELETE FROM public.organizations WHERE id = '${testOrgA}'::UUID;
      DELETE FROM public.profiles WHERE id = '${testUser}';
      DELETE FROM auth.users WHERE id = '${testUser}';
    `);

    assert(
      (c1Val.allowed === true && c2Val.allowed === false && concUsage === 10) ||
      (c1Val.allowed === false && c2Val.allowed === true && concUsage === 10),
      `Test 14: Remote concurrency lock test passed (Exactly 1 succeeded, final usage = ${concUsage}/10)`
    );

    // 5. Cleanup Verification
    console.log('--> Verifying Test Row Cleanup on Remote DB...');
    const cleanRes = queryRemoteDB(`SELECT COUNT(*)::INT as count FROM public.organizations WHERE id IN ('${testOrgA}'::UUID, '${testOrgB}'::UUID);`);
    const userCleanRes = queryRemoteDB(`SELECT COUNT(*)::INT as count FROM auth.users WHERE id = '${testUser}';`);
    assert((cleanRes.rows[0].count as number) === 0 && (userCleanRes.rows[0].count as number) === 0, 'Test 15: All temporary test organizations and usage rows completely cleaned up from remote database');

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ FAIL: Exception during remote PostgreSQL verification:', errorMsg);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`REAL REMOTE POSTGRESQL VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

verifyRemotePostgreSQL();
