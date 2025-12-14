import { supabase } from '../supabaseClient.js';

export const getAllUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const getUser = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};
