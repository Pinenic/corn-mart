"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getProductById } from "@/lib/marketplaceApi";
import ProductControls from "@/app/shopping/product/[slugAndId]/_components/ProductControls";

export default function ImageUpdateModal({
  open,
  onOpenChange,
  submit,
  image,
  onFile,
  mainFile,
  title = "file upload",
}) {
  if (!image) return null;

  const [file, setFile] = useState(null);
  const [Preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    onFile(file);

    await submit();
    onOpenChange(false);

    return;
  };

  useEffect(() => {
    console.log(image);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else setPreview(image);
  }, [file]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="grid grid-cols-1 gap-6">
          {/* Image */}
          <div className="relative aspect-rectangle bg-muted rounded-lg overflow-hidden">
            <Image
              src={Preview}
              alt={"file"}
              width={550}
              height={400}
              className="w-3xl h-56 object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {title}
              </DialogTitle>
            </DialogHeader>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button
              className="w-full bg-primary hover:primary/70 text-white mt-5"
              onClick={() => handleSubmit()}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
