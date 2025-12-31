"use client";

import { useEffect, useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import ProductTable from "./components/ProductTable";
import ProductDetailsPanel from "./components/ProductDetailsPanel";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { deleteProduct, getProductsByStore } from "@/lib/inventoryApi";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useProfile } from "@/store/useProfile";
import { useStoreStore } from "@/store/useStore";

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [delloading, setDelLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { profile } = useProfile();
  const { store } = useStoreStore();
  const storeId = store?.id;

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getProductsByStore(storeId);
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
    }
  }
  async function refreshProducts() {
    try {
      const data = await getProductsByStore(storeId);
      setProducts(data);
    } catch (err) {
      console.error(err.message);
    }
  }
  useEffect(() => {
    loadProducts();
  }, [storeId]);

  const handleDelete = async (productId) => {
    console.log("Deleting product:");
    try {
      setDelLoading(true);
      if (selectedProduct == null || selectedProduct.id == productId)
        setSelectedProduct(null);
      const res = await deleteProduct(productId);
      res?.success
        ? setMessage(res.success)
        : setMessage("Something went wrong");
      loadProducts();
      setDelLoading(false);
      toast.success("Product has been deleted Succesfully", message);
    } catch (error) {
      console.error("Failed to delete product", error.message);
      toast.success("Failed to delete product");
    }
  };

  const isMobile = useMediaQuery("(max-width: 1024px)"); // tablet & mobile threshold

  return (
    <div className="h-[calc(80vh-5rem)] p-4">
      <div className="flex mb-3">
        <Link href={"/store/dashboard/inventory/new"}>
          <Button>
            <Plus />
            Create
          </Button>
        </Link>
      </div>
      {isMobile ? (
        <>
          {/* Table always visible on mobile */}
          <ProductTable
            onSelectProduct={setSelectedProduct}
            selectedProduct={selectedProduct}
            onDelete={handleDelete}
            products={products}
            loading={delloading}
          />

          {/* Drawer for details */}
          <Drawer
            open={!!selectedProduct}
            onOpenChange={(open) => {
              if (!open) setSelectedProduct(null);
            }}
          >
            <DrawerContent className="drawer-content h-[100vh] rounded-t-2xl overflow-hidden border-t bg-background">
              <DrawerTitle></DrawerTitle>
              {selectedProduct && (
                <ProductDetailsPanel
                  product={selectedProduct}
                  reloadList={refreshProducts}
                  onClose={() => setSelectedProduct(null)}
                />
              )}
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full bg-card px-5 py-2 border rounded-lg overflow-hidden"
        >
          {/* Left: Products Table */}
          <ResizablePanel defaultSize={selectedProduct ? 60 : 100}>
            {loading ? (
              <>
                <div className="flex items-center justify-center min-h-[50vh]">
                  {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
                  <Spinner className="size-8 text-blue-500" />
                </div>
              </>
            ) : (
              <>
                <ProductTable
                  onSelectProduct={setSelectedProduct}
                  selectedProduct={selectedProduct}
                  onDelete={handleDelete}
                  products={products}
                  loading={delloading}
                />
              </>
            )}
          </ResizablePanel>

          {/* Right: Details Panel */}
          {selectedProduct && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20}>
                <ProductDetailsPanel
                  product={selectedProduct}
                  reloadList={refreshProducts}
                  onClose={() => setSelectedProduct(null)}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}
    </div>
  );
}
