import { supabase } from '../supabaseClient.js';

export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)       // only return active products
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};

export const createNewProduct = async (product) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select();

  if (error) throw new Error(error.message);
  return data;
};

export const updateExistingProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) return null;
  return data;
};
