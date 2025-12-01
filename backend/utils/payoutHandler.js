import Stripe from "stripe";
import { supabase } from "../supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Example fixed test conversion rate: 1 ZMW ≈ 0.044 USD
const ZMW_TO_USD = 0.044;

/**
 * Convert ZMW to USD cents for Stripe transfers
 */
function convertZMWtoUSDCents(amountZMW) {
  return Math.ceil(amountZMW * ZMW_TO_USD * 100); // Stripe expects cents
}

/**
 * Process payouts for store_orders that are marked as received by customers.
 */
export async function processPayouts() {
  try {
    // 1️⃣ Fetch store_orders eligible for payout
    const { data: eligibleOrders, error } = await supabase
      .from("store_orders")
      .select("*")
      .eq("payout_status", "pending")
      .eq("status", "received")
      .is("stripe_transfer_id", null);

    if (error) throw error;
    if (!eligibleOrders.length) {
      console.log("✅ No store_orders ready for payout.");
      return;
    }

    console.log(`🔄 Found ${eligibleOrders.length} store_orders eligible for payout.`);

    // 2️⃣ Retrieve Stripe available balance (USD)
    const balance = await stripe.balance.retrieve();
    const availableUSD = balance.available.find(b => b.currency === "usd")?.amount || 0;
    console.log("💰 Available USD balance (cents):", availableUSD);

    let totalRequiredUSD = 0;
    const ordersWithUSD = eligibleOrders.map(order => {
      const usdCents = convertZMWtoUSDCents(order.net_amount);
      totalRequiredUSD += usdCents;
      return { ...order, usdCents };
    });

    if (totalRequiredUSD > availableUSD) {
      console.warn(`❌ Not enough available balance for all payouts. Required ${totalRequiredUSD}, available ${availableUSD}.`);
      // You could process partially or skip all — here we skip
      return;
    }

    for (const order of ordersWithUSD) {
      try {
        if (!order.stripe_account_id) {
          console.warn(`⚠️ Skipping store_order ${order.id}: Missing connected Stripe account.`);
          continue;
        }

        // 3️⃣ Create a Stripe transfer in USD
        const transfer = await stripe.transfers.create({
          amount: order.usdCents,
          currency: "usd",
          destination: order.stripe_account_id,
          description: `Payout for store_order ${order.id}`,
          metadata: {
            store_order_id: order.id,
            store_id: order.store_id,
          },
        });

        // 4️⃣ Update the store_order with transfer info
        const { error: updateError } = await supabase
          .from("store_orders")
          .update({
            stripe_transfer_id: transfer.id,
            payout_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) throw updateError;

        console.log(`✅ Payout successful for store_order ${order.id}`);
      } catch (err) {
        console.error(`❌ Payout failed for ${order.id}:`, err.message);
        await supabase
          .from("store_orders")
          .update({ payout_status: "failed" })
          .eq("id", order.id);
      }
    }

    console.log("🏁 All eligible payouts processed successfully.");
  } catch (err) {
    console.error("❌ Payout handler error:", err);
  }
}
