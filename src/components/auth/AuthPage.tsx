'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import { ArrowRight, LoaderCircle, Eye, EyeOff, Lock, User, Mail } from 'lucide-react';
import { novoraApi } from '@/lib/api';
import { AuthHero } from './AuthHero';

interface AuthPageProps {
  mode: 'login' | 'signup';
}

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const isSignup = mode === 'signup';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignup) {
        await novoraApi.signup({ full_name: fullName, email, password });
      } else {
        await novoraApi.login({ email, password });
      }
      router.replace('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AuthHero />

      <div className="flex flex-1 flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-sm rounded-2xl border p-8 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {isSignup ? 'Create Novora Account' : 'Sign in to Novora'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {isSignup ? 'Enter your details to register a workspace.' : 'Access your voice agent evaluation suite.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignup && (
              <div>
                <label className="font-bold text-[var(--text-primary)] block mb-1">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border pl-9 pr-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Work Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border pl-9 pr-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border pl-9 pr-9 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border p-2.5 text-xs bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
            >
              {submitting ? <LoaderCircle size={15} className="animate-spin" /> : <ArrowRight size={15} />}
              <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
            {isSignup ? (
              <span>Already registered? <Link href="/login" className="font-bold text-[var(--primary)] hover:underline">Sign in</Link></span>
            ) : (
              <span>Don&apos;t have an account? <Link href="/signup" className="font-bold text-[var(--primary)] hover:underline">Sign up</Link></span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
