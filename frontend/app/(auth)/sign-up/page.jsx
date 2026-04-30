"use client";
// app/(auth)/sign-up/page.jsx
// Two-step sign-up:
//   Step 1 — Personal info (first name, last name, email)
//   Step 2 — Password + terms
// After Supabase creates the account, redirects to onboarding.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import {
  AuthCard, AuthHeading, FormField, TextInput,
  PasswordInput, PasswordStrength, SubmitButton,
  AlertBanner, CheckboxField,
} from "@/components/auth/AuthPrimitives";
import useAuthStore from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Your details" },
  { label: "Set password" },
];

function StepDots({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
            i < current  ? "bg-[var(--color-success)] text-white"
            : i === current ? "bg-[var(--color-accent)] text-white"
            : "bg-[var(--color-border-md)] text-[var(--color-text-muted)]"
          )}>
            {i < current ? <Check size={11} strokeWidth={3} /> : i + 1}
          </div>
          <span className={cn("text-[12px] font-medium hidden sm:block",
            i === current ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]")}>
            {s.label}
          </span>
          {i < STEPS.length - 1 && (
            <div className="w-6 h-px mx-1" style={{ background: i < current ? "var(--color-success)" : "var(--color-border-md)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SignUpPage() {
  const router    = useRouter();
  const signUp    = useAuthStore(s => s.signUp);
  const loading   = useAuthStore(s => s.loading);

  const [step,      setStep]      = useState(0);
  const [error,     setError]     = useState("");
  const [errors,    setErrors]    = useState({});

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [terms,     setTerms]     = useState(false);

  const validateStep0 = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim())  e.lastName  = "Last name is required";
    if (!email.trim())     e.email     = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e = {};
    if (!password)           e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (confirm !== password) e.confirm  = "Passwords do not match";
    if (!terms)              e.terms     = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (ev) => {
    ev.preventDefault();
    setError("");
    if (validateStep0()) setStep(1);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    if (!validateStep1()) return;
    try {
      await signUp(email.trim(), password, firstName.trim(), lastName.trim(), phone.trim());
      router.push("/marketplace");
    } catch (err) {
      setError(err?.message ?? "Could not create account. Try again.");
    }
  };

  return (
    <AuthCard>
      <AuthHeading
        title={step === 0 ? "Create your account" : "Almost there!"}
        subtitle={step === 0 ? "Set up your free Corn Mart account" : "Choose a secure password to protect your account"}
      />

      <StepDots current={step} />
      <AlertBanner type="error" message={error} />

      {/* ── Step 0: Personal info ── */}
      {step === 0 && (
        <form onSubmit={handleNext} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name" error={errors.firstName}>
              <TextInput
                placeholder="Ama"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                error={errors.firstName}
                autoComplete="given-name"
                autoFocus
              />
            </FormField>
            <FormField label="Last name" error={errors.lastName}>
              <TextInput
                placeholder="Kusi"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                error={errors.lastName}
                autoComplete="family-name"
              />
            </FormField>
          </div>

          <FormField label="Email address" error={errors.email}>
            <TextInput
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
          </FormField>

          <FormField label="Phone" error={errors.phone}>
            <TextInput
              type="tel"
              placeholder="+260 000000001"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              error={errors.phone}
              autoComplete="tel"
            />
          </FormField>

          <button type="submit"
            className="w-full h-11 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: "var(--color-accent)" }}>
            Continue <ArrowRight size={15} />
          </button>
        </form>
      )}

      {/* ── Step 1: Password ── */}
      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Password" error={errors.password}
            hint={!errors.password ? "Use 8+ characters with a mix of letters, numbers, symbols" : undefined}>
            <PasswordInput
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
              autoFocus
            />
            <PasswordStrength password={password} />
          </FormField>

          <FormField label="Confirm password" error={errors.confirm}>
            <PasswordInput
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              error={errors.confirm}
              autoComplete="new-password"
            />
          </FormField>

          <CheckboxField
            id="terms"
            checked={terms}
            onChange={e => setTerms(e.target.checked)}
            error={errors.terms}
            label={<>I agree to Corn Mart's{" "}
              <a href="#" className="font-semibold" style={{ color: "var(--color-accent)" }}>Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="font-semibold" style={{ color: "var(--color-accent)" }}>Privacy Policy</a>
            </>}
          />

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(0)}
              className="flex-none h-11 px-4 rounded-xl border text-[13px] font-semibold transition-colors hover:bg-[var(--color-bg)]"
              style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)" }}>
              ← Back
            </button>
            <SubmitButton loading={loading} className="flex-1">
              {loading ? "Creating account…" : "Create account"}
            </SubmitButton>
          </div>
        </form>
      )}

      <p className="text-center text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold hover:underline"
          style={{ color: "var(--color-accent)" }}>
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
