// src/services/storeService.js
// All database operations for stores and store_locations.
// Controllers call these — never query Supabase directly from controllers.

import { supabaseAdmin } from "../config/supabase.js";

// Fields to SELECT for store responses
// IMPORTANT: account_number is intentionally excluded from list/detail
// responses. It must never be sent to the client in plaintext.
// Only expose it in a dedicated payout endpoint after additional auth.
const STORE_PUBLIC_FIELDS = [
  "id",
  "owner_id",
  "name",
  "description",
  "logo",
  "banner",
  "is_verified",
  "followers_count",
  "created_at",
  "updated_at",
].join(", ");

const storeService = {
  // Get all stores owned by a user
  async getByOwner(ownerId) {
    const { data, error } = await supabaseAdmin
      .from("stores")
      .select(STORE_PUBLIC_FIELDS)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get a single store by ID
  async getById(storeId) {
    const { data, error } = await supabaseAdmin
      .from("stores")
      .select(STORE_PUBLIC_FIELDS)
      .eq("id", storeId)
      .single();

    if (error) throw error;
    return data;
  },

  // create store
  async createStore(payload) {
    const { data, error } = await supabaseAdmin
      .from("stores")
      .insert({ payload })
      .select()
      .single();

      if(error) throw error;
      return data;
  },

  // Update store fields
  async update(storeId, payload) {
    const { data, error } = await supabaseAdmin
      .from("stores")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", storeId)
      .select(STORE_PUBLIC_FIELDS)
      .single();

    if (error) throw error;
    return data;
  },

  // ── Locations ─────────────────────────────────────────────

  async getLocations(storeId) {
    const { data, error } = await supabaseAdmin
      .from("store_locations")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async createLocation(storeId, payload) {
    const { data, error } = await supabaseAdmin
      .from("store_locations")
      .insert({ ...payload, store_id: storeId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLocation(storeId, locationId, payload) {
    // Verify ownership before updating
    const { data: existing } = await supabaseAdmin
      .from("store_locations")
      .select("id")
      .eq("id", locationId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return null;

    const { data, error } = await supabaseAdmin
      .from("store_locations")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", locationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLocation(storeId, locationId) {
    const { data: existing } = await supabaseAdmin
      .from("store_locations")
      .select("id")
      .eq("id", locationId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return false;

    const { error } = await supabaseAdmin
      .from("store_locations")
      .delete()
      .eq("id", locationId);

    if (error) throw error;
    return true;
  },

  // ── Followers ─────────────────────────────────────────────

  // Get follower count over time (daily buckets for last N days)
  async getFollowerHistory(storeId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from("store_follows")
      .select("created_at")
      .eq("store_id", storeId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },
};

export default storeService;
