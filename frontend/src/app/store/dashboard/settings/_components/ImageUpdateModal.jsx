"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ImageUpdateModal({
  open,
  onOpenChange,
  image,
  title,
  onSave,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(image);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file, image]);

  const handleSave = async () => {
    if (!file) return;
    await onSave(file);
    setFile(null);
    onOpenChange(false);
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-56 rounded-lg overflow-hidden bg-muted">
            <Image
              src={preview}
              alt="preview"
              fill
              className="object-cover"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full line-clamp"
          />

          <Button
            className="w-full bg-primary text-white"
            onClick={handleSave}
            disabled={!file}
          >
            Save image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
