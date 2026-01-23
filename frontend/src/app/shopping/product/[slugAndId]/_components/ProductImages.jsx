"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function ProductImages({ images }) {
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
      <div className="relative w-full rounded-xl overflow-hidden border">
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

      <div className="flex gap-3 justify-center overflow-x-auto">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setActiveImage(img.image_url)}
            className={`relative w-20 h-20 rounded-md overflow-hidden border ${
              activeImage === img.image_url ? "ring-2 ring-primary" : ""
            }`}
          >
            <Image
              src={img.image_url}
              alt="thumb"
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
