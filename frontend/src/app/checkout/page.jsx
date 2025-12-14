// app/checkout/page.js
import BackButton from "@/components/BackButton";
import CheckoutContent from "./CheckoutContent";

export default async function CheckoutPage() {
  // If using Supabase SSR auth:
  // const { user } = await getUserServerSide();

  return (
    <div className="max-w-4xl mx-auto py-5 px-4">
      <h1 className="flex justify-between text-2xl font-semibold mb-6">
        <BackButton />
        Checkout
      </h1>
      <CheckoutContent />
    </div>
  );
}
