"use client";
import { Button } from "@/components/ui/button";

export function QuantitySelector({setQuantity, quantity}) {

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => setQuantity((n) => Math.max(1, n - 1))}
      >
        -
      </Button>
      <span className="w-8 text-center">{quantity}</span>
      <Button variant="outline" onClick={() => setQuantity((n) => n + 1)}>
        +
      </Button>
    </div>
  );
}
