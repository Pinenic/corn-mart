"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { useProfile } from "./useProfile";
import { useCart } from "./useCart";
import { useStoreStore } from "./useStore";
import useNotifications from "@/hooks/useNotificationsRealtime";
import { useNotificationStore } from "./useNotificationStore";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  // ------------------------------------------
  // INIT APP (RUN ONCE IN root layout)
  // ------------------------------------------
  init: async () => {
    if (get().initialized) return; // prevent double init
    set({ loading: true });

    const { data, error } = await supabase.auth.getSession();
    if (error) console.error("Session load failed:", error);

    const session = data?.session;
    set({ user: session?.user ?? null });

    if (session?.user) {
      await get().loadUserRelatedData(session.user.id);
    }

    // Listen to auth changes globally
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      set({ user });

      if (user) {
        await get().loadUserRelatedData(user.id);
      } else {
        // logout case
        useProfile.getState().clearProfile();
        useCart.getState().clearCart();
        useStoreStore.getState().clearStore?.();
      }
    });

    set({ loading: false, initialized: true });
  },

  // ------------------------------------------
  // LOAD PROFILE, CART, STORE (ONE FUNCTION)
  // ------------------------------------------
  loadUserRelatedData: async (userId) => {
    // load profile
    await useProfile.getState().fetchProfile(userId);

    // load or create cart
    const cartStore = useCart.getState();
    await cartStore.getCart(userId);

    // load optional store
    const storeStore = useStoreStore.getState();
    await storeStore.fetchStore(userId);

   
    // const notificationStore = useNotificationStore.getState();
    // await notificationStore.fetchStore(userId);
  },

  // ------------------------------------------
  // SIGN UP
  // ------------------------------------------
  signUp: async (email, password, firstname, lastname, phone) => {
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

    // Supabase creates the user but may NOT create a session yet,
    // so force login after signup:
    // await get().signIn(email, password);

    return data.user;
  },

  // ------------------------------------------
  // SIGN IN
  // ------------------------------------------
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const user = data.user;
    set({ user });

    // Load profile/cart/store
    await get().loadUserRelatedData(user.id);

    return user;
  },

  // ------------------------------------------
  // SIGN OUT
  // ------------------------------------------
  signOut: async () => {
    await supabase.auth.signOut();

    set({ user: null });

    useProfile.getState().clearProfile();
    useCart.getState().clearCart();
    useStoreStore.getState().clearStore?.();
  },
}));
