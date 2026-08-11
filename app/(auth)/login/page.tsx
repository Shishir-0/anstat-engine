'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GitBranch, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { getAuthService } from '@/lib/services/registry';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const authService = getAuthService();
      const authState = await authService.login({ email, password });
      if (authState.isAuthenticated) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
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
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Sign in to ANSTAT AI Engine</h1>
        <p className="text-xs text-slate-500">AI-native operating layer for software studios</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="shishir@northstarstudio.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative flex items-center justify-center border-t border-slate-100 my-4">
            <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400">Or continue with</span>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full"
            disabled={isLoading}
          >
            <GitBranch className="mr-2 h-4 w-4 text-slate-700" /> Continue with GitHub
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
