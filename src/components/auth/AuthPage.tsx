"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import {
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Activity,
  Lock,
} from "lucide-react";
import { novoraApi } from "@/lib/api";

interface AuthPageProps {
  mode: "login" | "signup";
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Deterministic Evaluation",
    desc: "Evidence-backed rule checks, not opaque AI verdicts",
  },
  {
    icon: Activity,
    title: "Regression Monitoring",
    desc: "Track policy compliance across every agent release",
  },
  {
    icon: Sparkles,
    title: "Provider Agnostic",
    desc: "ElevenLabs, Twilio, AssemblyAI adapters built-in",
  },
];

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      router.replace("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* ── Animated background orbs ── */}
      <div aria-hidden="true" className="novora-orb novora-orb-1" />
      <div aria-hidden="true" className="novora-orb novora-orb-2" />
      <div aria-hidden="true" className="novora-orb novora-orb-3" />
      {/* Subtle grid overlay */}
      <div aria-hidden="true" className="novora-grid-bg" />

      <div className="absolute left-4 z-20 h-8 w-28 overflow-hidden rounded-full sm:left-8 sm:top-6 lg:left-12 lg:top-8">
        <Image
          src="/novora-logo-dark.png"
          alt="Novora"
          fill
          priority
          sizes="160px"
          className="rounded-full object-contain"
        />
      </div>

      {/* ── Left panel — hero + features (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 xl:p-16 relative z-10 mt-4">
        <div className="max-w-md">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-6"
            style={{
              backgroundColor: "var(--primary-subtle)",
              color: "var(--primary)",
              border: "1px solid var(--primary)",
            }}
          >
            <Sparkles size={11} />
            <span>AI Voice Agent Infrastructure</span>
          </div>

          <h1
            className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            Evaluate Voice Agents Against{" "}
            <span style={{ color: "var(--primary)" }}>Real Business Rules</span>
          </h1>

          <p
            className="text-base leading-relaxed mb-10"
            style={{ color: "var(--text-secondary)" }}
          >
            Novora tests conversational AI transcripts with transparent,
            evidence-backed deterministic checks. Every verdict links back to
            the exact dialogue turn.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "var(--primary-subtle)",
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={17} />
                </div>
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex items-center gap-3 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <Lock size={13} />
          <span>
            Enterprise-grade security · Tenant-isolated data · No model training
          </span>
        </div>
      </div>

      {/* ── Right panel — Auth form ── */}
      <div className="flex w-full lg:w-[45%] items-center justify-center px-4 py-12 sm:px-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div
            className="auth-card rounded-3xl border p-8 shadow-2xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Header */}
            <div className="mb-7">
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "var(--primary-subtle)",
                  color: "var(--primary)",
                }}
              >
                <ShieldCheck size={21} />
              </div>
              <h2
                className="text-2xl font-extrabold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {isSignup
                  ? "Join Novora to access the evaluation workspace."
                  : "Sign in to continue to your evaluation workspace."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
                style={{
                  backgroundColor: "var(--status-error-bg)",
                  borderColor: "var(--status-error)",
                  color: "var(--status-error)",
                }}
              >
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label
                    htmlFor="full-name"
                    className="mb-1.5 block text-xs font-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Full name
                  </label>
                  <input
                    id="full-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    className="auth-input w-full rounded-xl border px-3.5 py-3 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="auth-input w-full rounded-xl border px-3.5 py-3 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    required
                    minLength={isSignup ? 12 : undefined}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      isSignup ? "At least 12 characters" : "••••••••••••"
                    }
                    className="auth-input w-full rounded-xl border px-3.5 py-3 pr-11 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {isSignup && (
                  <p
                    className="mt-1.5 text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Use at least 12 characters for security.
                  </p>
                )}
              </div>

              <button
                type="submit"
                id={isSignup ? "signup-submit-btn" : "login-submit-btn"}
                disabled={submitting}
                className="auth-submit-btn mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    <span>
                      {isSignup ? "Creating account..." : "Signing in..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{isSignup ? "Create account" : "Sign in"}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p
              className="mt-6 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              {isSignup ? "Already have an account?" : "New to Novora?"}{" "}
              <Link
                href={isSignup ? "/login" : "/signup"}
                className="font-bold hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {isSignup ? "Sign in" : "Create an account"}
              </Link>
            </p>

            {/* Trust badges */}
            <div
              className="mt-6 border-t pt-5 flex flex-wrap items-center justify-center gap-4"
              style={{ borderColor: "var(--border-color)" }}
            >
              {["SOC 2 Ready", "GDPR Aware", "Encrypted at Rest"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="flex items-center gap-1.5 text-[11px] font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <CheckCircle2
                      size={12}
                      style={{ color: "var(--status-success)" }}
                    />
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
