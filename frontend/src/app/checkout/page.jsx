// app/checkout/page.js
import CheckoutContent from "./CheckoutContent";

export default async function CheckoutPage() {
  // If using Supabase SSR auth:
  // const { user } = await getUserServerSide();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      <CheckoutContent />
    </div>
  );
}
