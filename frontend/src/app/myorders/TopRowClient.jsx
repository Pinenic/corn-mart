"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function TopRow({ order, loading, soId, onUpdateStatus }) {
  const [updating, setUpdating] = useState(false);

  const handleClick = async () => {
    if (!order || !order.store_id) return;
    setUpdating(true);
    await onUpdateStatus(order.store_id, order.status);
    setUpdating(false);
  };

  return (
    <Card className="rounded-2xl shadow-none mb-4">
      <CardContent className="p-2 px-4">
        <div className="flex md:items-center gap-2 flex-col md:flex-row justify-between mb-4">
          {loading ? (
            <h2>Loading...</h2>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4">
                <h2 className=" flex gap-3 items-center text-sm lg:text-[16px]">
                  <span>Order ID #STO-{(soId || "").slice(0, 3).toUpperCase()}</span>{" "}
                  <Badge className={`rounded-full px-2 text-xs`}>{order.status}</Badge>
                </h2>
                <h2 className=" flex gap-6 text-sm lg:text-[15px] text-muted-foreground">
                  <span>
                    Received: {order?.created_at ? new Date(order.created_at).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"}) : "-"}
                  </span>
                </h2>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleClick}>
                {updating
                  ? "updating..."
                  : order?.status == "pending"
                  ? "Confirm"
                  : order?.status == "confirmed"
                  ? "Process"
                  : order?.status == "processing"
                  ? "Ship"
                  : "Delivered"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
