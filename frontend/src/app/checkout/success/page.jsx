"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const [status, setStatus] = useState("Verifying your payment...");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!session_id) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/verify-payment?session_id=${session_id}`);
        const data = await res.json();

        if (data.success) {
          setStatus("✅ Payment confirmed! Your order has been placed.");
          setDetails(data.data);
          localStorage.removeItem("cart"); // optional
        } else {
          setStatus(`⚠️ ${data.message}`);
        }
      } catch (err) {
        setStatus("❌ An error occurred while verifying your payment.");
      }
    };

    verifyPayment();
  }, [session_id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold mb-3">Order Confirmation</h1>
      <p className="text-lg mb-6">{status}</p>

      {details && (
        <div className="p-4 border rounded-lg max-w-md w-full bg-gray-50 text-left">
          <p><strong>Order Amount:</strong> {details.amount_total} {details.currency.toUpperCase()}</p>
          <p><strong>Email:</strong> {details.customer_email}</p>
          <p><strong>Payment Intent:</strong> {details.payment_intent}</p>
        </div>
      )}
    </div>
  );
}
