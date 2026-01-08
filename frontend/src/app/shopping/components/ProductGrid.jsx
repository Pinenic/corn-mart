"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, LayoutDashboard, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
// import data from "./data.json";
import ProductCard from "./ProductCard";
// import CategorySidebar from "./components/CategorySidebar";
import { AutoBreadcrumb } from "./AutoBreadcrumb";
import { getAllProducts, searchMarket } from "@/lib/marketplaceApi";

const Categories = [
  "Electronics",
  "Home & Garden",
  "Fashion",
  "Mortor",
  "Industrial",
  "Toys & Games",
];

export default function ProductGrid({ initialProducts, loading, title }) {
  const { ref, inView } = useInView();
  const [view, setView] = useState("Grid");
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const views = [
    { name: "List", icon: <List /> },
    { name: "Grid", icon: <LayoutDashboard /> },
  ];

  async function fetchMoreProducts() {
    if (!hasMore) return;

    try {
      setLoadingMore(true);
      const res = await getAllProducts(page + 1-1);

      setProducts((prev) => [...prev, ...res.data.productsWithlocation]);
      setPage((prev) => prev + 1);
      setHasMore(res.data.hasMore);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex">
      <main className="w-full">
        {/* Header */}
        <div className="flex justify-between px-3 mt-5">
          {title ? <h2>{title}</h2> : (<div className="hidden"> <AutoBreadcrumb /></div>)}

          <div className="flex w-full md:w-fit gap-4 justify-between md:justify-start">
            {/* Sort Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
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

            {/* View Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span>{view} view</span>
                  {view === "Grid" ? <LayoutDashboard /> : <List />}
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
        </div>

        {/* Product Display */}
        <div
          className={
            view === "Grid"
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 mt-4"
              : "flex flex-col gap-4 p-4 mt-4"
          }
        >
          {/* Initial Page Loading */}
          {loading ? (
            [...Array(8)].map((_, i) => <SkeletonProductCard key={i} />)
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} view={view} />
            ))
          )}

          {/* Skeleton Loader for Loading More */}
          {loadingMore &&
            [...Array(4)].map((_, i) => <SkeletonProductCard key={`sk-${i}`} />)}
        </div>

        {/* Load More / No More Message */}
        <div className="flex w-full justify-center mt-4" ref={ref}>
          {!loading && !loadingMore && products.length > 0 && inView && hasMore && (
            <Button
              onClick={fetchMoreProducts}
              variant="outline"
              className="mt-2 mb-2"
            >
              Load More
            </Button>
          )}

          {!hasMore && (
            <p className="text-gray-500 mt-2 text-sm">
              no more products to load.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- Skeleton Loader Component ---------------- */

export function SkeletonProductCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 dark:bg-gray-700 h-36 w-full rounded-md"></div>
      <div className="mt-2 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="mt-2 h-4 bg-gray-300 dark:bg-gray-700 w-1/2 rounded"></div>
    </div>
  );
}

