import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";

export const useProfile = create(
  persist(
    (set, get) => ({
      profile: null,
      loading: false,
      error: null,

      fetchProfile: async (userId) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase
          .from("users")
          .select("id, full_name,email, avatar_url")
          .eq("id", userId)
          .single();

          console.log("the data",data, "the id ", userId);

        if (error) {
          set({ error: error.message, loading: false });
        } else {
          set({ profile: data, loading: false });
        }
      },

      updateProfile: async (updates) => {
        set({ loading: true, error: null });
        const { error } = await supabase.from("users").upsert(updates);

        if (error) {
          set({ error: error.message, loading: false });
        } else {
          set({ profile: { ...get().profile, ...updates }, loading: false });
        }
      },

      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "profile-storage", // key in localStorage
    }
  )
);
