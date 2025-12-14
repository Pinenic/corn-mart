"use client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

// Dummy data (replace with fetch later)
const sampleOrders = [
  {
    id: "A1021",
    date: "Oct 7, 2025",
    total: 89.99,
    status: "delivered",
    items: [
      { name: "Wireless Mouse", price: 29.99 },
      { name: "Keyboard", price: 60.0 },
    ],
  },
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const order = sampleOrders.find((o) => o.id === id);

  if (!order) return <p className="p-6 text-center text-gray-600">Order not found.</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-xl font-bold">Order #{order.id}</h1>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Placed on {order.date}</p>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-2">Items</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span>{item.name}</span>
              <span>K{item.price}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-4 flex justify-between items-center">
        <h4 className="font-semibold">Total</h4>
        <p className="text-lg font-bold">K{order.total}</p>
      </div>
    </div>
  );
}
