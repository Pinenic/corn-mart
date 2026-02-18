"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getProductById } from "@/lib/marketplaceApi";
import ProductControls from "@/app/shopping/product/[slugAndId]/_components/ProductControls";

/* ---------------------------------- */
/* Product Images */
/* ---------------------------------- */

function ProductImages({ images }) {
  const [activeImage, setActiveImage] = useState(
    images?.[0]?.image_url || null
  );

  useEffect(() => {
    setActiveImage(images?.[0]?.image_url || null);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full bg-muted rounded-xl overflow-hidden border">
        {activeImage && (
          <Image
            src={activeImage}
            alt="product image"
            width={800}
            height={800}
            priority
            className="object-cover w-full"
          />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Modal */
/* ---------------------------------- */

export default function ProductQuickViewModal({
  open,
  onOpenChange,
  product,
}) {

  // ✅ Hooks must ALWAYS be first
  const [fullProd, setFullProd] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(false);

  const imagesToShow = useMemo(() => {
    if (
      selectedVariant?.product_images?.length > 0
    ) {
      return selectedVariant.product_images;
    }

    return fullProd?.product_images || [];
  }, [selectedVariant, fullProd]);

  // ✅ Fetch product
  useEffect(() => {
    if (!product) return;

    const fetchFullProd = async () => {
      try {
        setLoading(true);
        const res = await getProductById(product.id);
        const data = res.data[0];

        setFullProd(data);
        setSelectedVariant(data.product_variants?.[0] || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullProd();
  }, [product]);

  // ✅ Guard AFTER hooks
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl md:w-xl max-h-[70vh] md:h-fit overflow-y-scroll">

        <div className="grid grid-cols-1 mt-10 md:mt-0 md:grid-cols-2 gap-6">

          {/* Images */}
          {loading ? (
            <p />
          ) : (
            <ProductImages images={imagesToShow} />
          )}

          {/* Details */}
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {product.name}
              </DialogTitle>
            </DialogHeader>

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
