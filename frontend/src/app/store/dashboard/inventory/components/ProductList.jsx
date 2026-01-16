"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/utils/numberFormatter";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { ProductDeleteDialog } from "./DeleteDialog";
import { useState } from "react";

export default function ProductList({
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {products.map((product) => (
        <Card className="w-full p-2 mb-2" key={product.id}>
          <CardContent className="">
            <div className="flex gap-4">
              <div className="flex bg-muted rounded-lg h-20 items-center">
                <Image
                  src={product.thumbnail_url}
                  alt="preview"
                  width={60}
                  height={60}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 md:justify-between h-16 md:mt-2">
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                  <h1 className="text-sm line-clamp-1">{product.name}</h1>
                  <p className="text-xs bg-muted w-fit p-1 px-2 rounded-xl">
                    {product.category}
                  </p>
                </div>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <h1>K{formatNumber(product.price)}</h1>
                  <p>
                    {product.product_variants.reduce(
                      (sum, pv) => sum + (pv.stock || 0),
                      0
                    )}
                    pcs
                  </p>
                </div>
              </div>
              <div className="flex justify-end grow">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Ellipsis className="hover:bg-muted hover:cursor-pointer rounded-xl" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => onSelectProduct(product)}
                    >
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteDialog(product)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
