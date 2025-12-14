import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(req, res) {
    console.log(req.method);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    //const { amount } = req.body; // amount in ZMW, e.g., 10
    const amount = 5000;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Convert ZMW to cents (Stripe expects the smallest currency unit)
    // Stripe expects at least 50 cents USD equivalent — adjust accordingly
    // 1 ZMW ≈ 0.044 USD, so minimum 12 ZMW roughly = $0.53
    const amountCents = Math.round(amount * 100);
    if (amountCents < 1) {
      return new Response(
        JSON.stringify({
          error: "Amount too low. Must convert to at least 1 cent in ZMW.",
        }),
        { status: 400 }
      );
    }

    // Use Stripe test PaymentMethod
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "zmw",
      payment_method: "pm_card_visa",
      confirm: true,
      description: `Funding test balance with ${amount} ZMW`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error funding test balance:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500 }
    );
  }
}
