"use client";

import { useEffect, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { fetchProducts } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { deleteProduct, getProductsByStore } from "@/lib/inventoryApi";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ProductDeleteDialog } from "./DeleteDialog";
import { formatNumber } from "@/utils/numberFormatter";

export default function ProductTable({
  onSelectProduct,
  selectedProduct,
  onDelete,
  products,
  loading,
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

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

  const totalPages = 1;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-3 items-center mb-3">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => setPage(1)}>Search</Button>
      </div>

      {/* Table */}
      <div className="overflow-y-auto flex-1">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                className={`cursor-pointer ${
                  selectedProduct?.id === product.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                }`}
              >
                <TableCell onClick={() => onSelectProduct(product)}>
                  {product.name}
                </TableCell>
                <TableCell onClick={() => onSelectProduct(product)}>
                  {product.category}
                </TableCell>
                <TableCell onClick={() => onSelectProduct(product)}>
                  K{formatNumber(product.price)}
                </TableCell>
                <TableCell onClick={() => onSelectProduct(product)}>
                  {product.product_variants.reduce(
                    (sum, pv) => sum + (pv.stock || 0),
                    0
                  )}
                </TableCell>
                <TableCell onClick={() => handleDeleteDialog(product)}>
                  <Trash className="w-4 text-red-700" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ProductDeleteDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        product={selected}
        onConfirm={handleDelete}
        loading={loading}
      />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-2 px-2 py-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <p className="text-sm">
          Page {page} of {totalPages}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
