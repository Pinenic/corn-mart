"use client";
// app/(auth)/sign-in/page.jsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthCard, AuthHeading, FormField, TextInput,
  PasswordInput, SubmitButton, AlertBanner,
} from "@/components/auth/AuthPrimitives";
import useAuthStore from "@/lib/store/useAuthStore";

export default function SignInPage() {
  const router    = useRouter();
  const signIn    = useAuthStore(s => s.signIn);
  const loading   = useAuthStore(s => s.loading);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim())            e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password)                e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    try {
      await signIn(email.trim(), password);
      router.push("/marketplace");
    } catch (err) {
      setError(err?.message ?? "Invalid email or password");
    }
  };

  return (
    <AuthCard>
      <AuthHeading
        title="Welcome back"
        subtitle="Sign in to your Corn Mart account"
      />

      <AlertBanner type="error" message={error} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Email address" error={errors.email}>
          <TextInput
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />
        </FormField>

        <FormField label="Password" error={errors.password}>
          <PasswordInput
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="flex justify-end mt-1">
            <Link href="/forgot-password"
              className="text-[12px] font-medium hover:underline"
              style={{ color: "var(--color-accent)" }}>
              Forgot password?
            </Link>
          </div>
        </FormField>

        <SubmitButton loading={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </SubmitButton>
      </form>

      <p className="text-center text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
        Don't have an account?{" "}
        <Link href="/sign-up" className="font-semibold hover:underline"
          style={{ color: "var(--color-accent)" }}>
          Create one free
        </Link>
      </p>
    </AuthCard>
  );
}
