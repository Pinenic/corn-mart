"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getProductById } from "@/lib/marketplaceApi";
import ProductControls from "@/app/shopping/product/[slugAndId]/_components/ProductControls";

export default function ProductQuickViewModal({
  open,
  onOpenChange,
  product,
  onAddToCart,
}) {
  if (!product) return null;

  const [fullProd, setFullProd] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFullProd = async () => {
    try {
      setLoading(true);
      const res = await getProductById(product.id);
      setFullProd(res.data[0]);
      setSelectedVariant(res.data[0].product_variants[0]);
      console.log(res.data[0]);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFullProd();
  }, [product]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* <p className="text-sm text-muted-foreground">
              {product.description}
            </p>

            <p className="text-lg font-bold">
              ZMW {product.price.toLocaleString()}
            </p>

            <Button className="w-full" onClick={() => onAddToCart(product)}>
              Add to Cart
            </Button> */}
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ProductControls
                product={fullProd}
                setSelectedVariant={setSelectedVariant}
                selectedVariant={selectedVariant}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
