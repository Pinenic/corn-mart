"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/utils/numberFormatter";
import Image from "next/image";
import { ProductDeleteDialog } from "./DeleteDialog";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function ProductGrid({
  onSelectProduct,
  selectedProduct,
  onDelete,
  products,
  loading,
}) {
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteDialog = (product) => {
    setSelected(product);
    setIsOpen(true);
  };

  const handleDelete = async () => {
    try {
      await onDelete(selected.id);
      setIsOpen(loading);
    } catch (error) {
      console.error("Failed to delete product", error.message);
      toast.error(error.messsage);
    }
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-4 p-1 overflow-y-scroll">
      {products.map((product) => (
        <Card className="w-full p-2 px-0 mb-2 border-none" key={product.id}>
          <CardContent className="h-full px-3">
            <div className="flex flex-col justify-between h-full gap-4">
              <div className="flex bg-muted rounded-lg h-40  justify-center items-center">
                <Image
                  src={product.thumbnail_url}
                  alt="preview"
                  width={400}
                  height={100}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-2 md:justify-between h-16 md:mt-2">
                <div className="flex flex-col gap-2 ">
                  <h1 className="text-sm line-clamp-1">{product.name}</h1>
                  <p className="text-xs bg-muted w-fit p-1 px-2 rounded-xl">
                    {product.category}
                  </p>
                </div>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <h1>K{formatNumber(product.price)}</h1>
                  <Separator orientation="vertical" />
                  <p>
                    {product.product_variants.reduce(
                      (sum, pv) => sum + (pv.stock || 0),
                      0
                    )}
                    pcs
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  size={"sm"}
                  className={"text-xs"}
                  onClick={() => onSelectProduct(product)}
                >
                  View
                </Button>
                <Button
                  variant={"outline"}
                  size={"sm"}
                  className={"text-xs text-destructive"}
                  onClick={() => handleDeleteDialog(product)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <ProductDeleteDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        product={selected}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}
