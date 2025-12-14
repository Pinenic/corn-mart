"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({ children }) {
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1 Check for an existing session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getInitialSession();

    // 2 Listen for auth changes (login, logout, token refresh)
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
      }
    );

    // Cleanup
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [setUser]);

  if (loading) {
    return (
        <>
        <p className="text-gray-500">Loading...</p>
        </>
    );
  }

  return children;
}
