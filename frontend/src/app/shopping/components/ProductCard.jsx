"use client";

import { generateSlug } from "@/utils/slug";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductCard({product, view = "Grid"}) {
  const router = useRouter();
  const handleNav = () => {
    router.push(`/shopping/product/${generateSlug(product.name)}-${product.id}`)
  }
  return (
    <div onClick={handleNav}>
      {/* static heart icon top-right */}
      <div className="absolute top-3 right-3 z-10">
        <div className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
          <Heart className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {view === "Grid" ? (
        <>
          <div className="relative h-56 w-full justify-center bg-zinc-50 dark:bg-muted">
            {/* expects product.image as string */}
            {product?.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="h-56"
              />
            ): (<img
              src={product?.images?.thumbnail}
              alt={product.name}
              className="object-contain"
            />)}
          </div>

          <div className="p-1">

            <div className="mt-1 flex items-baseline justify-between">
              <div>
                <div className="text-lg font-medium">K{product?.price.toFixed(2)}</div>
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

            <h3 className="text-sm line-clamp-2">
              {product?.name}
            </h3>

            <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
              <div>{product?.shipping || "Free shipping"}</div>
              <div className="text-rose-600 font-medium">
                {product?.sold && `${product.sold} sold`}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex w-full items-center gap-4 p-4">
          <div className="relative w-40 h-40 flex-shrink-0 bg-zinc-50 rounded-lg overflow-hidden">
            {product?.thumbnail_url && (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="object-contain"
              />
            )}
          </div>

          <div className="flex flex-col flex-1">
            <h3 className="font-medium text-sm line-clamp-2">
              {product?.name}
            </h3>

            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {product?.shortDescription}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">${product?.price.toFixed(2)}</div>
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

            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <div>{product?.shipping || "Free shipping"}</div>
              <div className="text-rose-600 font-medium">
                {product?.sold && `${product.sold} sold`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
