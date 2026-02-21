import { supabase } from "../supabaseClient.js";

export async function notificationWorker() {
  console.log("checking for new notifications...")
  const { data: notifications } = await supabase
    .from("notifications")
    .update({ status: "processing" })
    .eq("status", "pending")
    .select("*")
    .limit(25);

  if (!notifications || notifications.length == 0) {
    console.log("No new notifications found...")
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
