"use client";
// client/lib/hooks/useStockLock.js
// ─────────────────────────────────────────────────────────────
// Manages the PIN lock for the stock journal page.
//
// HOW IT WORKS
// ────────────
// The PIN is stored as a SHA-256 hash in a dedicated `stock_pin_hash`
// column on the store record — kept deliberately separate from
// `stores.config`, since that column is returned in full by the
// *public* marketplace store endpoint (used to render a store's public
// storefront page). A PIN hash living there would be readable by
// anyone visiting the store's page, not just the owner. `stock_pin_hash`
// is only ever read via `/stores/mine` (seller-authenticated) and
// written via the same generic store-update call the rest of the
// dashboard uses. The plaintext PIN itself never persists anywhere.
//
// "Unlocked" state is still ephemeral React state — not synced, not
// persisted. This is unchanged from before:
//   - Navigating away clears the unlocked state in memory
//   - On return to the page, the lock screen shows again
//   - A full page refresh also re-locks
//   - Every device re-locks independently — only the PIN hash itself
//     (i.e. whether a PIN exists, and what it is) is shared across
//     devices now, not any notion of an active unlocked session.
//
// SECURITY NOTE
// ─────────────
// This is UI-level protection only. It prevents casual shoulder-surfing
// and accidental navigation to sensitive purchase cost data — it is
// NOT a substitute for backend authorization on the actual stock data
// endpoints themselves.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";
import useAuthStore from "@/lib/store/useAuthStore";
import { useApi } from "@/lib/hooks/useApi";
import { storeService } from "@/lib/api/services";

// Legacy localStorage key from the old device-local-only scheme. No
// longer read or written to as a source of truth — this is a clean
// cutover, not a migration (existing local hashes are orphaned). We
// only clear it opportunistically for hygiene once we know the synced
// state, so it doesn't linger as confusing dead data on the device.
const LEGACY_STORAGE_KEY = (storeId) => `stock-journal-pin-hash:${storeId}`;

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

  // Seller-authenticated — never the public marketplace store endpoint.
  const { data: store, isLoading: storeLoading, mutate } = useApi("/stores/mine");

  // Whether the current session is unlocked — ephemeral, per-device,
  // never persisted or synced. Starts locked; flips true only via a
  // successful unlock() or setPIN()/changePin() in this session.
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState("");
  const [working, setWorking] = useState(false);

  // True until we know, for certain, whether this store has a PIN set.
  // Callers should treat this as "don't render setup/lock screens yet"
  // rather than optimistically assuming either state.
  let storeData = store?.[0];
  const loading = storeLoading;
  const hasPIN = Boolean(storeData?.stock_pin_hash);
  // console.log(hasPIN,storeData?.stock_pin_hash, store);

  // One-time hygiene: once we know the real (synced) state, drop any
  // leftover local-only hash from before this change. It's never read
  // as a source of truth anymore, so there's no reason to keep it.
  useEffect(() => {
    if (!storeId || loading) return;
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY(storeId));
    } catch {
      // ignore — best-effort cleanup only
    }
  }, [storeId, loading]);

  // ── unlock(pin) ───────────────────────────────────────────
  const unlock = useCallback(
    async (pin) => {
      if (!storeId || !pin?.trim() || !storeData?.stock_pin_hash) return false;
      setWorking(true);
      setPinError("");
      try {
        const entered = await sha256(pin.trim());
        if (entered === store[0].stock_pin_hash) {
          setUnlocked(true);
          return true;
        }
        setPinError("Incorrect PIN. Try again.");
        return false;
      } finally {
        setWorking(false);
      }
    },
    [storeId, storeData?.stock_pin_hash]
  );

  // ── setPIN(newPin, currentPin) ────────────────────────────
  // Sets (or, with an empty newPin, removes) the PIN. If a PIN is
  // already set, the current one must be supplied and correct first.
  const setPIN = useCallback(
    async (newPin, currentPin = null) => {
      if (!storeId) return false;
      setWorking(true);
      setPinError("");
      try {
        if (hasPIN && currentPin !== null) {
          const currentHash = await sha256(currentPin.trim());
          if (currentHash !== storeData?.stock_pin_hash) {
            setPinError("Current PIN is incorrect");
            return false;
          }
        }

        if (!newPin?.trim()) {
          await storeService.update(storeId, { stock_pin_hash: null });
          await mutate();
          setUnlocked(true);
          return true;
        }

        const newHash = await sha256(newPin.trim());
        await storeService.update(storeId, { stock_pin_hash: newHash });
        await mutate();
        setUnlocked(true); // setting a new PIN counts as unlocking
        return true;
      } catch (err) {
        setPinError("Couldn't save your PIN — try again");
        return false;
      } finally {
        setWorking(false);
      }
    },
    [storeId, hasPIN, store?.stock_pin_hash, mutate]
  );

  // ── changePin(currentPin, newPin, confirmPin) ─────────────
  // Used by the PIN-settings "Change PIN" flow (three separate
  // fields — current, new, confirm). Validates newPin === confirmPin
  // itself, which the old setup-screen flow never actually did.
  const changePin = useCallback(
    async (currentPin, newPin, confirmPin) => {
      if (!storeId || !currentPin?.trim() || !newPin?.trim()) return false;
      if (newPin !== confirmPin) {
        setPinError("New PINs don't match");
        return false;
      }
      setWorking(true);
      setPinError("");
      try {
        const currentHash = await sha256(currentPin.trim());
        if (currentHash !== storeData?.stock_pin_hash) {
          setPinError("Current PIN is incorrect");
          return false;
        }
        const newHash = await sha256(newPin.trim());
        await storeService.update(storeId, { stock_pin_hash: newHash });
        await mutate();
        setUnlocked(true);
        return true;
      } catch (err) {
        setPinError("Couldn't save your PIN — try again");
        return false;
      } finally {
        setWorking(false);
      }
    },
    [storeId, storeData?.stock_pin_hash, mutate]
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
  }, [unlocked]);

  return {
    hasPIN,
    unlocked,
    loading,
    pinError,
    error: pinError, // alias — some call sites read `.error`
    working,
    unlock,
    setPIN,
    changePin,
    removePIN,
    lock,
    clearError: () => setPinError(""),
  };
}