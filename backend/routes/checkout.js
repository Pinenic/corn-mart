import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

router.post("/", async (req, res) => {
  try {
    const { buyer_id, items } = req.body;

    if (!buyer_id || !items || !items.length) {
      return res.status(400).json({ error: "Invalid request payload" });
    }

    // 1️⃣ Calculate per-store subtotals
    const storesMap = {};
    items.forEach((item) => {
      if (!storesMap[item.store_id]) {
        storesMap[item.store_id] = { store_total_amount: 0, stripe_account_id: item.stripe_account_id || null };
      }
      storesMap[item.store_id].store_total_amount += item.price * item.quantity;
    });

    const stores = Object.entries(storesMap).map(([store_id, data]) => ({
      store_id,
      store_total_amount: data.store_total_amount,
      stripe_account_id: data.stripe_account_id,
      platform_fee: 0, // optional, compute platform fee per store if needed
    }));

    // 2️⃣ Calculate total amount for Stripe
    const total_amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 3️⃣ Insert pending cart
    const { data: pendingCart, error: cartError } = await supabase
      .from("pending_carts")
      .insert([
        {
          buyer_id,
          stores,
          items,
          platform_fee: 0, // optional
        },
      ])
      .select()
      .single();

    if (cartError) throw cartError;

    // 4️⃣ Prepare Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "zmw",
        product_data: {
          name: `Product ${item.name}`,
        },
        unit_amount: Math.round(item.price * 100), // convert to cents
      },
      quantity: item.quantity,
    }));

    // 5️⃣ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      metadata: {
        cart_id: pendingCart.id,
        buyer_id,
      },
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
