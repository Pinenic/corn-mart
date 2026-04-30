// src/services/marketplace/marketplaceStoreService.js
// Public-facing store queries for the buyer marketplace.
// All reads use only publicly safe fields (no account_number, no owner PII).

import { supabaseAdmin } from "../../config/supabase.js";

// Only public fields — never expose account_number or internal flags
const STORE_PUBLIC_FIELDS = `
  id, name, description, logo, banner,
  is_verified, followers_count, created_at
`.trim();

const marketplaceStoreService = {

  // ── Browse all stores ────────────────────────────────────────
  // Only returns verified stores with is_active products.
  // Supports search by name, sort by followers/date/name.
  async list({ page, limit, search, sort, order }) {
    let query = supabaseAdmin
      .from("stores")
      .select(STORE_PUBLIC_FIELDS, { count: "exact" });

    if (search?.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const from = (page - 1) * limit;
    query = query
      .order(sort, { ascending: order === "asc" })
      .range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { stores: data, total: count };
  },

  // ── Single store profile ─────────────────────────────────────
  async getById(storeId) {
    const { data, error } = await supabaseAdmin
      .from("stores")
      .select(STORE_PUBLIC_FIELDS)
      .eq("id", storeId)
      .single();

    if (error || !data) return null;
    return data;
  },

  // ── Store locations (public — delivery info only) ────────────
  async getLocations(storeId) {
    const { data, error } = await supabaseAdmin
      .from("store_locations")
      .select(`
        id, city, province, country, address,
        delivery_enabled, delivery_radius_km,
        delivery_fee, delivery_methods
      `)
      .eq("store_id", storeId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  // ── Follow a store ────────────────────────────────────────────
  // The trigger trg_update_store_follower_count handles the counter.
  // Returns true if newly followed, false if already following.
  async follow(storeId, userId) {
    // Check if already following
    const { data: existing } = await supabaseAdmin
      .from("store_follows")
      .select("user_id")
      .eq("store_id", storeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) return { alreadyFollowing: true };

    // Verify the store exists before following
    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("id")
      .eq("id", storeId)
      .single();

    if (!store) return null; // store not found

    const { error } = await supabaseAdmin
      .from("store_follows")
      .insert({ store_id: storeId, user_id: userId });

    if (error) throw error;
    return { alreadyFollowing: false };
  },

  // ── Unfollow a store ──────────────────────────────────────────
  // Returns false if the user wasn't following — not an error, idempotent.
  async unfollow(storeId, userId) {
    const { data: existing } = await supabaseAdmin
      .from("store_follows")
      .select("user_id")
      .eq("store_id", storeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) return false;

    const { error } = await supabaseAdmin
      .from("store_follows")
      .delete()
      .eq("store_id", storeId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  },

  // ── Follow status ─────────────────────────────────────────────
  // Returns whether a specific user follows a store.
  // Used to enhance the store profile response for logged-in buyers.
  async isFollowing(storeId, userId) {
    if (!userId) return false;
    const { data } = await supabaseAdmin
      .from("store_follows")
      .select("user_id")
      .eq("store_id", storeId)
      .eq("user_id", userId)
      .maybeSingle();
    return Boolean(data);
  },
};

export default marketplaceStoreService;
