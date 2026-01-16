"use client";

import { Plus, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

export default function VariantImageRow({ title, images, onAdd, onDelete }) {
  const fileRef = useRef(null);
  const MAX_IMAGES = 3;
  const remainingSlots = MAX_IMAGES - images.length;

  const handleSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    let allowedFiles = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.warning(`You can only upload ${remainingSlots} more image(s).`);
    }

    onAdd(allowedFiles);

    // Reset input to allow same file selection again
    e.target.value = "";
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-muted-foreground">{title}</h4>
      </div>

      <div className="flex gap-3">
        {/* Existing Images */}
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

        {/* Add Button */}
        {remainingSlots > 0 && (
          <button
            onClick={() => fileRef.current.click()}
            className="relative w-24 h-24 rounded overflow-hidden border flex items-center justify-center"
          >
            <Plus className="w-8 h-8 text-muted-foreground" />
            <span className="sr-only">Add image</span>
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={remainingSlots > 1}
          onChange={handleSelect}
          className="hidden"
          key={remainingSlots} // force reset when count changes
        />
      </div>
    </div>
  );
}
