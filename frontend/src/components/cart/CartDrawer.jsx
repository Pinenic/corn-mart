"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart} from "@/store/useCart";
import CartBadge from "./CartBadgeCounter";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, subtotal } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <CartBadge />
          {/* <ShoppingCart className="w-6 h-6 text-primary" /> */}
          {!items ||
            (items?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {items?.length}
              </span>
            ))}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[380px] p-4">
        <SheetHeader className="p-4 border-b border-gray-200">
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {!items || items?.length === 0 ? (
            <p className="text-gray-500 text-center mt-8">Your cart is empty</p>
          ) : (
            items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-md border"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-medium line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500">${item.price}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between font-semibold">
            <span>Subtotal:</span>
            {/* <span>${total?.toFixed(2)}</span> */}
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1"
              onClick={() => {
                setOpen(false);
                setTimeout(() => {
                  window.location.href = "/cart";
                }, 180); // drawer close animation time
              }}
            >
              <span>View Cart</span>
            </Button>

            <Button
              asChild
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => setOpen(false)}
            >
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
