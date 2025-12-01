"use client";
import { useEffect, useState } from "react";
import TopRow from "./TopRowClient";
import OrderDetails from "./OrderDetailsClient";
import CustomerDetails from "./CustomerDetailsClient";
import { getStoreOrderDetails, updateStoreOrderStatus } from "@/lib/ordersApi";
import { toast } from "sonner";

export default function OrdersClient({ initialOrder = {}, soId }) {
  const [order, setOrder] = useState(initialOrder || {});
  const [loading, setLoading] = useState(
    !initialOrder || Object.keys(initialOrder).length === 0
  );
  const [selectedOrderId, setSelectedId] = useState(null);

  async function loadOrder() {
    try {
      setLoading(true);
      const data = await getStoreOrderDetails(soId);
      setOrder(data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialOrder || Object.keys(initialOrder).length === 0) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soId]);

  async function handleUpdateStatus(storeId, oldStatus, metadata = {}) {
    const newStatus =
      oldStatus == "pending"
        ? "confirmed"
        : oldStatus == "confirmed"
        ? "processing"
        : oldStatus == "processing"
        ? "shipped"
        : "delivered";
    try {
      const res = await updateStoreOrderStatus(soId, {
        storeId,
        newStatus,
        metadata,
      });

      if (res?.success) {
        toast.success("Order updated");
        await loadOrder();
        return true;
      }
      toast.error("Failed to update order");
      return false;
    } catch (error) {
      console.error("Failed to update order", error?.message || error);
      toast.error("Failed to update order");
      return false;
    }
  }

  return (
    <div>
      {/* <TopRow order={order} loading={loading} soId={soId} onUpdateStatus={handleUpdateStatus} /> */}
      <div className="flex flex-col justify-center lg:flex-row p-4">
        <div className="flex w-full lg:w-1/2 p-2">
          <OrderDetails order={order} loading={loading} onSelect={setSelectedId}/>
        </div>
        <div className="flex flex-col w-full lg:w-1/3 p-2">
          <div className="flex">
            <CustomerDetails
              orderId={selectedOrderId}
              loading={loading}
            />
          </div>
          <div className="flex">order History</div>
        </div>
      </div>
    </div>
  );
}
