"use client";
// lib/stores/authStore.js
// ─────────────────────────────────────────────────────────────
// Unified auth store for the Corn Mart dashboard.
//
// Merges two concerns:
//
//  1. REAL SUPABASE AUTH (from the existing app store)
//     - getSession() on init, onAuthStateChange listener
//     - signIn / signUp / signOut methods
//     - loadUserRelatedData (profile, cart, store) after login
//     - loading + initialized flags to prevent double-init
//
//  2. DASHBOARD API TOKEN WIRING (from the dashboard store)
//     - Stores the raw JWT access_token so apiClient can inject it
//       into every Express API request via setTokenAccessor()
//     - Stores storeId for all store-scoped API paths (/stores/:storeId/...)
//     - clearSession() tears down both the user session AND the token accessor
//
// Token flow on page load:
//   init() → getSession() → _applySession(session)
//           → setTokenAccessor(() => token)   ← apiClient can now auth
//           → _loadAll(userId)
//               → _loadAppData  (profile, cart, existing store)
//               → _loadDashboardStore → GET /stores/mine → setStoreId()
//
// Token refresh (Supabase handles silently):
//   onAuthStateChange("TOKEN_REFRESHED", session)
//   → _applySession(newSession)  ← token accessor updated automatically
//
// Sign-out:
//   signOut() → supabase.auth.signOut()
//   → onAuthStateChange("SIGNED_OUT") → _clearAll()
//   → setTokenAccessor(() => null)  ← apiClient stops sending auth header
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { setTokenAccessor } from "@/lib/api/client";
import { storeService } from "@/lib/api/services";
import { useProfile } from "./useProfile.js";

// ── Peer store accessors ──────────────────────────────────────
// Imported lazily inside functions so the dashboard works even when
// the existing app's stores (profile, cart, useStore) are not present.
// Each one silently returns null if the module doesn't exist.

// function getPeerStore(path) {
//   try {
//     // Dynamic require — only runs in browser, never during SSR
//     return require(path);
//   } catch {
//     return null;
//   }
// }
async function getPeerStore(loader) {
  try {
    return await loader();
  } catch {
    return null;
  }
}
// ─────────────────────────────────────────────────────────────

const useAuthStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────
  token: null, // Raw Supabase JWT — injected into every API request
  storeId: null, // Active store UUID — used in all /stores/:storeId paths
  user: null, // Supabase user object { id, email, user_metadata, ... }
  loading: false, // True during init / signIn / signOut transitions
  initialized: false, // True after init() has completed — prevents double-init

  // ── Internal: apply a Supabase session ───────────────────
  // Called on init, signIn, and every token refresh.
  // Stores the access_token and immediately wires it into apiClient.
  _applySession(session) {
    const token = session?.access_token ?? null;
    const user = session?.user ?? null;
    set({ token, user });
    // Wire the live token into the fetch client — from this point every
    // apiClient call will include Authorization: Bearer <token>
    setTokenAccessor(() => get().token);
  },

  // ── Internal: load all user data after auth ───────────────
  // Runs profile/cart/store loads in parallel, non-blocking each other.
  _loadAll: async (userId) => {
    await Promise.allSettled([
      get()._loadAppData(userId),
      get()._loadDashboardStore(),
    ]);
  },

  // Loads the existing app's peer stores (profile, cart, store).
  // Silently skipped if those modules don't exist.
  _loadAppData: async (userId) => {
    try {
      // const profileMod = getPeerStore("@/lib/store/useProfile");
      // const cartMod    = getPeerStore("@/lib/store/useCart");
      // const storeMod   = getPeerStore("@/lib/store/useStore");
      const profileMod = await getPeerStore(() =>
        import("@/lib/store/useProfile")
      );

      const cartMod = await getPeerStore(() => import("@/lib/store/cartStore"));

      const storeMod = await getPeerStore(() => import("@/lib/store/useStore"));

      await profileMod?.useProfile?.getState()?.fetchProfile?.(userId);
      await cartMod?.useCartStore?.getState()?.getCart?.(userId);
      await storeMod?.useStoreStore?.getState()?.fetchStore?.(userId);
    } catch (err) {
      console.warn(
        "[authStore] Peer store load error (non-fatal):",
        err.message
      );
    }
  },

  // Fetches the user's stores from the Express API and sets the first
  // one as the active storeId. Requires _applySession() to have run
  // first so the token is available for the API call.
  _loadDashboardStore: async () => {
    try {
      const result = await storeService.getMine();
      const stores = result?.data;
      if (Array.isArray(stores) && stores.length > 0) {
        set({ storeId: stores[0].id });
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[authStore] Active store → "${stores[0].name}" (${stores[0].id})`
          );
        }
      } else if (process.env.NODE_ENV === "development") {
        console.debug("[authStore] No stores found for this user yet.");
      }
    } catch (err) {
      // Non-fatal — user may be newly signed up with no store yet
      console.warn(
        "[authStore] Dashboard store fetch failed (non-fatal):",
        err.message
      );
    }
  },

  // ── Internal: clear everything on sign-out ────────────────
  _clearAll() {
    set({ token: null, user: null, storeId: null });
    // Immediately stop sending the auth header on future requests
    setTokenAccessor(() => null);
    // Clear peer app stores
    try {
      getPeerStore("@/lib/stores/useProfile")
        ?.useProfile?.getState()
        ?.clearProfile?.();
      getPeerStore("@/lib/stores/useCart")?.useCart?.getState()?.clearCart?.();
      getPeerStore("@/lib/stores/useStore")
        ?.useStoreStore?.getState()
        ?.clearStore?.();
    } catch {
      /* non-fatal */
    }
  },

  // ── Public: init ─────────────────────────────────────────
  // Call once from Providers.jsx. Idempotent — safe to call multiple times.
  init: async () => {
    if (get().initialized) return;
    set({ loading: true });

    // Restore the session persisted in localStorage
    const { data, error } = await supabase.auth.getSession();
    if (error) console.error("[authStore] getSession error:", error.message);

    const session = data?.session;

    if (session) {
      get()._applySession(session);
      await get()._loadAll(session.user.id);
    }

    // Subscribe to auth state changes for this tab's lifetime:
    //   - SIGNED_IN:       user signed in on another tab or after email confirm
    //   - SIGNED_OUT:      user signed out
    //   - TOKEN_REFRESHED: Supabase silently rotated the access_token
    //   - USER_UPDATED:    user changed email/password
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === "development") {
        console.debug("[authStore] onAuthStateChange:", event);
      }

      if (session) {
        get()._applySession(session);
        // Only re-load full app data on an actual sign-in, not on every
        // silent token refresh (which would fire many redundant API calls)
        if (event === "SIGNED_IN") {
          await get()._loadAll(session.user.id);
        }
      } else {
        // SIGNED_OUT or session expired and could not be refreshed
        get()._clearAll();
      }
    });

    set({ loading: false, initialized: true });
  },

  // ── Public: setStoreId ───────────────────────────────────
  // Manually switch the active store. Called from a store-switcher UI
  // if the user owns more than one store.
  setStoreId(storeId) {
    set({ storeId });
    if (process.env.NODE_ENV === "development") {
      console.debug("[authStore] Store switched →", storeId);
    }
  },

  // ── Public: signIn ───────────────────────────────────────
  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      get()._applySession(data.session);
      await get()._loadAll(data.user.id);
      return data.user;
    } finally {
      set({ loading: false });
    }
  },

  // ── Public: signUp ───────────────────────────────────────
  // If email confirmation is disabled in your Supabase project,
  // data.session will be set immediately. Otherwise data.session is
  // null and the user must confirm their email before signing in.
  signUp: async (email, password, firstname, lastname, phone) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstname,
            last_name: lastname,
            phone,
          },
        },
      });
      if (error) throw error;

      if (data.session) {
        // Email confirmation is off — user is immediately signed in
        get()._applySession(data.session);
        await get()._loadAll(data.user.id);
      }

      return data.user;
    } finally {
      set({ loading: false });
    }
  },

  // ── Public: signOut ──────────────────────────────────────
  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      // _clearAll() is also called by the onAuthStateChange SIGNED_OUT event,
      // but we call it here too for immediate response in the current tab.
      get()._clearAll();
    } finally {
      set({ loading: false });
    }
  },

  // ── Convenience getters ──────────────────────────────────
  get isAuthenticated() {
    return Boolean(get().token);
  },

  get hasStore() {
    return Boolean(get().storeId);
  },
}));

export default useAuthStore;
