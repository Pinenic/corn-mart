"use client";
// app/(auth)/forgot-password/page.jsx
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import {
  AuthCard, AuthHeading, FormField, TextInput,
  SubmitButton, AlertBanner,
} from "@/components/auth/AuthPrimitives";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [fError,  setFError]  = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setFError("");
    if (!email.trim())                     { setFError("Email is required");        return; }
    if (!/\S+@\S+\.\S+/.test(email.trim())) { setFError("Enter a valid email address"); return; }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        // redirectTo must be an allowed URL in your Supabase project settings
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ─────────────────────────────────────────
  if (sent) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center text-center py-4 space-y-5">
          {/* Animated envelope */}
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "var(--color-accent-subtle)" }}>
            <Mail size={36} style={{ color: "var(--color-accent)" }} className="animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-[22px] font-bold" style={{ color: "var(--color-text-primary)" }}>
              Check your email
            </h2>
            <p className="text-[14px] leading-relaxed max-w-xs mx-auto"
              style={{ color: "var(--color-text-secondary)" }}>
              We've sent a password reset link to{" "}
              <strong className="text-[var(--color-text-primary)]">{email}</strong>.
              It may take a minute to arrive.
            </p>
          </div>

          <div className="w-full p-4 rounded-2xl border space-y-2 text-left"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
            <p className="text-[12px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>
              Didn't get it?
            </p>
            {[
              "Check your spam or junk folder",
              "Make sure you typed the right email",
              "Wait 1–2 minutes then try again",
            ].map(tip => (
              <div key={tip} className="flex items-start gap-2 text-[12px]"
                style={{ color: "var(--color-text-secondary)" }}>
                <span className="text-[var(--color-accent)] mt-0.5">·</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="text-[13px] font-medium hover:underline"
            style={{ color: "var(--color-accent)" }}>
            Try a different email
          </button>

          <Link href="/sign-in"
            className="flex items-center gap-1.5 text-[13px]"
            style={{ color: "var(--color-text-muted)" }}>
            <ArrowLeft size={13} /> Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  // ── Request form ──────────────────────────────────────────
  return (
    <AuthCard>
      <div className="mb-6">
        <Link href="/sign-in"
          className="flex items-center gap-1.5 text-[13px] font-medium hover:underline mb-5"
          style={{ color: "var(--color-text-secondary)" }}>
          <ArrowLeft size={13} /> Back to sign in
        </Link>
        <AuthHeading
          title="Reset your password"
          subtitle="Enter your email and we'll send a reset link"
        />
      </div>

      <AlertBanner type="error" message={error} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Email address" error={fError}>
          <TextInput
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={fError}
            autoComplete="email"
            autoFocus
          />
        </FormField>

        <SubmitButton loading={loading}>
          {loading ? "Sending link…" : "Send reset link"}
        </SubmitButton>
      </form>

      <p className="text-center text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
        Remember your password?{" "}
        <Link href="/sign-in" className="font-semibold hover:underline"
          style={{ color: "var(--color-accent)" }}>
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
