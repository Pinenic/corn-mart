"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getStoreOrderDetails, updateStoreOrderStatus } from "@/lib/ordersApi";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ChatTab from "../components/OrderChatTab";

function TopRow({ order, loading, soId, reload }) {
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async (storeId, oldStatus, metadata = {}) => {
    const newStatus =
      oldStatus == "pending"
        ? "confirmed"
        : oldStatus == "confirmed"
        ? "processing"
        : oldStatus == "processing"
        ? "shipped"
        : "delivered";
    try {
      setUpdating(true);
      const res = await updateStoreOrderStatus(soId, {
        storeId,
        newStatus,
        metadata,
      });

      res?.success
        ? toast.success("order updated")
        : toast.error("failed to update order");
      setUpdating(false);
      reload();
    } catch (error) {
      console.error("Failed to update order", error.message);
      toast.error("Failed to update order");
      setUpdating(false);
    }
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
                <span>Order ID #STO-{soId.slice(0, 3).toUpperCase()}</span>{" "}
                <Badge className={`rounded-full px-2 text-xs`}>
                  {order.status}
                </Badge>
              </h2>
              <h2 className=" flex gap-6 text-sm lg:text-[15px] text-muted-foreground">
                <span>Received: 
                  {new Date(order.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </h2>
            </div>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleUpdateStatus(order.store_id, order.status)}
              >
                {updating
                  ? "updating..."
                  : order.status == "pending"
                  ? "Comfirm"
                  : order.status == "confirmed"
                  ? "Process"
                  : order.status == "processing"
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

function OrderDetails({ order, loading }) {
  const orderItems = order?.order_items || [];

  return (
    <Card className="rounded-2xl shadow-none w-full">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-lg">Orders Details</h2>
          </div>
        </div>

        {loading ? (
          <>
            <div className="flex items-center justify-center min-h-[50vh]">
              {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
              <Spinner className="size-8 text-blue-500" />
            </div>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="text-left py-3 px-2 font-medium">S.No</th>
                  <th className="text-left py-3 px-2 font-medium">Products</th>
                  <th className="text-left py-3 px-2 font-medium">Quantity</th>
                  <th className="text-left py-3 px-2 font-medium">Unit Cost</th>
                  <th className="text-left py-3 px-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-2">{index + 1}</td>
                    <td className="py-3 px-2">{item.products.name}</td>
                    <td className="py-3 px-2">{item.quantity}</td>
                    <td className="py-3 px-2">{item.unit_price}</td>
                    <td className="py-3 px-2">{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex mt-8 justify-end">
              <div className="flex flex-col space-y-1 w-56">
                <h2 className="text-sm text-black flex">Order summary</h2>
                <p className="text-sm text-muted-foreground flex justify-between mt-2">
                  Sub Total <span>K{order.subtotal}</span>{" "}
                </p>
                <p className="text-sm text-muted-foreground flex justify-between mb-2">
                  Platfor fee(5%)<span>-K{order.platform_fee}</span>{" "}
                </p>
                <p className="font-medium flex justify-between">
                  Total<span>K{order.subtotal - order.platform_fee}</span>{" "}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomerDetails({ customer, loading }) {
  return (
    <>
      <Card className="rounded-2xl shadow-none w-full">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-lg">Customer Details</h2>
            </div>
          </div>
          {loading ? (
            <>
              <div className="flex items-center justify-center">
                {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
                <Spinner className="size-8 text-blue-500" />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <p className="flex justify-between text-muted-foreground ">
                  Name <span> {customer?.full_name || "name"}</span>
                </p>
                <p className="flex justify-between text-muted-foreground ">
                  email <span> {customer?.email || "email@email.com"}</span>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}


function Chat({ orders, customer, loading }) {
  return (
    <>
      <Card className="rounded-2xl shadow-none w-full">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-lg">Chat</h2>
            </div>
          </div>
          {loading ? (
            <>
              <div className="flex items-center justify-center">
                {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
                <Spinner className="size-8 text-blue-500" />
              </div>
            </>
          ) : (
            <>
              <ChatTab orders={orders} avatar={customer.avatar_url} loading={loading}/>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function Page() {
  const { id } = useParams();
  const [order, setOrder] = useState({});
  const [loading, setLoading] = useState(false);
  // const [delloading, setDelLoading] = useState(false);
  // const [message, setMessage] = useState("");
  //   const storeId = "9fa980ba-e1d9-4983-89f3-b735a77e7e7a";

  async function loadOrder() {
    try {
      setLoading(true);
      const data = await getStoreOrderDetails(id);
      setOrder(data);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function refreshOrder() {
    try {
      const data = await getStoreOrderDetails(id);
      setOrder(data);
    } catch (err) {
      console.error(err.message);
    }
  }
  useEffect(() => {
    loadOrder();
  }, [id]);

  return (
    <div>
      <TopRow order={order} loading={loading} soId={id} reload={refreshOrder} />
      <div className="flex flex-col lg:flex-row">
        <div className="flex w-full lg:w-2/3 p-2">
          <OrderDetails order={order} loading={loading} />
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-1/3 p-2">
          <div className="flex">
            <CustomerDetails
              customer={order.customer || {}}
              loading={loading}
            />
          </div>
          <Chat orders={order} customer={order.customer || {}} loading={loading}/>
        </div>
      </div>
    </div>
  );
}
