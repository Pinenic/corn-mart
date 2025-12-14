// backend/jobs/pollPendingPayments.js
import axios from "axios";
import { supabase } from "../supabaseClient.js";
import { getPaymentStatus } from "../utils/momoCollections.js";

const POLL_INTERVAL = 30000; // 30s
const MAX_DURATION = 5 * 60 * 1000; // 5 min
const MAX_RETRIES = 3; // max retries per poll
const RETRY_BASE_DELAY = 2000; // 2s, will double on each retry

async function pollPayment(payment) {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_DURATION) {
    try {
      let attempt = 0;
      let res;

      // Retry loop for network/temporary errors
      while (attempt < MAX_RETRIES) {
        try {
          res = await getPaymentStatus(payment.momo_reference_id);
          break; // success, exit retry loop
        } catch (err) {
          attempt++;
          console.warn(`[Payment ${payment.id}] Attempt ${attempt} failed: ${err.message} for ref: ${payment.momo_reference_id}`);
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_BASE_DELAY * 2 ** (attempt - 1);
            console.log(`[Payment ${payment.id}] Retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
          } else {
            throw err; // max retries reached, throw error
          }
        }
      }

      const { status } = res;

      if (status === "SUCCESSFUL") {
        console.log(`[Payment ${payment.id}] SUCCESSFUL, finalizing order...`);
        await axios.post(`${process.env.EDGE_FUNCTION_URL}/finalize-order`, { reservationId: payment.reservation_id, referenceID: payment.momo_reference_id });
        return;
      } else if (status === "FAILED") {
        console.log(`[Payment ${payment.id}] FAILED, releasing reservation...`);
        await supabase.from("reservations").update({ status: "expired" }).eq("id", payment.reservation_id);
        await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
        return;
      }

      // Still pending → wait before next poll
      await new Promise(r => setTimeout(r, POLL_INTERVAL));

    } catch (err) {
      console.error(`[Payment ${payment.id}] Polling error after retries:`, err.message);
      // Optional: you could mark as failed here or keep polling
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
    }
  }

  // Timeout reached → mark as failed
  console.log(`[Payment ${payment.id}] Timeout reached, marking as failed`);
  await supabase.from("reservations").update({ status: "expired" }).eq("id", payment.reservation_id);
  await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
}

export async function pollPendingPayments() {
  const { data: pendingPayments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching pending payments:", error.message);
    return;
  }

  for (const payment of pendingPayments) {
    // Fire-and-forget each payment poll
    pollPayment(payment);
  }
}

// Schedule polling every 30s for new pending payments
setInterval(pollPendingPayments, POLL_INTERVAL);

// Run immediately on start
pollPendingPayments();
