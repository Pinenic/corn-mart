import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStoreStore = create(
  persist(
    (set, get) => ({
      store: null,
      loading: false,
      error: null,

      fetchStore: async (userId) => {
        set({ loading: true, error: null });
        try {
          const { data: storeData, error: storeError } = await supabase
            .from("stores")
            .select("*")
            .eq("owner_id", userId)
            .maybeSingle();
          set({ store: storeData, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      updateStore: (updates) => {
        const current = get().store;
        if (!current) return;
        set({ store: { ...current, ...updates } });
      },

      clearStore: () => set({ store: null }),
    }),
    { name: "user-store-info" }
  )
);
