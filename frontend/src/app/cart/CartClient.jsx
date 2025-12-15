"use client";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CartClient() {
  const { items, subtotal, removeItem, updateItem, clearCart, cartId } = useCart();
    const router = useRouter();
    const handleNav = () => {
      router.push(`/checkout`)
    }

  useEffect(() => {
    document.title = "Corn Mart | Cart";
    console.log(cartId, items)
  }, []);

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    // updateItem expects (id, updates) or similar; adapt to your hook API
    // If updateItem signature is different, adjust accordingly.
    try {
      updateItem(id, quantity );
    } catch (err) {
      // fallback: if updateItem is a function that accepts (id, qty)
      try {
        updateItem(id, quantity);
      } catch (e) {
        console.error("updateItem signature mismatch", e);
      }
    }
  }

  const total = typeof subtotal === "number" ? subtotal : (items || []).reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
        <Link href="/shopping" className="text-primary font-medium hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 grid md:grid-cols-3 gap-6">
      {/* Cart items */}
      <div className="md:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-4">
            <Image
              src={item.products.thumbnail_url}
              alt={item.products.name}
              width={100}
              height={100}
              className="rounded-lg border"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{item.products.name}{" "}{item.product_variants.name}</h3>
              <p className="text-gray-600">K{item.price.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, ((item.quantity || 1) - 1))}
                >
                  -
                </Button>
                <span className="font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, ((item.quantity || 1) + 1))}
                >
                  +
                </Button>
              </div>
            </div>
            <Button variant="ghost" onClick={() => removeItem(item.id)} className="text-destructive">
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 h-fit dark:bg-muted">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>K{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2 text-sm text-gray-500">
          <span>Estimated Tax</span>
          <span>K2.50</span>
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>K{(total + 2.5).toFixed(2)}</span>
        </div>
        <Button className="w-full mt-4 bg-primary hover:bg-primary/90" onClick={() => handleNav()}>
          Proceed to Checkout
        </Button>
        <Button variant="ghost" className="w-full mt-2 text-destructive" onClick={() => clearCart()}>
          Clear Cart
        </Button>
      </div>
    </div>
  );
}
