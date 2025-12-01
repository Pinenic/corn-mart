"use client";
import OrderCard from "@/components/orders/OrderCard";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

// Dummy data for UI testing
const sampleOrders = [
  {
    id: "A1021",
    date: "Oct 7, 2025",
    total: 89.99,
    status: "delivered",
    items: [{ name: "Wireless Mouse" }, { name: "Keyboard" }],
  },
  {
    id: "A1022",
    date: "Oct 9, 2025",
    total: 149.49,
    status: "processing",
    items: [{ name: "Bluetooth Headphones" }],
  },
  {
    id: "A1023",
    date: "Oct 10, 2025",
    total: 299.0,
    status: "shipped",
    items: [{ name: "Smartwatch" }],
  },
];

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // TODO: Fetch from Supabase for real user orders
    if (user) {
      setOrders(sampleOrders);
    }
  }, [user]);

  if (!user)
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600">Please log in to view your orders.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-20">You haven’t placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
