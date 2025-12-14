"use client";

import Image from "next/image";

export default function CheckoutStoreSection({ storeId, items, storeName }) {
  return (
    <div className="rounded-xl border p-4 bg-white dark:bg-muted shadow-sm">
      {/* You may later replace storeId with store name if you fetch it */}
      <h2 className="font-semibold text-lg mb-3">
        Store: {storeName}
      </h2>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b pb-3"
          >
            {item.products?.thumbnail_url && (
              <Image
                src={item.products.thumbnail_url}
                width={70}
                height={70}
                alt={item.products?.name ?? "product"}
                className="rounded-lg object-cover"
              />
            )}

            <div className="flex-1">
              <p className="font-medium text-sm">
                {item.products?.name ?? "Unnamed product"}
              </p>

              {item.product_variants && (
                <p className="text-xs text-gray-500">
                  Variant: {item.product_variants.name}
                </p>
              )}

              <p className="text-sm mt-1 font-semibold">
                ZMW {item.price}
              </p>
            </div>

            <p className="text-sm font-medium">
              x {item.quantity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
