"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductImages({ images }) {
  const [activeImage, setActiveImage] = useState(images[0]?.image_url);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-fit md:h-fit rounded-xl overflow-hidden border">
        <Image
          src={activeImage}
          alt={"product name"}
          width={800}
          height={800}
          priority
          sizes="(max-width:768px) 100vw, 50vw"
          className="rounded-xl object-cover w-full"
        />
      </div>

      <div className="flex gap-3 justify-center overflow-x-auto">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setActiveImage(img.image_url)}
            className={`relative w-20 h-20 rounded-md overflow-hidden border ${
              activeImage === img ? "ring-2 ring-primary" : ""
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
