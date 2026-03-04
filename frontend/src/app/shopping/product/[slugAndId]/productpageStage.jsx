"use client";

import { useState, useMemo } from "react";
import ProductControls from "./_components/ProductControls";
import { ProductImages } from "./_components/ProductImages";

export default function ProductPageStage({ product }) {
  const variants = product?.product_variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const VIEW = "page";

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
    <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-4 md:px-8">{product.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT: IMAGES */}
        <ProductImages images={imagesToShow} />

        {/* RIGHT: CONTROLS */}
        <div>
          

          <ProductControls
            product={product}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            view={VIEW}
          />
        </div>
      </div>
    </div>
  );
}
