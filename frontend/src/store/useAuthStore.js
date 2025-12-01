"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { useProfile } from "./useProfile";
import { useCart } from "./useCart";
import { useStoreStore } from "./useStore";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.error("Session check failed:", error);
    set({ user: data.session?.user ?? null, loading: false });

    // Fetch profile into Zustand
    useProfile.getState().fetchProfile(data.session?.user.id);
    // Fetch or create cart
    const { data: cartData, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", data.session?.user.id)
      .single();

    if (!cartError && cartData) {
      const cartStore = useCart.getState();
      cartStore.setCartId(cartData.id);
      cartStore.setUserId(data.session?.user.id);
      cartStore.getCart(data.session?.user.id);
    }

    //fetch store if any
    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_id", data.session?.user.id)
      .maybeSingle();

    if(!storeError && storeData){
      const userStore = useStoreStore();
      userStore.fetchStore(data.session?.user.id)
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  signUp: async (email, password, firstname, lastname, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstname, last_name: lastname, phone: phone },
      },
    });
    if (error) throw error;

    set({ user: data.user });
    // Fetch profile into Zustand
    useProfile.getState().fetchProfile(data.user.id);
    return data.user;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user });
    // Fetch profile into Zustand
    useProfile.getState().fetchProfile(data.user.id);
    return data.user;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
    useProfile.getState().clearProfile();
  },
}));
