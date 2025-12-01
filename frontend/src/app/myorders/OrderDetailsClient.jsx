"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import OrderCard from "./_components/OrderCard";

export default function OrderDetails({ order, loading, onSelect }) {
  const orderItems = order?.order_items || [];

  return (
    <>
      <Card className="rounded-2xl shadow-none w-full max-h-[85vh] overflow-y-scroll">
        <CardContent className="p-6">
          {order.map((mo) => (
            <div key={mo.id} className="flex flex-col gap-4" onClick={()=> onSelect(mo.id)}>
              <OrderCard order={mo} />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
