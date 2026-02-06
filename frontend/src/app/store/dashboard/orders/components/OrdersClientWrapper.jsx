"use client";

import { useEffect, useState } from "react";
import TopRow from "./TopRow";
import OrderDetails from "./OrderDetails";
import CustomerDetails from "./CustomerDetails";
import Chat from "./Chat";
import { getStoreOrderDetails } from "@/lib/ordersApi";

export default function OrdersClientWrapper({ initialOrder = {}, id }) {
  const [order, setOrder] = useState(initialOrder || {});
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await getStoreOrderDetails(id);
      setOrder(data);
      return data;
    } catch (err) {
      console.error("OrdersClientWrapper: fetchOrder error", err?.message || err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refetchOrder = async () => {
    try {
      const data = await getStoreOrderDetails(id);
      setOrder(data);
      return data;
    } catch (err) {
      console.error("OrdersClientWrapper: refetchOrder error", err?.message || err);
      return null;
    }
  };

  // In case server rendered initialOrder is empty (or stale), fetch once on moun
  useEffect(() => {
    if (!initialOrder || !initialOrder.id) {
      fetchOrder();
    }
  }, []);

  return (
    <>
      <TopRow order={order} loading={loading} soId={id} reload={refetchOrder} />

      <div className="flex flex-col lg:flex-row">
        <div className="flex w-full lg:w-2/3 p-2">
          <OrderDetails order={order} loading={loading} />
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-1/3 p-2">
          <div className="flex">
            <CustomerDetails customer={order.customer || {}} loading={loading} />
          </div>
          <Chat orders={order} customer={order.customer || {}} loading={loading} />
        </div>
      </div>
    </>
  );
}
