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
import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import CartBadge from "./CartBadgeCounter";
import { formatNumber } from "@/utils/numberFormatter";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, subtotal, removeItem } = useCart();

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
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-4"
              >
                <Image
                  src={item.product_variants?.images[0]?.image_url || item.products?.thumbnail_url}
                  alt={item.products?.name}
                  width={100}
                  height={100}
                  className="rounded-lg border"
                />
                <div className="flex-1">
                  <h3 className="font-semibold md:text-lg line-clamp-1">
                    {item.products?.name}{" "}{item.product_variants?.name}
                  </h3>
                  <p className="text-gray-600">K{formatNumber(item.price?.toFixed(2))}</p>
                  <p>x {item.quantity}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive"
                >
                  <X />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between font-semibold">
            <span>Subtotal:</span>
            K{formatNumber(subtotal.toFixed(2))}
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
              className="flex-1 bg-primary hover:bg-primary/80"
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
