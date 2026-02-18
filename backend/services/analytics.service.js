import { supabase } from "../supabaseClient.js";
import { handleSupabaseError } from "../utils/handleSupabaseError.js";

export async function getStoreAnalytics(storeId, start, end) {
  try {
    // Set a timeout for the RPC call (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const { data, error } = await supabase.rpc("get_store_analytics", {
      p_store_id: storeId,
      p_start: start,
      p_end: end,
    });
    
    clearTimeout(timeoutId);
    
    if(error) throw handleSupabaseError(error, { message: "Failed to fetch store analytics" });

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Analytics query timeout - request took too long');
    }
    throw err;
  }
}
