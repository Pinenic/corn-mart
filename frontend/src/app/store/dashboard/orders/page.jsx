"use client";

import { getStoreOrders } from "@/lib/ordersApi";
import OrdersOverview from "./components/OrdersOverview";
import OrdersTable from "./components/OrdersTable";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/store/useProfile";
import { useStoreStore } from "@/store/useStore";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  useEffect(() => {
    document.title = 'Store Orders | Corn Mart';
  }, []);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [delloading, setDelLoading] = useState(false);
  // const [message, setMessage] = useState("");
  const { profile } = useProfile();
  const { store } = useStoreStore();
  const storeId = store?.id;
  // const storeId = profile.stores[0]?.id;
  // const {store} = useStoreStore()

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getStoreOrders(storeId);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
    }
  }
  useEffect(() => {
    loadOrders();
  }, [storeId]);

  return (
    <div className="space-y-6">
      <SiteHeader title={"Orders"} storeId={storeId} />
      <OrdersOverview orders={orders} loading={loading} />
      <OrdersTable orders={orders} loading={loading} />
    </div>
  );
}
