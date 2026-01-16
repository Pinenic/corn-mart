"use client";
import { useEffect, useState } from "react";
import {
  getBuyerOrder,
  getStoreOrderDetails,
  updateStoreOrderStatus,
} from "@/lib/ordersApi";
import { toast } from "sonner";
import { useProfile } from "@/store/useProfile";
import OrderList from "./OrderListClient";
import OrderDetails from "./OrderDetails";
import { useAuthStore } from "@/store/useAuthStore";

export default function OrdersClient({ initialOrder = {} }) {
  // const { profile } = useProfile();
  const { init, user } = useAuthStore();
  const actorRole = "buyer";
  const statusActionMap = {
    pending: "buyer_cancel",
    shipped: "buyer_receive",
  };
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(
    !initialOrder || Object.keys(initialOrder).length === 0
  );
  const [updating, setUpdating] = useState(false);
  const [selectedOrderId, setSelectedId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (!user) {
        init();
      }
      const data = await getBuyerOrder(user.id);
      // if (data) toast.success("fetched orders");
      setOrder(data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load initial orders");
    } finally {
      setLoading(false);
    }
  };

  const reloadOrders = async () => {
    try {
      setLoading(true);
      if (!user) {
        init();
      }
      const data = await getBuyerOrder(user.id);
      // if (data) toast.success("fetched orders");
      setOrder(data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load initial orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
      return;
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleUpdateStatus(soId, storeId, oldStatus, metadata = {}) {
    // const newStatus =
    //   oldStatus == "pending"
    //     ? "confirmed"
    //     : oldStatus == "confirmed"
    //     ? "processing"
    //     : oldStatus == "processing"
    //     ? "shipped"
    //     : "delivered";
    const action = statusActionMap[oldStatus];

    try {
      setUpdating(true);
      const res = await updateStoreOrderStatus(soId, {
        storeId,
        action,
        actor_id: user?.id,
        actorRole,
        metadata,
      });

      if (res?.success) toast.success("order updated");
      else toast.error("failed to update order");

      if (typeof reloadOrders === "function") {
        try {
          await reloadOrders();
        } catch (err) {
          console.error("reload failed:", err?.message || err);
        }
      }
    } catch (err) {
      console.error("Failed to update order", err?.message || err);
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
    }
  }

  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div>
      {/* Desktop / large screens layout */}
      <div className="flex flex-col justify-center lg:flex-row">
        <div className="flex w-full lg:w-2/3 p-2">
          <OrderList
            orders={order}
            loading={loading}
            updating={updating}
            soid={selectedOrderId}
            onSelect={(id) => {
              setSelectedId(id);
              setModalOpen(true); // open modal on mobile when an order is selected
            }}
          />
        </div>

        {/* Inline details for larger screens */}
        <div className="hidden lg:flex flex-col w-full lg:w-1/3 p-2">
          <div className="flex">
            <OrderDetails
              orderId={selectedOrderId}
              handleUpdate={handleUpdateStatus}
              loading={loading}
            />
          </div>
          {/* <div className="flex">order History</div> */}
        </div>
      </div>

      {/* Mobile modal for order details */}
      {isModalOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setModalOpen(false)}
          />
          {/* modal panel */}
          <div className="relative w-full max-h-[90vh] overflow-auto bg-background rounded-t-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Order Details</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="ml-2 p-2 rounded bg- text-sm"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <OrderDetails
              orderId={selectedOrderId}
              handleUpdate={async (soId, storeId, oldStatus, metadata) => {
                const ok = await handleUpdateStatus(
                  soId,
                  storeId,
                  oldStatus,
                  metadata
                );
                if (ok) setModalOpen(false); // optionally close modal after update
                return ok;
              }}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
