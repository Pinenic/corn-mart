import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * GET /api/verify-payment?session_id=...
 * This route verifies the Stripe checkout session after redirect
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      return Response.json(
        { success: false, message: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return Response.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (session.payment_status === "paid") {
      return Response.json({
        success: true,
        message: "Payment verified successfully.",
        data: {
          session_id: session.id,
          customer_email: session.customer_details?.email || null,
          amount_total: session.amount_total / 100,
          currency: session.currency,
          payment_intent: session.payment_intent,
        },
      });
    } else {
      return Response.json({
        success: false,
        message: `Payment not completed. Current status: ${session.payment_status}`,
      });
    }
  } catch (err) {
    console.error("❌ Verify Payment Error:", err);
    return Response.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
