import { supabase } from "../supabaseClient.js";

export async function fetchBuyerNotifications(userId) {
  const { data: buyerNotifications, error: bnError } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "order_update")
    .order("created_at", { ascending: false });

  if (bnError) throw new Error(`${bnError}`);

  return buyerNotifications;
}

export async function fetchSellerNotifications(userId) {
  const { data: sellerNotifications, error: snError } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "store_order_update")
    .order("created_at", { ascending: false });

  if (snError) throw new Error(`${snError}`);

  return sellerNotifications;
}

export async function markOneAsRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;

    return true;
}

export async function markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;

    return true;
}


export async function markAllAsViewed(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ viewed: true })
      .eq('user_id', userId);

    if (error) throw error;

    return true;
}