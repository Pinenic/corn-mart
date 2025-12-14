"use client";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LayoutDashboard, List } from "lucide-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { Spinner } from "@/components/ui/spinner";
import { searchMarket, getProductsByCategory } from "@/lib/marketplaceApi";

const Categories = [
  "Electronics",
  "Home & Garden",
  "Fashion",
  "Mortor",
  "Industrial",
  "Toys & Games",
];

export default function ProductsClient({ initialProducts = [], category }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("Grid");
  const [page, setPage] = useState(1);
  const totalPages = 10;

  useEffect(() => {
    // If server returned nothing, try fetching on client (network fallback)
    if ((!initialProducts || initialProducts.length === 0) && category) {
      fetchProductsClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  async function fetchProductsClient() {
    try {
      setLoading(true);
      const res = await getProductsByCategory(
        decodeURIComponent(category || "")
      );
      setProducts(res?.data || []);
    } catch (error) {
      console.error("failed to fetch products (client)", error);
    } finally {
      setLoading(false);
    }
  }

  const views = useMemo(
    () => [
      { name: "List", icon: <List /> },
      { name: "Grid", icon: <LayoutDashboard /> },
    ],
    []
  );

  return (
    <>
      <main className="w-full">
        <div className="flex gap-4 px-3 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size={"sm"}>
                <span>Sort</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Categories.map((cat) => (
                <DropdownMenuItem key={cat}>{cat}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size={"sm"}>
                <span>{view} view</span>
                {view == "Grid" ? <LayoutDashboard /> : <List />}
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

        <div
          className={
            view == "Grid"
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 overflow-y-scroll mt-4"
              : "flex flex-col overflow-y-scroll mt-4 "
          }
        >
          {loading ? (
            <>
              <div className="flex w-full items-center justify-center min-h-[100vh]">
                {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
                <Spinner className="size-8 text-blue-500" />
              </div>
            </>
          ) : (
            products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} view={view} />
              </div>
            ))
          )}
        </div>
        <div
          className={
            products.length == 0
              ? "hidden"
              : "flex w-full justify-center gap-8 mt-2"
          }
        >
          {/* <div ref={ref} className={loading ? "hidden" : "flex"}>
            Loading...
          </div> */}
        </div>
      </main>
    </>
  );
}
