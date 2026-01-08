"use client";

import { formatNumber } from "@/utils/numberFormatter";
import { generateSlug } from "@/utils/slug";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import { ViewProductModal } from "./ViewProductsModal";

export default function ProductCard({ product, view = "Grid" }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const handleNav = () => {
    router.push(
      `/shopping/product/${generateSlug(product.name)}-${product.id}`
    );
  };
  return (
    <div onClick={handleNav}>
      {/* static heart icon top-right */}
      <div className="absolute top-3 right-3 z-10">
        <div className="w-9 h-9 rounded-full bg-background shadow flex items-center justify-center">
          <Heart className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {view === "Grid" ? (
        <>
          <div className="relative w-full h-56 flex-shrink-0 bg-zinc-50 dark:bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {product?.thumbnail_url && (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="object-contain w-full h-full"
              />
            )}
          </div>

          <div className="p-1">
            <div className="mt-1 flex items-baseline justify-between">
              <div>
                <div className="text-lg font-medium">
                  K{formatNumber(product?.price.toFixed(2))}
                </div>
                {product?.oldPrice && (
                  <div className="text-xs text-muted-foreground line-through">
                    ${product.oldPrice}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                {product?.rating}
              </div>
            </div>

            <h3 className="text-sm line-clamp-2">{product?.name}</h3>

            <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
              {/* <div>{product?.shipping || "Free shipping"}</div> */}
              <div>{product?.location === null ? "Zambia" : ( <p>{product?.location.city}, {product?.location.province}</p>) }</div>
              <div className="text-rose-600 font-medium">
                {product?.sold && `${product.sold} sold`}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex w-full items-center gap-4 p-4">
          <div className="relative w-40 h-40 flex-shrink-0 bg-zinc-50 dark:bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {product?.thumbnail_url && (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="object-contain w-full h-full"
              />
            )}
          </div>

          <div className="flex flex-col flex-1">
            <h3 className="font-medium line-clamp-2">{product?.name}</h3>

            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {product?.shortDescription}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">
                  K{product?.price.toFixed(2)}
                </div>
                {product?.oldPrice && (
                  <div className="text-xs text-muted-foreground line-through">
                    K{product.oldPrice}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                {product?.rating}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <div>{product?.shipping || "Free shipping"}</div>
              <div className="text-rose-600 font-medium">
                {product?.sold && `${product.sold} sold`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <ViewProductModal open={isOpen} onOpenChange={setIsOpen} product={product} /> */}
    </div>
  );
}
