'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GitBranch, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('shishir@northstarstudio.dev');
  const [password, setPassword] = React.useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
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
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button variant="primary" type="submit" className="w-full">
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative flex items-center justify-center border-t border-slate-100 my-4">
            <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400">Or continue with</span>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full"
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
