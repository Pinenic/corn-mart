import { success } from "zod";
import { supabase } from "../supabaseClient.js";
import { uploadStoreImages, updateStoreImages } from "./storeImageService.js";

export const getAllStores = async () => {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getStore = async (id) => {
  const { data, error } = await supabase
    .from("stores")
    .select("*, products(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
};

const checkForUserStore = async (id) => {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", id)
    .single();

  if (error) return null;
  return data;
};

export const createNewStore = async (store, files = {}) => {
  // check if user already has a store
  const hasStore = await checkForUserStore(store.owner_id);
  if (hasStore) return null;
  // Create store record first (without images)
  const { data, error } = await supabase
    .from("stores")
    .insert([store])
    .select();

  if (error) throw new Error(error.message);
  const createdStore = data[0];

  // Upload logo/banner if provided
  if (files.logo || files.banner) {
    const uploaded = await uploadStoreImages(
      createdStore.owner_id,
      createdStore.id,
      files
    );

    // Update store record with image URLs
    const { data: updated, error: updateErr } = await supabase
      .from("stores")
      .update(uploaded)
      .eq("id", createdStore.id)
      .select();

    if (updateErr) throw new Error(updateErr.message);
    return updated[0];
  }

  return {
    createdStore: createdStore,
    message: "New store created successfully",
  };
};

export const updateExistingStore = async (id, updates, files = {}) => {
  // Fetch existing store
  const { data: existing, error: fetchErr } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) return null;

  // Handle logo/banner updates if provided
  if (files.logo || files.banner) {
    const updatedImages = await updateStoreImages(existing, files);
    Object.assign(updates, updatedImages);
  }

  // Update other store fields
  const { data, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data[0] || null;
};

/**
 *  STORE FOLLOW SYSTEM
 */

export const followStore = async (userId, storeId) => {
  const { error } = await supabase.from("store_follows").insert({
    user_id: userId,
    store_id: storeId,
  });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  return { followed: true };
};

export const unfollowStore = async (userId, storeId) => {
  const { error } = await supabase
    .from("store_follows")
    .delete()
    .eq("user_id", userId)
    .eq("store_id", storeId);

  if (error) {
    throw new Error(error.message);
  }

  return { followed: false };
};

export const checkIfUserFollows = async (userId, storeId) => {
  const { data } = await supabase
    .from("store_follows")
    .select("user_id")
    .eq("user_id", userId)
    .eq("store_id", storeId)
    .maybeSingle();

  return { isFollowing: data ? true : false };
};

export const getFollowerCount = async (storeId) => {
  const { count } = await supabase
    .from("store_follows")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId);

  return { followers: count };
};

/**
 * Create store location
 */
export const createLocation = async (storeId, locationData) => {
  const { data, error } = await supabase
    .from("store_locations")
    .insert([{ store_id: storeId, ...locationData }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  res.status(201).json(data);
};

/**
 * Get store location
 */
export const getLocation = async (storeId) => {

  const { data, error } = await supabase
    .from("store_locations")
    .select("*")
    .eq("store_id", storeId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return(data);
};

/**
 * Update store location
 */
export const updateLocation = async (storeId, update) => {

  const { data, error } = await supabase
    .from("store_locations")
    .update(update)
    .eq("store_id", storeId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return(data);
};

/**
 * Delete store location
 */
export const deleteLocation = async (req, res) => {
  const { storeId } = req.params;

  const { error } = await supabase
    .from("store_locations")
    .delete()
    .eq("store_id", storeId);

  if (error) {
    throw new Error(error.message);
  }

  return { success : true};
};
