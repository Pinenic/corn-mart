"use client";
// lib/stores/authStore.js
// Zustand store for the authenticated session.
// Holds the Supabase access token (used in Authorization headers)
// and the active storeId (used in all store-scoped API paths).
//
// On mount, the AuthProvider reads the Supabase session and populates this.
// The apiClient reads the token from this store via setTokenAccessor().

import { create } from "zustand";
import { setTokenAccessor } from "@/lib/api/client";

const useAuthStore = create((set, get) => ({
  token: null, // Supabase access_token JWT
  storeId: null, // The active store's UUID
  user: null, // Supabase user object { id, email, ... }

  setSession(token, user) {
    set({ token, user });
    // Wire the client so it can read the token without importing this store
    setTokenAccessor(() => get().token);
  },

  setStoreId(storeId) {
    set({ storeId });
  },

  clearSession() {
    set({ token: null, user: null, storeId: null });
    setTokenAccessor(() => null);
  },

  get isAuthenticated() {
    return Boolean(get().token);
  },
}));

export default useAuthStore;
