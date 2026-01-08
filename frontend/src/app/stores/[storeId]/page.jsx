"use client";
import { useState, useEffect } from "react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { ProductGrid } from "@/components/store/StoreProductGrid";
import { CategoryTabs } from "@/components/store/CategoryTabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useParams } from "next/navigation";
import { getFollowerCount, getStoreById } from "@/lib/storesApi";

export default function StorePage({ params }) {
  const { storeId } = useParams();
  const [stores, setStores] = useState([]);
  const [storeLoc, setStoreLoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["all"]);

  const getStore = async () => {
    setLoading(true);
    try {
      const res = await getStoreById(storeId);

      if (!res) throw new Error(result.error || "Failed to fetch store");
      setStores(res);
      setStoreLoc(res.location[0]);
      setProducts(res.products);
      sortCategories(res.products);
      getNumbOfFollowers(res.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStore = async () => {
    try {
      const res = await getStoreById(storeId);

      if (!res) throw new Error(result.error || "Failed to fetch store");
      setStores(res);
      setProducts(res.products);
      sortCategories(res.products);
      getNumbOfFollowers(res.id);
    } catch (err) {
      console.error(err);
    }
  };

  const getNumbOfFollowers = async (store_id) => {
    const count = await getFollowerCount(store_id);
    count ? setCount(count.followers) : console.log("something went wrong");
  };

  const sortCategories = async (prods) => {
    setCategories([
      "all",
      ...new Set(prods.map((p) => p.category.trim().toLowerCase())),
    ]);
  };

  useEffect(() => {
    getStore();
  }, []);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (p) =>
            p.category.trim().toLowerCase() === activeCategory.toLowerCase()
        );
  // mock data for the store
  const store = {
    id: stores?.id,
    name: stores?.name || "Store Name",
    bannerUrl: stores.banner || "/banners/bakery-banner.jpg",
    avatarUrl: stores.logo || "/avatars/mika.jpg",
    description:
      stores.description ||
      "Welcome to Mika’s Cakery! We bake with love and passion — from cupcakes to celebration cakes.",
    followers: count,
    productsCount: stores.products?.length,
    location: `${storeLoc?.city || "lusaka"}, ${storeLoc?.province || "lusaka"}`,
    rating: 4.9,
    joined: stores.created_at,
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      {/* Store header */}
      <StoreHeader store={store} storeLoc={stores?.location} refresh={refreshStore} />

      {/* Category tabs */}
      <div className="sticky top-[54px] z-40">
        <CategoryTabs
          categories={categories}
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
      <ProductGrid
        storeId={storeId}
        query={query}
        category={activeCategory}
        products={filteredProducts}
      />
    </div>
  );
}
