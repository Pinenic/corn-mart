"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrderStatusBadge from "./OrderStatusBadge";
// import OrderDetailsModal from "./OrderDetailsModal";
import { Button } from "@/components/ui/button";
// import OrderTrackingModal from "./OrderTrackingModal";

export default function OrderCard({ order }) {
  const { id, created_at: date, total_amount:total, status, store_orders } = order;
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);

  const items = store_orders.reduce((acc, storeOrder) => {
  return acc + storeOrder.order_items.length;
}, 0);

  // detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleViewDetails = () => {
    if (isMobile) router.push(`/orders/${id}`);
    else setIsModalOpen(true);
  };

  return (
    <>
      <div className=" rounded-xl mb-4 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-all">
        <div className="flex-1 space-y-2">
          <div className="flex items-center md:justify-between sm:justify-start sm:gap-4">
            <h3 className="font-semibold text-muted-foreground">
              Order - {id.slice(0, 4).toUpperCase()}
            </h3>
            <OrderStatusBadge status={status} />
          </div>
          <p className="text-sm text-gray-500">
            Placed on{" "}
            {new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="text-muted-foreground">{store_orders.length} {store_orders.length > 1 ? "stores" : "store"} —{" "}</span>
            {items} {items > 1 ? "items" : "item"} —{" "}
            <span className="font-medium text-muted-foreground">K{total}</span>
          </p>
        </div>

        <div className="flex gap-2 mt-4 sm:mt-0">
          {/* <Button onClick={handleViewDetails} variant="outline" size="sm">
            View Details
          </Button>
          {(status === "shipped" ||
            status === "processing" ||
            status === "out for delivery") && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTrackOpen(true)}
            >
              Track Order
            </Button>
          )} */}

          {/* <OrderTrackingModal
            open={trackOpen}
            onClose={setTrackOpen}
            order={order}
          /> */}
        </div>
      </div>

      {/* Desktop / Tablet Modal */}
      {/* {!isMobile && (
        // <OrderDetailsModal
        //   order={order}
        //   open={isModalOpen}
        //   onClose={setIsModalOpen}
        // />
      )} */}
    </>
  );
}
