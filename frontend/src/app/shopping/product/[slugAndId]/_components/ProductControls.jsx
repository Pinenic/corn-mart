// app/product/[slugAndId]/_components/ProductControls.jsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VariantSelector } from "./VariantSelector";
import { QuantitySelector } from "./QuantitySelector";
import { useCart } from "@/store/useCart";
import { toast } from "sonner"; // or your toast lib

export default function ProductControls({ product }) {
  const { addItem } = useCart();

  const variants = product?.product_variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Set default variant after mount
  useEffect(() => {
    console.log(variants);
    if (variants.length > 0) setSelectedVariant(variants[0]);
  }, [product.id]);

  async function handleAdd() {
    if (!selectedVariant) {
      toast.error("Please choose a variant");
      return;
    }

    setAdding(true);

    // Optimistic update
    try {
      addItem(product.id, selectedVariant.id, quantity);
      console.log("Added to cart");
    } catch (e) {
      console.log("Failed to add to cart", e);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mt-4 space-y-6">
      <p className="text-3xl font-bold mt-2">ZMW {product.price.toFixed(2)}</p>
      <VariantSelector variants={variants} sv={selectedVariant} chooseVariant={setSelectedVariant} />

      <QuantitySelector setQuantity={setQuantity} quantity={quantity} />

      <Button
        size="lg"
        className="w-full"
        onClick={handleAdd}
        disabled={adding}
      >
        {adding ? "Adding…" : "Add to Cart"}
      </Button>
    </div>
  );
}
