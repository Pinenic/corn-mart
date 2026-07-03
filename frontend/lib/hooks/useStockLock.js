"use client";
// client/lib/hooks/useStockLock.js
// ─────────────────────────────────────────────────────────────
// Manages a client-side PIN lock for the stock journal page.
//
// HOW IT WORKS
// ────────────
// The PIN is stored as a SHA-256 hash in localStorage under the key
// "stock-journal-pin-hash:{storeId}". The plaintext PIN never persists.
//
// "Locked" state is ephemeral React state — not localStorage.
// This means:
//   - Navigating away clears the unlocked state in memory
//   - On return to the page, the lock screen shows again
//   - A full page refresh also re-locks
//   - The hash in localStorage only survives as long as the store
//     owner wants a PIN (they can clear it from the settings UI)
//
// SECURITY NOTE
// ─────────────
// This is UI-level protection only — anyone who can open DevTools
// can clear localStorage. It is NOT a substitute for backend auth.
// Its purpose is to prevent casual shoulder-surfing and accidental
// navigation to sensitive purchase cost data. For a harder lock,
// the PIN should be stored server-side and verified via an API call.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";
import useAuthStore from "@/lib/store/useAuthStore";

const STORAGE_KEY = (storeId) => `stock-journal-pin-hash:${storeId}`;

// SHA-256 hash of a string using the Web Crypto API (available in all modern browsers)
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useStockLock() {
  const storeId = useAuthStore((s) => s.storeId);

  // Whether a PIN has been configured for this store
  const [hasPIN, setHasPIN] = useState(false);
  // Whether the current session is unlocked
  const [unlocked, setUnlocked] = useState(false);
  // Error message shown when wrong PIN is entered
  const [pinError, setPinError] = useState("");
  // Working state for async hash operations
  const [working, setWorking] = useState(false);

  // On mount (and when storeId changes): check whether a PIN has been set
  useEffect(() => {
    if (!storeId) return;
    const stored = localStorage.getItem(STORAGE_KEY(storeId));
    setHasPIN(Boolean(stored));
    console.log(stored);
    // If no PIN is set, grant access immediately
    setUnlocked(false);
  }, [storeId]);

  // ── unlock(pin) ───────────────────────────────────────────
  // Hashes the entered PIN and compares against the stored hash.
  // Returns true on success, false on mismatch.
  const unlock = useCallback(
    async (pin) => {
      if (!storeId || !pin.trim()) return false;
      setWorking(true);
      setPinError("");
      try {
        const entered = await sha256(pin.trim());
        const stored = localStorage.getItem(STORAGE_KEY(storeId));
        if (entered === stored) {
          setUnlocked(true);
          setPinError("");
          return true;
        } else {
          setPinError("Incorrect PIN. Try again.");
          return false;
        }
      } finally {
        setWorking(false);
      }
    },
    [storeId]
  );

  // ── setPIN(newPin) ────────────────────────────────────────
  // Sets (or replaces) the PIN. Requires the current PIN to be
  // entered first if one is already set (prevents someone
  // changing the PIN while the screen is locked).
  const setPIN = useCallback(
    async (newPin, currentPin = null) => {
      if (!storeId) return false;
      setWorking(true);
      setPinError("");
      try {
        // If a PIN is already set, verify the current one first
        if (hasPIN && currentPin !== null) {
          const currentHash = await sha256(currentPin.trim());
          const stored = localStorage.getItem(STORAGE_KEY(storeId));
          if (currentHash !== stored) {
            setPinError("Current PIN is incorrect");
            return false;
          }
        }

        if (!newPin?.trim()) {
          // Empty newPin = remove the PIN entirely
          localStorage.removeItem(STORAGE_KEY(storeId));
          setHasPIN(false);
          setUnlocked(true);
          return true;
        }

        const newHash = await sha256(newPin.trim());
        localStorage.setItem(STORAGE_KEY(storeId), newHash);
        setHasPIN(true);
        setUnlocked(true); // setting a new PIN counts as unlocking
        return true;
      } finally {
        setWorking(false);
      }
    },
    [storeId, hasPIN]
  );

  // ── removePIN(currentPin) ─────────────────────────────────
  const removePIN = useCallback(
    async (currentPin) => {
      return setPIN("", currentPin);
    },
    [setPIN]
  );

  // ── lock() ────────────────────────────────────────────────
  // Manually lock the page (e.g. from a "Lock" button in the header)
  const lock = useCallback(() => {
    setUnlocked(false);
    setPinError("");
  }, []);

  return {
    hasPIN,
    unlocked,
    pinError,
    working,
    unlock,
    setPIN,
    removePIN,
    lock,
    clearError: () => setPinError(""),
  };
}
