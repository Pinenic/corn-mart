"use client";

import { useState, useMemo } from "react";
import ProductControls from "./_components/ProductControls";
import { ProductImages } from "./_components/ProductImages";

export default function ProductClientWrapper({ product }) {
  const variants = product?.product_variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);

  // images sent to the gallery
  const imagesToShow = useMemo(() => {
    if (
      selectedVariant &&
      selectedVariant.product_images &&
      selectedVariant.product_images.length > 0
    ) {
      return selectedVariant.product_images;
    }
    return product.product_images || [];
  }, [selectedVariant, product.product_images]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT: IMAGES */}
        <ProductImages images={imagesToShow} />

        {/* RIGHT: CONTROLS */}
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>

          <ProductControls
            product={product}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
          />
        </div>
      </div>
    </div>
  );
}
