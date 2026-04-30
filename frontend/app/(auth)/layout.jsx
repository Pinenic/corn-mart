// app/(auth)/layout.jsx
// Fullscreen auth shell — two-column on desktop (brand left, form right),
// single column on mobile (form only, brand collapses to top bar).
// The brand panel has a subtle animated gradient and floating cards
// to keep it visually alive without being distracting.

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

export const metadata = {
  title: "Corn Mart — Sign in",
  description: "Sign in to your Corn Mart dashboard",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left brand panel (hidden on mobile) ── */}
      {/* <AuthBrandPanel /> */}

      {/* ── Right: form column ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 bg-[var(--color-bg)]">

        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <span className="text-[16px] font-bold" style={{ color: "var(--color-text-primary)" }}>
              Corn Mart
            </span>
          </Link>
          <Link href="/" className="text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Back to home
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 md:py-16">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            © {new Date().getFullYear()} Corn Mart · <a href="#" className="hover:underline">Privacy</a> · <a href="#" className="hover:underline">Terms</a>
          </p>
        </div>
      </div>
    </div>
  );
}
