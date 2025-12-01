"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Users } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getStores = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/stores", {
        method: "GET",
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to create store");

      setStores(result);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStores();
  }, []);

  if(loading) return (<div className="flex items-center justify-center min-h-screen">
        {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
        <Spinner className="size-8 text-blue-500"/>
      </div>);

  return (
    <div className="px-6 py-10 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">
        Explore Stores
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stores.map((store) => (
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
                  {store.followers || 26} follows
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
