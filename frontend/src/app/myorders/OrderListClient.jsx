"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import OrderCard from "./_components/OrderCard";

export default function OrderList({ orders = [], loading, soid, onSelect }) {
  const orderItems = orders?.order_items || [];

  return (
    <>
      <Card className="rounded-2xl shadow-none w-full max-h-[85vh] overflow-y-scroll">
        {loading ? (
          <div className="flex items-center justify-center min-h-[20vh]">
            {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
            <Spinner className="size-8 text-primary" />
          </div>
        ) : (
          <CardContent className="p-6">
            {orders.map((mo) => (
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
