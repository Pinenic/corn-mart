"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getStores } from "@/lib/storesApi";

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await getStores();
      setStores(res);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const skeletonCards = Array.from({ length: 8 }).map((_, i) => (
    <Card
      key={`skeleton-${i}`}
      className="hover:shadow-lg transition-all border border-muted bg-muted rounded-xl overflow-hidden"
    >
      <div className="animate-pulse">
      <div className="bg-gray-300 dark:bg-gray-700 h-36 w-full rounded-md"></div>
      <div className="mt-2 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="mt-2 h-4 bg-gray-300 dark:bg-gray-700 w-1/2 rounded"></div>
    </div>
    </Card>
  ));

  return (
    <div className="px-6 py-10 bg-background max-w-7xl m-auto min-h-screen">
      <h1 className="text-3xl font-bold text-text text-center mb-8">
        Explore Stores
      </h1>

      <Button className={"mb-2"} onClick={() => router.push("/selling/onboarding")}>
        <Plus /> Create Store
      </Button>

      {error && (
        <p className="text-sm text-red-500 mb-4">
          {error}
        </p>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? skeletonCards
          : stores.map((store) => (
              <Link href={`/stores/${store.id}`} key={store.id}>
                <Card className="hover:shadow-lg transition-all border border-muted bg-muted rounded-xl overflow-hidden">
                  <img
                    src={store.banner}
                    alt={store.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="font-semibold text-primary text-lg truncate">
                      {store.name}
                    </h2>
                    <p className="text-sm text-nuted-foreground mb-2 line-clamp-2">
                      {store.description}
                    </p>
                    <div className="flex items-center text-nuted-foreground text-sm">
                      <Users size={16} className="mr-1" />
                      {store.followers_count} follows
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  );
}
