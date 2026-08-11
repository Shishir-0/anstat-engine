'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { getAuthService } from '@/lib/services/registry';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [orgName, setOrgName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      const authService = getAuthService();
      const authState = await authService.signup({
        name: fullName,
        email,
        organizationName: orgName,
        password,
      });

      if (authState.isAuthenticated) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setInfoMessage('Account created! Please check your email to confirm your signup before logging in.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-md">
          A
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Create ANSTAT Workspace</h1>
        <p className="text-xs text-slate-500">Start your agency software delivery operating layer</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Shishir Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Work Email"
              type="email"
              placeholder="shishir@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Organization / Studio Name"
              placeholder="Northstar Software Studio"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Workspace...
                </>
              ) : (
                <>
                  Create Workspace <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            Already have a workspace?{' '}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
