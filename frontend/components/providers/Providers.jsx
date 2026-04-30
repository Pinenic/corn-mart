"use client";
// components/providers/Providers.jsx
// Single client-side provider component — mounted once in layout.jsx.
//
// Responsibilities:
//   1. Calls authStore.init() on app mount — this reads the persisted
//      Supabase session, wires the JWT into apiClient, loads the user's
//      store ID, and subscribes to token refreshes for the page lifetime.
//   2. Wraps the app with SWRConfig (global fetch config + caching).
//   3. Renders the ToastContainer so toast notifications work everywhere.

import { useEffect } from "react";
import { SWRConfig } from "swr";
import { SWR_CONFIG } from "@/lib/hooks/useApi";
import useAuthStore from "@/lib/store/useAuthStore";
import { ToastContainer } from "@/components/ui/Toast";

export function Providers({ children }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    // init() is idempotent — calling it more than once is safe.
    // It restores the Supabase session from localStorage, calls
    // setTokenAccessor() so apiClient has the JWT, fetches the user's
    // store from the Express API, and subscribes to onAuthStateChange.
    init();
  }, [init]);

  return (
    <SWRConfig value={SWR_CONFIG}>
      {children}
      <ToastContainer />
    </SWRConfig>
  );
}
