"use client";

import { useEffect, useState } from "react";
import {
  getAllProducts,
  getCategories,
  searchMarket,
} from "@/lib/marketplaceApi";
import { Spinner } from "@/components/ui/spinner";
import ProductGrid, { SkeletonProductCard } from "./components/ProductGrid";
import PageTop from "./components/pageTop";
import SearchResultsGrid from "./components/SearchResultsGrid";

let Categories = [];

try {
  const cursor = await getCategories();
  Categories = cursor.data;
} catch (err) {
  // server-side fetch failed; client will handle retries
  console.error("Failed to fetch order on server:", err?.message || err);
}

export default function Page() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setResults] = useState([]);
  // const [searchLoading, setSearchLoadin] = useState(false);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await getAllProducts(0);
      setProducts(res.data.productsWithlocation);
      setLoading(false);
    } catch (error) {
      console.error("failed to fetch products", error);
    }
  }
  async function search(q) {
    try {
      const res = await searchMarket(q);
      return res.data;
    } catch (error) {
      return error.message;
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <PageTop
        Categories={Categories}
        setLoading={setLoading}
        onResults={setResults}
      />
      {loading ? (
        <div
          className={
            "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 mt-4"
          }
        >
          {[...Array(4)].map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {searchResults.length > 0 ? (
            <SearchResultsGrid
              initialProducts={searchResults}
              loading={loading}
              title="Search results"
            />
          ) : (
            <ProductGrid initialProducts={products} loading={loading} />
          )}
        </>
      )}
    </div>
  );
}
