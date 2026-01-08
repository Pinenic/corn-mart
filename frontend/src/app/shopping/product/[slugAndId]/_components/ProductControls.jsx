"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VariantSelector } from "./VariantSelector";
import { QuantitySelector } from "./QuantitySelector";
import { useCart } from "@/store/useCart";
import { toast } from "sonner";
import { formatNumber } from "@/utils/numberFormatter";
import { Spinner } from "@/components/ui/spinner";

export default function ProductControls({
  product,
  selectedVariant,
  setSelectedVariant,
}) {
  const { addItem, loading } = useCart();
  const variants = product?.product_variants || [];
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!selectedVariant) {
      toast.error("Please choose a variant");
      return;
    }

    setAdding(true);
    try {
      addItem(product.id, selectedVariant.id, quantity);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mt-4 space-y-6">
      <p className="text-3xl font-bold mt-2">
        ZMW {formatNumber(selectedVariant?.price?.toFixed(2))}
      </p>

      <p className="text-gray-700 whitespace-pre-line">
        {selectedVariant?.description || product.description}
      </p>

      <VariantSelector
        variants={variants}
        sv={selectedVariant}
        chooseVariant={setSelectedVariant}
      />

      <QuantitySelector setQuantity={setQuantity} quantity={quantity} />

      <Button
        size="lg"
        className="w-full"
        onClick={handleAdd}
        disabled={adding}
      >
        {loading ? <p className="flex gap-3">Adding <Spinner /> </p> : "Add to Cart"}
      </Button>
    </div>
  );
}
