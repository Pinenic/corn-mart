import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service key needed for server-side updates
);

// ⚠️ Optional: simple admin auth middleware (replace with your logic)
const verifyAdmin = async (req) => {
  const authHeader = req.headers.get("authorization");
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    return false;
  }
  return true;
};

export async function POST(req) {
  // 1️⃣ Verify admin access
  const authorized = await verifyAdmin(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2️⃣ Fetch eligible store_orders for payout
    const { data: eligibleOrders, error } = await supabase
      .from("store_orders")
      .select("*")
      .eq("payout_status", "pending")
      .eq("status", "received")
      .is("stripe_transfer_id", null);

    if (error) throw error;

    if (!eligibleOrders.length) {
      return NextResponse.json({ message: "No store_orders ready for payout." });
    }

    console.log(`🔄 Found ${eligibleOrders.length} store_orders eligible for payout.`);

    const payoutResults = [];

    // 3️⃣ Process each payout
    for (const order of eligibleOrders) {
      try {
        if (!order.stripe_account_id) {
          payoutResults.push({
            order_id: order.id,
            status: "skipped",
            reason: "Missing connected Stripe account",
          });
          continue;
        }

        // 4️⃣ Create a Stripe transfer
        const transfer = await stripe.transfers.create({
          amount: Math.round(order.net_amount * 100), // convert to cents
          currency: "zmw",
          destination: order.stripe_account_id,
          description: `Payout for store_order ${order.id}`,
          metadata: {
            store_order_id: order.id,
            store_id: order.store_id,
          },
        });

        // 5️⃣ Update payout record in database
        const { error: updateError } = await supabase
          .from("store_orders")
          .update({
            stripe_transfer_id: transfer.id,
            payout_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) throw updateError;

        payoutResults.push({
          order_id: order.id,
          status: "paid",
          transfer_id: transfer.id,
        });

        console.log(`✅ Paid out store_order ${order.id} (${order.net_amount} ZMW)`);
      } catch (err) {
        console.error(`❌ Failed payout for ${order.id}:`, err.message);
        await supabase
          .from("store_orders")
          .update({ payout_status: "failed" })
          .eq("id", order.id);

        payoutResults.push({
          order_id: order.id,
          status: "failed",
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      message: "Payouts processed.",
      results: payoutResults,
    });
  } catch (err) {
    console.error("❌ Payout route error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
