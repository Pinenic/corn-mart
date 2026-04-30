"use client";
// app/(auth)/verify-email/page.jsx
// Shown after sign-up when Supabase requires email confirmation.
// Only reached if your Supabase project has "Email confirmations" enabled.
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, RefreshCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { AuthCard } from "@/components/auth/AuthPrimitives";
import Link from "next/link";
import { Suspense } from "react";

function VerifyContent() {
  const params  = useSearchParams();
  const email   = params.get("email") ?? "";
  const [resent,    setResent]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [resendErr, setResendErr] = useState("");

  const handleResend = async () => {
    if (loading || resent) return;
    setLoading(true);
    setResendErr("");
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setResent(true);
      setTimeout(() => setResent(false), 30_000); // re-enable after 30s
    } catch (err) {
      setResendErr(err?.message ?? "Could not resend. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        {/* Animated icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "var(--color-accent-subtle)" }}>
            <Mail size={36} style={{ color: "var(--color-accent)" }} />
          </div>
          {/* Ping animation */}
          <div className="absolute inset-0 rounded-3xl animate-ping opacity-20"
            style={{ background: "var(--color-accent)" }} />
        </div>

        <div className="space-y-2">
          <h2 className="text-[24px] font-bold" style={{ color: "var(--color-text-primary)" }}>
            Verify your email
          </h2>
          <p className="text-[14px] leading-relaxed max-w-xs mx-auto"
            style={{ color: "var(--color-text-secondary)" }}>
            We've sent a verification link to{" "}
            {email
              ? <strong className="text-[var(--color-text-primary)]">{email}</strong>
              : "your email address"
            }.
            Click the link to activate your account.
          </p>
        </div>

        {/* Steps */}
        <div className="w-full text-left p-4 rounded-2xl border space-y-3"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
          {[
            { num: "1", text: "Check your inbox (and spam folder)" },
            { num: "2", text: "Click the verification link" },
            { num: "3", text: "You'll be signed in automatically" },
          ].map(({ num, text }) => (
            <div key={num} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white"
                style={{ background: "var(--color-accent)" }}>
                {num}
              </div>
              <span className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Resend */}
        <div className="space-y-2 w-full">
          {resendErr && (
            <p className="text-[12px] text-center" style={{ color: "var(--color-danger)" }}>{resendErr}</p>
          )}
          {resent ? (
            <p className="text-[13px] text-center font-medium" style={{ color: "var(--color-success)" }}>
              ✓ Verification email resent!
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border text-[13px] font-medium transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
              style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)" }}>
              <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
              {loading ? "Sending…" : "Resend verification email"}
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <Link href="/sign-in"
            className="text-[13px] font-medium hover:underline"
            style={{ color: "var(--color-text-muted)" }}>
            Already verified? Sign in
          </Link>
          <Link href="/sign-up"
            className="text-[12px] hover:underline"
            style={{ color: "var(--color-text-muted)" }}>
            Wrong email? Create a new account
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyContent /></Suspense>;
}
