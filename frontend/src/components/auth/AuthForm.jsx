"use client";

import { useState } from "react";
import InputField from "./InputField";
import Link from "next/link";

export default function AuthForm({ mode = "signup", onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSignup = mode === "signup";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-leafGreen-700">
        {isSignup ? "Create Account" : "Welcome Back"}
      </h2>

      {isSignup && (
        <>
          <InputField label="First Name" name="firstname" />
          <InputField label="Last Name" name="lastname" />
          <InputField label="Phone" name="phone" />
        </>
      )}

      <InputField label="Email" name="email" type="email" />
      <InputField label="Password" name="password" type="password" />

      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
      >
        {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
      </button>

      <p className="text-center text-sm text-muted-foreground dark:text-white/90">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-leafGreen-600 font-medium">
              Log In
            </Link>
          </>
        ) : (
          <>
            Don’t have an account?{" "}
            <Link href="/auth/signup" className="text-leafGreen-600 font-medium">
              Sign Up
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
