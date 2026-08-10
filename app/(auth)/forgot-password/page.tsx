'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-md">
          A
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Reset Your Password</h1>
        <p className="text-xs text-slate-500">Enter your email to receive a password reset link</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {submitted ? (
            <div className="text-center space-y-3 py-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Reset link sent!</h3>
              <p className="text-xs text-slate-500">Check your email inbox for instructions to reset your password.</p>
              <Link href="/login" className="block pt-2">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
              <Input label="Work Email" type="email" placeholder="shishir@agency.com" required />
              <Button variant="primary" type="submit" className="w-full">
                Send Reset Link
              </Button>
              <Link href="/login" className="block text-center text-xs text-slate-500 hover:text-slate-700">
                Back to Login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
