"use client";

import { createOrder } from "@/lib/ordersApi";
import { useCart } from "@/store/useCart";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckoutSummary({ subtotal, itemCount }) {
  const router = useRouter();
  const { user, cartId, getCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);
      const res = await createOrder(cartId, user);
      if (!res) {
        toast.error("failed to place order");
        setPlacing(false);
      }
      toast.success("Order placed successfully", { id: res.order_id });
      getCart(user);
      router.push("/shopping");
      setPlacing(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", { error: error });
    }
  };

  useEffect(() => {
    console.log(user, cartId);
  }, []);
  return (
    <div className="rounded-xl border p-4 bg-white dark:bg-muted shadow-sm sticky top-8">
      <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

      <div className="flex justify-between mb-3 text-sm">
        <p>Items</p>
        <p>{itemCount}</p>
      </div>

      <div className="flex justify-between mb-3 text-sm">
        <p>Subtotal</p>
        <p className="font-medium">ZMW {subtotal}</p>
      </div>

      <button
        className="mt-4 w-full bg-black dark:bg-foreground dark:text-background text-white py-3 rounded-lg font-medium hover:bg-gray-800"
        onClick={() => handlePlaceOrder()}
      >
        {placing ? "Placing..." : "Place order"}
      </button>
    </div>
  );
}
