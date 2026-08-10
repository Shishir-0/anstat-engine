'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding');
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
          <form onSubmit={handleSignup} className="space-y-4">
            <Input label="Full Name" placeholder="Shishir Kumar" required />
            <Input label="Work Email" type="email" placeholder="shishir@agency.com" required />
            <Input label="Organization / Studio Name" placeholder="Northstar Software Studio" required />
            <Input label="Password" type="password" placeholder="••••••••••••" required />
            <Button variant="primary" type="submit" className="w-full">
              Create Workspace <ArrowRight className="ml-2 h-4 w-4" />
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
