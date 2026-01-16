"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { updateStoreOrderStatus } from "@/lib/ordersApi";
import { useAuthStore } from "@/store/useAuthStore";

export default function TopRow({ order = {}, loading = false, soId, reload }) {
  const {user, init} = useAuthStore();
  const [updating, setUpdating] = useState(false);
  const actorRole = "seller"
  const statusActionMap = {
    pending: "confirm",
    // confirmed: "process",
    processing: "ship",
    // shipped: "deliver", // seller OR buyer depending on role
  };

  const handleUpdateStatus = async (storeId, oldStatus, metadata = {}) => {
    const newStatus =
      oldStatus == "pending"
        ? "confirmed"
        : oldStatus == "confirmed"
        ? "processing"
        : oldStatus == "processing"
        ? "shipped"
        : "delivered";
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

      if (typeof reload === "function") {
        try {
          await reload();
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
  };

  useEffect(()=>{
    if(!user){
      return;
    }
    init();
  },[order?.id])

  return (
    <div className="rounded-2xl shadow-none mb-4">
      <div className="p-2 px-4">
        <div className="flex md:items-center gap-2 flex-col md:flex-row justify-between mb-4">
          {loading ? (
            <h2>Loading...</h2>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4">
                <h2 className=" flex gap-3 items-center text-sm lg:text-[16px]">
                  <span>
                    Order ID #STO-
                    {String(soId || "")
                      .slice(0, 3)
                      .toUpperCase()}
                  </span>{" "}
                  <Badge className={`rounded-full px-2 text-xs`}>
                    {order.status}
                  </Badge>
                </h2>
                <h2 className=" flex gap-6 text-sm lg:text-[15px] text-muted-foreground">
                  <span>
                    Received:{" "}
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </h2>
              </div>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleUpdateStatus(order.store_id, order.status)}
                disabled={order.status == "shipped"}
              >
                {updating
                  ? "updating..."
                  : order.status == "pending"
                  ? "Comfirm"
                  : order.status == "shipped"
                  ? "shipped"
                  : order.status == "processing"
                  ? "Ship"
                  : "Delivered"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
