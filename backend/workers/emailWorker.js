import { supabase } from "../supabaseClient.js";
import { sendEmail } from "../services/email.service.js";

function buildEmailTemplate(notification) {
  return `
    <h2>${notification.title}</h2>
    <p>${notification.message}</p>
    <hr/>
    <small>Order ID: ${notification.metadata.order_id}</small>
  `;
}

export async function emailWorker() {
    console.log("starting to send emails")
  try {
    const { data: jobs } = await supabase
      .from("notification_deliveries")
      .select("*, notifications(*)")
      .eq("channel", "email")
      .eq("status", "pending")
      .limit(20);

    for (const job of jobs) {
      try {
        await sendEmail({
          to: job.recipient,
          subject: job.notifications.title,
          html: buildEmailTemplate(job.notifications)
        });

        await supabase
          .from("notification_deliveries")
          .update({ status: "sent" })
          .eq("id", job.id);

        console.log("sent", job.id)

      } catch (err) {
        await supabase
          .from("notification_deliveries")
          .update({
            status: "failed",
            attempts: job.attempts + 1,
            last_error: err.message
          })
          .eq("id", job.id);

        console.log('failed to send')
      }
    }

  } catch (err) {
    console.error("Email Worker Error:", err.message);
  }
}
