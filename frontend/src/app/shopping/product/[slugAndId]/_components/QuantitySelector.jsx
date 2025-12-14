"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function QuantitySelector() {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => setQty((n) => Math.max(1, n - 1))}
      >
        -
      </Button>
      <span className="w-8 text-center">{qty}</span>
      <Button variant="outline" onClick={() => setQty((n) => n + 1)}>
        +
      </Button>
    </div>
  );
}
