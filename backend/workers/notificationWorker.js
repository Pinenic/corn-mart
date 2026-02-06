import { supabase } from "../supabaseClient.js";

export async function notificationWorker() {
  const { data: notifications } = await supabase
    .from("notifications")
    .update({ status: "processing" })
    .eq("status", "pending")
    .select("*")
    .limit(25);

  if (notifications.length == 0) {
    return;
  }

  for (const n of notifications) {
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", n.user_id)
      .single();

    if (!user?.email) continue;

    await supabase.from("notification_deliveries").insert({
      notification_id: n.id,
      channel: "email",
      recipient: user.email,
    });
  }
}
