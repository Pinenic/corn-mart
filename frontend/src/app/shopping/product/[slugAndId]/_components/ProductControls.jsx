"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VariantSelector } from "./VariantSelector";
import { QuantitySelector } from "./QuantitySelector";
import { useCart } from "@/store/useCart";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { formatNumber } from "@/utils/numberFormatter";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import StockTag from "./stockTag";
import { Accordion } from "@radix-ui/react-accordion";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductControls({
  product,
  selectedVariant,
  setSelectedVariant,
  view
}) {
  const { user, init } = useAuthStore();
  const { addItem, loading } = useCart();
  const variants = product?.product_variants || [];
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!selectedVariant) {
      toast.error("Please choose a variant");
      return;
    }
    if (!user) {
      toast.info("Login to make a purchcase");
      return;
    }

    setAdding(true);
    try {
      await addItem(product.id, selectedVariant.id, quantity);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mt-4 space-y-6">
      {selectedVariant?.stock == 0 ? (
        <StockTag status={"out"} />
      ) : selectedVariant?.stock <= 10 ? (
        <StockTag status={"low"} />
      ) : (
        <StockTag status={"in"} />
      )}
      <p className="text-xl md:text-2xl font-semibold md:font-bold mt-2">
        K{formatNumber(selectedVariant?.price?.toFixed(2))}
      </p>

      {/* <div className="flex flex-col gap-3 border rounded-lg p-2 py-4">
        <div className="flex justify-between rounded-lg p-2 py-4">
          <p className="text-sm text-muted-foreground">
            ({selectedVariant?.stock} available)
          </p>
          <Link
            href={`/stores/${product?.store_id}`}
            className="underline text-sm text-primary hover:text-blue-300"
          >
            More from store
          </Link>
        </div>
        <h1>Description</h1>
        <p className="text-muted-foreground whitespace-pre-line">
          {selectedVariant?.description || product.description}
        </p>
      </div> */}

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
        {adding ? (
          <p className="flex gap-3">
            Adding <Spinner />{" "}
          </p>
        ) : (
          "Add to Cart"
        )}
      </Button>

      <div className="flex flex-col border rounded-lg p-4 py-2">
        <div className="flex justify-between rounded-lg p-0 py-4">
          <p className="text-sm text-muted-foreground">
            ({selectedVariant?.stock} available)
          </p>
          {view == "page" ? <Link
            href={`/stores/${product?.store_id}`}
            className="underline text-sm text-primary hover:text-blue-300"
          >
            More from store
          </Link> : ""}
        </div>
        <Accordion type="single" collapsible defaultValue="item-1" clas>
          <AccordionItem value="item-1">
            <AccordionTrigger>About Product</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {selectedVariant?.description || product.description}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
