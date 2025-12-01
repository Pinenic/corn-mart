"use client"

import { getStoreOrders } from "@/lib/ordersApi";
import OrdersOverview from "./components/OrdersOverview";
import OrdersTable from "./components/OrdersTable";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/store/useProfile";
import { useStoreStore } from "@/store/useStore";

export default function Page() {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [delloading, setDelLoading] = useState(false);
    // const [message, setMessage] = useState("");
    const {profile} = useProfile();
  const storeId = profile.stores[0]?.id;
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
        <div>
            <OrdersOverview orders={orders} loading={loading} />
            <OrdersTable orders={orders} loading={loading} />
        </div>
    );
}