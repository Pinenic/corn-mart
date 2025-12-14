import { supabase } from '../supabaseClient.js';
import { uploadStoreImages, updateStoreImages } from "./storeImageService.js";

export const getAllStores = async () => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getStore = async (id) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*, products(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};

const checkForUserStore = async (id) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', id)
    .single();

  if (error) return null;
  return data;
};

export const createNewStore = async (store, files = {}) => {
  // check if user already has a store
  const hasStore = await checkForUserStore(store.owner_id);
  if(hasStore) return null;
  // 1️⃣ Create store record first (without images)
  const { data, error } = await supabase
    .from("stores")
    .insert([store])
    .select();

  if (error) throw new Error(error.message);
  const createdStore = data[0];

  // 2️⃣ Upload logo/banner if provided
  if (files.logo || files.banner) {
    const uploaded = await uploadStoreImages(createdStore.owner_id, createdStore.id, files);

    // 3️⃣ Update store record with image URLs
    const { data: updated, error: updateErr } = await supabase
      .from("stores")
      .update(uploaded)
      .eq("id", createdStore.id)
      .select();

    if (updateErr) throw new Error(updateErr.message);
    return updated[0];
  }

  return ({createdStore: createdStore, message : "New store created successfully"});
};

export const updateExistingStore = async (id, updates, files = {}) => {
  // 1️⃣ Fetch existing store
  const { data: existing, error: fetchErr } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) return null;

  // 2️⃣ Handle logo/banner updates if provided
  if (files.logo || files.banner) {
    const updatedImages = await updateStoreImages(existing, files);
    Object.assign(updates, updatedImages);
  }

  // 3️⃣ Update other store fields
  const { data, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data[0] || null;
};

