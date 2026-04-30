"use client";
// components/ui/ErrorBoundary.jsx
// React class-based error boundary.
// Catches rendering errors in any child component tree and renders
// a friendly recovery UI instead of a blank/crashed page.
//
// Must be a class component — React error boundaries can't be
// implemented with hooks (as of React 19).
//
// Usage:
//   <ErrorBoundary>
//     <PageContent />
//   </ErrorBoundary>

import { Component } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to an error tracking service (Sentry, Datadog RUM)
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Uncaught error:", error, info);
    }
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fallback } = this.props;

    // Allow custom fallback
    if (fallback) {
      return typeof fallback === "function"
        ? fallback({ error: this.state.error, reset: () => this.reset() })
        : fallback;
    }

    // Default fallback UI
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
        >
          <AlertCircle size={24} />
        </div>
        <p
          className="text-[16px] font-semibold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Something went wrong
        </p>
        <p
          className="text-[13px] max-w-sm mb-5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          This section ran into an unexpected error. Refreshing the page usually fixes it.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => this.reset()}
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-semibold transition-colors"
            style={{
              background: "var(--color-accent-subtle)",
              color:      "var(--color-accent-text)",
            }}
          >
            <RefreshCw size={14} />
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium border transition-colors hover:bg-[var(--color-bg)]"
            style={{
              borderColor: "var(--color-border-md)",
              color:       "var(--color-text-secondary)",
            }}
          >
            Reload page
          </button>
        </div>

        {/* Show technical details in dev only */}
        {process.env.NODE_ENV === "development" && this.state.error && (
          <details className="mt-6 text-left max-w-lg w-full">
            <summary
              className="text-[12px] cursor-pointer"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Technical details
            </summary>
            <pre
              className="mt-2 p-3 rounded-xl text-[11px] overflow-auto"
              style={{
                background: "var(--color-bg)",
                color:      "var(--color-danger)",
                borderColor:"var(--color-border)",
                border:     "0.5px solid var(--color-border)",
              }}
            >
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
