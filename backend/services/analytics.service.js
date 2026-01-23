import { supabase } from "../supabaseClient.js";

export async function getStoreAnalytics(storeId, start, end) {
  const { data, error } = await supabase.rpc("get_store_analytics", {
    p_store_id: storeId,
    p_start: start,
    p_end: end,
  });
  if(error) throw new Error(`Error : ${error.message}`);

  return data;
}
