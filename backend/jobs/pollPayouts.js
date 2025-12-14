/**
 * pollPayouts.js
 * Safely polls for eligible store_orders to payout and updates their status.
 */

import { supabase } from "../supabaseClient.js";
import { sendPayout, getPayoutStatus } from "../utils/momoDisbursement.js";

// === Config ===
const POLL_INTERVAL = 30_000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 10_000; // 10s between retries

let isRunning = false; // 🧠 Local concurrency guard

export async function pollEligiblePayouts() {
  if (isRunning) {
    console.log("⏳ Previous job still running, skipping this tick.");
    return;
  }

  isRunning = true;
  console.log("\n🔁 Checking for eligible payouts...");

  try {
    // 1️⃣ Fetch store_orders ready for payout
    const { data: eligibleOrders, error } = await supabase
      .from("store_orders")
      .select(`
        id,
        net_amount,
        store_id,
        payout_status,
        payout_reference_id,
        account_number,
        payout_retries
      `)
      .eq("status", "received")
      .in("payout_status", ["pending", "processing"])
      .limit(20); // safety limit per batch

    if (error) throw new Error(error.message);

    if (!eligibleOrders?.length) {
      console.log("✅ No eligible orders found.");
      return;
    }

    for (const order of eligibleOrders) {
      await handlePayout(order);
    }
  } catch (err) {
    console.error("💥 Error in payout poller:", err.message);
  } finally {
    isRunning = false;
  }
}

async function handlePayout(order) {
  try {
    // 🧠 Skip idempotently processed orders
    if (["completed", "failed"].includes(order.payout_status)) return;

    let referenceId = order.payout_reference_id;

    // 2️⃣ If no reference exists → initiate payout
    if (!referenceId) {
      let attempt = 0;
      let success = false;
      let newReference = null;

      console.log(`🚀 Initiating payout for order ${order.id}...`);

      while (attempt < MAX_RETRIES && !success) {
        try {
          const res = await sendPayout({
            amount: order.net_amount,
            sellerPhone: order.account_number,
            externalId: order.id,
          });

          newReference = res?.referenceId || res;
          success = true;

          // Update store_orders and payouts atomically
          await supabase.from("store_orders").update({
            payout_reference_id: newReference,
            payout_status: "processing",
            payout_retries: (order.payout_retries || 0) + 1,
          }).eq("id", order.id);

          await supabase.from("payouts").insert({
            store_order_id: order.id,
            store_id: order.store_id,
            amount: order.net_amount,
            momo_reference_id: newReference,
            status: "processing",
          });

          console.log(`💸 Payout initiated for order ${order.id} with ref ${newReference}`);
        } catch (err) {
          attempt++;
          console.warn(`⚠️ Retry ${attempt}/${MAX_RETRIES} for order ${order.id}: ${err.message}`);
          await new Promise(r => setTimeout(r, RETRY_DELAY));
        }
      }

      if (!success) {
        await markPayoutFailed(order.id, "All payout attempts failed");
        return;
      }

      referenceId = newReference;
    }

    // 3️⃣ Check payout status safely
    const statusRes = await getPayoutStatus(referenceId);
    const status = statusRes?.status;
    const reason = statusRes?.reason;

    if (status === "SUCCESSFUL") {
      await completePayout(order.id, referenceId);
    } else if (status === "FAILED") {
      await markPayoutFailed(order.id, reason);
    } else {
      console.log(`⌛ Payout still processing for order ${order.id}`);
    }
  } catch (err) {
    console.error(`💥 Error processing order ${order.id}:`, err.message);
  }
}

async function completePayout(orderId, referenceId) {
  await supabase.from("store_orders")
    .update({ payout_status: "completed" })
    .eq("id", orderId);

  await supabase.from("payouts")
    .update({ status: "completed", updated_at: new Date() })
    .eq("momo_reference_id", referenceId);

  console.log(`✅ Payout completed for order ${orderId}`);
}

async function markPayoutFailed(orderId, reason) {
  await supabase.from("store_orders")
    .update({ payout_status: "failed" })
    .eq("id", orderId);

  await supabase.from("payouts")
    .update({ status: "failed", error_message: reason, updated_at: new Date() })
    .eq("store_order_id", orderId);

  console.error(`❌ Payout failed for order ${orderId}: ${reason}`);
}

// Schedule every 30 seconds (local)
setInterval(pollEligiblePayouts, POLL_INTERVAL);
console.log("🕓 Payout poller started...");
