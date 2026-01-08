"use client";

import { Plus, X } from "lucide-react";
import { useRef } from "react";

export default function VariantImageRow({ title, images, onAdd, onDelete }) {
  const fileRef = useRef(null);

  const handleSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) onAdd(files);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-muted-foreground">{title}</h4>
      </div>

      <div className="flex gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative w-24 h-24 rounded overflow-hidden border"
          >
            <img src={img.image_url} className="w-full h-full object-cover" />

            <button
              onClick={() => onDelete(img.id)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* {images.length === 0 && (
          <p className="text-sm text-gray-400">No images yet</p>
        )} */}
        {images.length < 3 && (
          <button
            onClick={() => fileRef.current.click()}
            className="relative w-24 h-24 rounded overflow-hidden border"
          >
            <Plus className="w-full h-full p-8 text-muted-foreground" />
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
