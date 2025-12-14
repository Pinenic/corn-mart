"use client";
import { useState, useEffect } from "react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { ProductGrid } from "@/components/store/StoreProductGrid";
import { CategoryTabs } from "@/components/store/CategoryTabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useParams } from "next/navigation";
import { getStoreById } from "@/lib/storesApi";

export default function StorePage({ params }) {
  const { storeId } = useParams();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  const getStore = async () => {
    setLoading(true);
    try {
      const res = await getStoreById(storeId);

      if (!res) throw new Error(result.error || "Failed to create store");
      console.log(res);
      setStores(res);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStore();
  }, []);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  // mock data for the store
  const store = {
    id: storeId,
    name: stores?.name || "Mikas Cakery",
    bannerUrl: stores.banner || "/banners/bakery-banner.jpg",
    avatarUrl: stores.logo || "/avatars/mika.jpg",
    description:
      stores.description ||
      "Welcome to Mika’s Cakery! We bake with love and passion — from cupcakes to celebration cakes.",
    followers: 1234,
    productsCount: stores.products?.length || 42,
    location: "Lusaka, Zambia",
    rating: 4.9,
    joined: "2023",
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      {/* Store header */}
      <StoreHeader store={store} />

      {/* Category tabs */}
      <div className="sticky top-[54px] z-40">
        <CategoryTabs
          active={activeCategory}
          onChange={(cat) => setActiveCategory(cat)}
        />
      </div>

      {/* Search and filter bar */}
      <div className="flex items-center gap-2 max-w-7xl mb-2 bg-background mx-auto p-4">
        <div className="flex flex-1 items-center border rounded-xl px-3">
          <Search className="w-4 h-4 mr-2" />
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none focus:ring-0"
          />
        </div>
        <Button className=" bg-primary hover:bg-primary/80 text-white px-6 rounded-xl">
          Search
        </Button>
      </div>

      {/* Product Grid */}
      <ProductGrid storeId={storeId} query={query} category={activeCategory} stores={stores} />
    </div>
  );
}
