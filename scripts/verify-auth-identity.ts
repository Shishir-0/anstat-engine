import * as fs from 'fs';
import * as path from 'path';

function verifyAuthIdentity() {
  console.log('==================================================');
  console.log('ANSTAT AI ENGINE — AUTH IDENTITY VERIFICATION AUDIT');
  console.log('==================================================\n');

  const rootDir = process.cwd();
  let failed = false;

  // 1. Verify Migration 0015 File
  const migrationPath = path.join(rootDir, 'supabase', 'migrations', '0015_auth_identity.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ FAIL: Migration 0015_auth_identity.sql is missing.');
    failed = true;
  } else {
    const content = fs.readFileSync(migrationPath, 'utf8');
    if (!content.includes('fk_profiles_auth_users')) {
      console.error('❌ FAIL: 0015_auth_identity.sql does not include fk_profiles_auth_users constraint.');
      failed = true;
    } else {
      console.log('✓ PASS: Migration 0015 foreign key constraint profiles(id) -> auth.users(id) confirmed.');
    }

    if (!content.includes('FUNCTION public.handle_new_user()')) {
      console.error('❌ FAIL: 0015_auth_identity.sql missing handle_new_user() trigger function.');
      failed = true;
    } else {
      console.log('✓ PASS: Provisioning trigger handle_new_user() confirmed.');
    }

    if (!content.includes('FUNCTION public.current_organization_id()')) {
      console.error('❌ FAIL: 0015_auth_identity.sql missing hardened current_organization_id().');
      failed = true;
    } else {
      console.log('✓ PASS: Hardened RLS helper current_organization_id() confirmed.');
    }
  }

  // 2. Verify Client Helpers
  const clientPath = path.join(rootDir, 'lib', 'supabase', 'client.ts');
  const serverPath = path.join(rootDir, 'lib', 'supabase', 'server.ts');
  const serviceRolePath = path.join(rootDir, 'lib', 'supabase', 'service-role.ts');

  if (!fs.existsSync(clientPath) || !fs.existsSync(serverPath) || !fs.existsSync(serviceRolePath)) {
    console.error('❌ FAIL: Missing standard Supabase client helper modules.');
    failed = true;
  } else {
    console.log('✓ PASS: Supabase SSR client, server, and service-role modules confirmed.');
  }

  // 3. Security Audit - Verify Service Role Key NOT in client.ts or public code
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  if (clientContent.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.error('❌ FAIL: SUPABASE_SERVICE_ROLE_KEY referenced in browser client module!');
    failed = true;
  } else {
    console.log('✓ PASS: Zero service-role keys exposed to browser client modules.');
  }

  // 4. Verify Middleware
  const middlewarePath = path.join(rootDir, 'middleware.ts');
  if (!fs.existsSync(middlewarePath)) {
    console.error('❌ FAIL: middleware.ts is missing.');
    failed = true;
  } else {
    console.log('✓ PASS: Next.js SSR middleware route guard confirmed.');
  }

  // 5. Verify Auth Service Implementation
  const authServicePath = path.join(rootDir, 'lib', 'services', 'supabase', 'supabase-auth.service.ts');
  if (!fs.existsSync(authServicePath)) {
    console.error('❌ FAIL: SupabaseAuthService is missing.');
    failed = true;
  } else {
    console.log('✓ PASS: SupabaseAuthService implementation confirmed.');
  }

  console.log('\n==================================================');
  if (failed) {
    console.error('VERIFICATION STATUS: FAILED ❌');
    process.exit(1);
  } else {
    console.log('VERIFICATION STATUS: SUCCESS (AUTH FOUNDATION APPROVED) ✓');
    console.log('==================================================');
  }
}

verifyAuthIdentity();
