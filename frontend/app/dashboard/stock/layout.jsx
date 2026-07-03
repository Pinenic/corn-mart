"use client";
// app/stock/layout.jsx
// ─────────────────────────────────────────────────────────────
// Wraps every page under /stock with the PIN lock.
// The lock resets every time the user navigates to this route.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { usePathname }         from "next/navigation";
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useStockLock }        from "@/lib/hooks/useStockLock";
import { cn }                  from "@/lib/utils";

// ── PIN input — single digit boxes ────────────────────────────
function PinInput({ value, onChange, onSubmit, label, error, autoFocus }) {
  const digits = 4;
  const chars  = value.split("");

  const handleKey = (e) => {
    if (e.key === "Enter") { onSubmit?.(); return; }
    if (e.key === "Backspace") { onChange(value.slice(0, -1)); return; }
    if (/^\d$/.test(e.key) && value.length < digits) { onChange(value + e.key); }
  };

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-[12px] font-semibold text-center"
          style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </p>
      )}
      <div
        className="flex gap-3 justify-center"
        tabIndex={0}
        onKeyDown={handleKey}
        autoFocus={autoFocus}
        onClick={e => e.currentTarget.focus()}
        style={{ outline: "none" }}
      >
        {Array.from({ length: digits }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-[22px] font-bold transition-all",
              i === chars.length
                ? "border-[var(--color-accent)] shadow-[0_0_0_4px_rgba(0,87,255,0.12)]"
                : chars[i] ? "border-[var(--color-border-md)]" : "border-[var(--color-border)]"
            )}
            style={{
              background:  chars[i] ? "var(--color-accent-subtle)" : "white",
              color:       "var(--color-text-primary)",
            }}
          >
            {chars[i] ? "●" : ""}
          </div>
        ))}
      </div>
      {error && (
        <div className="flex items-center justify-center gap-1.5 text-[12px]"
          style={{ color: "var(--color-danger)" }}>
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}

// ── Lock screen ────────────────────────────────────────────────
function LockScreen({ onUnlock, error, loading, clearError }) {
  const [pin, setPin] = useState("");

  const handleSubmit = async () => {
    if (pin.length < 4) return;
    const ok = await onUnlock(pin);
    if (!ok) setPin("");
  };

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) handleSubmit();
  }, [pin]);

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "var(--color-accent-subtle)" }}>
            <Lock size={28} style={{ color: "var(--color-accent)" }} />
          </div>
          <h2 className="text-[20px] font-bold mb-1.5"
            style={{ color: "var(--color-text-primary)" }}>
            Stock journal is locked
          </h2>
          <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Enter your PIN to access purchase records
          </p>
        </div>

        <div className="bg-white rounded-3xl border p-6 space-y-5 shadow-sm"
          style={{ borderColor: "var(--color-border)" }}>
          <PinInput
            value={pin}
            onChange={(v) => { setPin(v); clearError(); }}
            onSubmit={handleSubmit}
            label="Enter PIN"
            error={error}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={pin.length < 4 || loading}
            className="w-full h-11 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: "var(--color-accent)" }}>
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Checking…</>
              : <><KeyRound size={15} /> Unlock</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Setup screen ───────────────────────────────────────────────
function SetupScreen({ onSetPin, error, loading, clearError }) {
  const [pin,     setPin]     = useState("");
  const [confirm, setConfirm] = useState("");
  const [step,    setStep]    = useState(1); // 1 = choose pin, 2 = confirm

  const handleStep1 = () => { if (pin.length === 4) setStep(2); };
  const handleStep2 = () => onSetPin(pin, confirm);

  // Auto-advance step 1 when 4 digits
  useEffect(() => { if (pin.length === 4 && step === 1) setStep(2); }, [pin]);
  // Auto-submit step 2 when 4 digits
  useEffect(() => {
    if (confirm.length === 4 && step === 2) handleStep2();
  }, [confirm]);

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "var(--color-accent-subtle)" }}>
            <ShieldCheck size={28} style={{ color: "var(--color-accent)" }} />
          </div>
          <h2 className="text-[20px] font-bold mb-1.5"
            style={{ color: "var(--color-text-primary)" }}>
            Protect your stock journal
          </h2>
          <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Set a 4-digit PIN to keep your cost data private
          </p>
        </div>

        <div className="bg-white rounded-3xl border p-6 space-y-5 shadow-sm"
          style={{ borderColor: "var(--color-border)" }}>
          {step === 1 ? (
            <PinInput
              key="set"
              value={pin}
              onChange={(v) => { setPin(v); clearError(); }}
              onSubmit={handleStep1}
              label="Choose a 4-digit PIN"
              autoFocus
            />
          ) : (
            <PinInput
              key="confirm"
              value={confirm}
              onChange={(v) => { setConfirm(v); clearError(); }}
              onSubmit={handleStep2}
              label="Confirm your PIN"
              error={error}
              autoFocus
            />
          )}

          {step === 2 && (
            <button onClick={handleStep2} disabled={confirm.length < 4 || loading}
              className="w-full h-11 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-all"
              style={{ background: "var(--color-accent)" }}>
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                : <><ShieldCheck size={15} /> Set PIN & unlock</>
              }
            </button>
          )}

          {step === 2 && (
            <button onClick={() => { setStep(1); setPin(""); setConfirm(""); clearError(); }}
              className="w-full text-[12px] font-medium text-center hover:underline"
              style={{ color: "var(--color-text-muted)" }}>
              ← Choose a different PIN
            </button>
          )}

          <p className="text-[11px] text-center leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}>
            The PIN is stored locally on this device.<br />
            You can change or remove it later from the journal.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Layout export ──────────────────────────────────────────────
export default function StockLayout({ children }) {
  const { status, hasPIN, pinError:error, working:loading, setPIN, unlocked,  unlock, clearError } = useStockLock();

  if (!hasPIN) {
    return <SetupScreen onSetPin={setPIN} error={error} loading={loading} clearError={clearError} />;
  }

  if (unlocked === false) {
    return <LockScreen onUnlock={unlock} error={error} loading={loading} clearError={clearError} />;
  }

  // Unlocked — render the actual page
  return <>{children}</>;
}
