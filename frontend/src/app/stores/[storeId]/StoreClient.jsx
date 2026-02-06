"use client";

import { useState, useEffect } from "react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { ProductGrid } from "@/components/store/StoreProductGrid";
import { CategoryTabs } from "@/components/store/CategoryTabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getFollowerCount } from "@/lib/storesApi";
import { searchMarket } from "@/lib/marketplaceApi";
import SearchBar from "@/app/shopping/components/SearchBar";

export default function StoreClient({ initialStore }) {
  const [stores, setStores] = useState(initialStore);
  const [storeLoc, setStoreLoc] = useState(initialStore.location?.[0]);
  const [count, setCount] = useState("");
  const [products, setProducts] = useState(initialStore.products || []);
  const [categories, setCategories] = useState(["all"]);
  const [searchResults, setResults] = useState([]);

  async function search(q) {
    try {
      const res = await searchMarket(q, stores?.id);
      return res.data;
    } catch (error) {
      return error.message;
    }
  }

  async function handleSearch(q) {
    try {
      setLoading(true);
      const res = await searchMarket(q, stores?.id);
      setResults(res.data["products"]);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    sortCategories(products);
    getNumbOfFollowers(initialStore.id);
  }, []);

  const getNumbOfFollowers = async (store_id) => {
    const count = await getFollowerCount(store_id);
    if (count) setCount(count.followers);
  };

  const sortCategories = (prods) => {
    setCategories([
      "all",
      ...new Set(prods.map((p) => p.category.trim().toLowerCase())),
    ]);
  };

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (p) => p.category.trim().toLowerCase() === activeCategory
        );

  const store = {
    id: stores.id,
    name: stores.name,
    bannerUrl: stores.banner,
    avatarUrl: stores.logo,
    description: stores.description,
    followers: count,
    productsCount: products.length,
    location: `${storeLoc?.city}, ${storeLoc?.province}`,
    rating: 4.9,
    joined: stores.created_at,
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      <StoreHeader store={store} storeLoc={stores.location} />

      <div className="top-[54px]">
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      <div className="flex items-center gap-2 max-w-7xl mb-2 mx-auto p-4">
        <SearchBar onQuery={search} onSearch={handleSearch} />
      </div>

      <ProductGrid
        query={query}
        category={activeCategory}
        products={filteredProducts}
      />
    </div>
  );
}
