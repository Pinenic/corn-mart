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
      const res = await getProductsByCategory(decodeURIComponent(category || ""));
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

  async function handleSearch(q) {
    setLoading(true);
    try {
      const res = await searchMarket(q);
      setProducts(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
              <DropdownMenuItem key={vu.name} onClick={() => setView(vu.name)}>
                {vu.name} {vu.icon}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="flex w-full items-center justify-center min-h-[50vh]">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : (
        <div
          className={
            view == "Grid"
              ? "grid grid-cols-4 gap-6 p-4 h-[70vh] overflow-y-scroll mt-4"
              : "flex flex-col h-[70vh] overflow-y-scroll mt-4 "
          }
        >
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} view={view} />
            </div>
          ))}
        </div>
      )}

      {!loading && products.length == 0 && (
        <div className="border p-4 mt-4">No products found</div>
      )}

      <div className="flex w-full justify-center gap-8 mt-2">
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {page} of {totalPages}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPage(1)}
            disabled={page == 1}
          >
            <span className="sr-only">Go to first page</span>
            <IconChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page == 1}
          >
            <span className="sr-only">Go to previous page</span>
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page == totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <IconChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => setPage(totalPages)}
            disabled={page == totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <IconChevronsRight />
          </Button>
        </div>
      </div>
    </>
  );
}
