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
import { Ellipsis, LayoutDashboard, List, Plus, Table } from "lucide-react";
import Link from "next/link";
import { deleteProduct, getProductsByStore } from "@/lib/inventoryApi";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
// import { useProfile } from "@/store/useProfile";
import { useStoreStore } from "@/store/useStore";

const setPageTitle = () => {
  document.title = 'Store Inventory | Corn Mart';
};
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { formatNumber } from "@/utils/numberFormatter";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import ProductList from "./components/ProductList";
import ProductGrid from "./components/ProductGrid";

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [delloading, setDelLoading] = useState(false);
  const [message, setMessage] = useState("");
  // const { profile } = useProfile();
  const { store } = useStoreStore();
  const storeId = store?.id;
  const [view, setView] = useState("List");

  const views = [
    { name: "List", icon: <List /> },
    { name: "Grid", icon: <LayoutDashboard /> },
    { name: "Table", icon: <Table /> },
  ];

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
    <>
    <SiteHeader title={"Inventory"} storeId={storeId}/>
      <div className="w-full overflow-auto">
        <div className="flex justify-between mb-3">
          <Link href={"/store/dashboard/inventory/new"}>
            <Button>
              <Plus />
              Create
            </Button>
          </Link>
          {/* View Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <span>{view} view</span>
                {view === "Grid" ? (
                  <LayoutDashboard />
                ) : view === "List" ? (
                  <List />
                ) : (
                  <Table />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {views.map((vu) => (
                <DropdownMenuItem
                  key={vu.name}
                  onClick={() => setView(vu.name)}
                >
                  {vu.name} {vu.icon}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isMobile ? (
          <div className="w-full h-full bg-card py-2 border rounded-lg overflow-y-auto">
            {/* Table always visible on mobile */}
            {view == "Table" ? (
              <ProductTable
                onSelectProduct={setSelectedProduct}
                selectedProduct={selectedProduct}
                onDelete={handleDelete}
                products={products}
                loading={delloading}
              />
            ) : view == "List" ? (
              <ProductList
                onSelectProduct={setSelectedProduct}
                selectedProduct={selectedProduct}
                onDelete={handleDelete}
                products={products}
                loading={delloading}
              />
            ) : (
              <ProductGrid
                onSelectProduct={setSelectedProduct}
                selectedProduct={selectedProduct}
                onDelete={handleDelete}
                products={products}
                loading={delloading}
              />
            )}

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
          </div>
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
                  {view == "Table" ? (
                    <ProductTable
                      onSelectProduct={setSelectedProduct}
                      selectedProduct={selectedProduct}
                      onDelete={handleDelete}
                      products={products}
                      loading={delloading}
                    />
                  ) : view == "List" ? (
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
                                  <h1 className="text-sm line-clamp-1">
                                    {product.name}
                                  </h1>
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
                                      onClick={() =>
                                        setSelectedProduct(product)
                                      }
                                    >
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(product.id)}
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
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-6 p-4 overflow-y-scroll">
                      {products.map((product) => (
                        <Card className="w-full p-2 px-0 mb-2" key={product.id}>
                          <CardContent className="h-full px-3">
                            <div className="flex flex-col justify-between h-full gap-4">
                              <div className="flex bg-muted rounded-lg h-40 justify-center items-center">
                                <Image
                                  src={product.thumbnail_url}
                                  alt="preview"
                                  width={400}
                                  height={100}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                              <div className="flex flex-col gap-2 md:justify-between h-16 md:mt-2">
                                <div className="flex flex-col gap-2 ">
                                  <h1 className="text-sm line-clamp-1">
                                    {product.name}
                                  </h1>
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
                                  onClick={() => setSelectedProduct(product)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant={"outline"}
                                  size={"sm"}
                                  className={"text-xs"}
                                >
                                  Delete
                                </Button>
                                {/* <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Ellipsis className="hover:bg-muted hover:cursor-pointer rounded-xl" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => setSelectedProduct(product)}
                                  >
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(product.id)}
                                    className="text-destructive"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu> */}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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
    </>
  );
}
