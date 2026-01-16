"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import OrderCard from "./_components/OrderCard";
import { useEffect, useState } from "react";
import { CategoryTabs } from "@/components/store/CategoryTabs";
import { StatusTabs } from "./_components/StatusTabs";

export default function OrderList({ orders = [], loading, soid, onSelect }) {
  const Status = ["all", "pending", "processing", "completed", "cancelled"];
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredStatus =
    activeCategory === "all"
      ? orders
      : orders.filter(
          (p) => p.status.trim().toLowerCase() === activeCategory.toLowerCase()
        );
  useEffect(() => {
    console.log(orders);
  }, [orders]);

  return (
    <>
      <Card className="rounded-2xl p-0 shadow-none w-full max-h-[85vh] overflow-y-scroll">
        <div className="sticky top-0">
          <StatusTabs
            categories={Status}
            active={activeCategory}
            onChange={(cat) => setActiveCategory(cat)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[20vh]">
            {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
            <Spinner className="size-8 text-primary" />
          </div>
        ) : (
          <CardContent className="p-6">
            {filteredStatus.map((mo) => (
              <div
                key={mo.id}
                className="flex flex-col gap-4"
                onClick={() => onSelect(mo.id)}
              >
                <OrderCard order={mo} selectedId={soid} />
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </>
  );
}
