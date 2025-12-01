"use client";
import { useState } from "react";

export default function StripeOnboardingButton({ storeId, email }) {
  const [loading, setLoading] = useState(false);

  const handleOnboard = async () => {
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/create-connected-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, email }),
    });

    const { accountId } = await res.json();

    // generate onboarding link
    const linkRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/create-account-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    });

    const { url } = await linkRes.json();
    window.location.href = url; // redirect seller to Stripe onboarding
  };

  return (
    <button
      onClick={handleOnboard}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-md"
    >
      {loading ? "Redirecting..." : "Enable Payments"}
    </button>
  );
}
