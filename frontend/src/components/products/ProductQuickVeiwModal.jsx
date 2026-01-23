"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { getProductById } from "@/lib/marketplaceApi";
import ProductControls from "@/app/shopping/product/[slugAndId]/_components/ProductControls";

function ProductImages({ images }) {
  const [activeImage, setActiveImage] = useState(
    images?.[0]?.image_url || null
  );

  // 👇 Reset image when variant/images change
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

export default function ProductQuickViewModal({
  open,
  onOpenChange,
  product,
}) {
  if (!product) return null;

  const [fullProd, setFullProd] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(false);

   // images sent to the gallery
    const imagesToShow = useMemo(() => {
      if (
        selectedVariant &&
        selectedVariant.product_images &&
        selectedVariant.product_images.length > 0
      ) {
        return selectedVariant.product_images;
      }
      return fullProd.product_images || [];
    }, [selectedVariant, fullProd.product_images]);
  

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
      <DialogContent className="max-w-3xl max-h-[70vh] overflow-y-scroll">
        <div className="grid grid-cols-1 mt-10 md:mt-0 md:grid-cols-2 gap-6">
          {/* Image */}
          {/* <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div> */}
          {loading ? <p></p> : <ProductImages images={imagesToShow}/>}

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
