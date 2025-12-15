"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
// import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

// import data from "./data.json";
import { getProductsByStore } from "@/lib/inventoryApi";
import { useEffect, useState } from "react";
import { getStoreOrders } from "@/lib/ordersApi";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useProfile } from "@/store/useProfile";
import { useStoreStore } from "@/store/useStore";

const statusColors = {
  received: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700",
};

function OrdersTable({ orders, loading }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-lg">Orders</h2>
            <p className="text-sm text-muted-foreground">
              Your most recent orders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input placeholder="Search..." className="w-40 sm:w-60" />
            <Button variant="outline">Last 7 Days</Button>
            <Button variant="outline">Export CSV</Button>
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
            <table className="w-full text-sm rounded-lg">
              <thead className="border-b text-muted-foreground bg-muted sticky top-0 z-10">
                <tr>
                  <th className="text-left py-3 px-2 font-medium">Order ID</th>
                  <th className="text-left py-3 px-2 font-medium">Customer</th>
                  <th className="text-left py-3 px-2 font-medium">Email</th>
                  <th className="text-left py-3 px-2 font-medium">
                    Total Amount
                  </th>
                  <th className="text-left py-3 px-2 font-medium">Date</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-2">
                      STO-{order.id.slice(0, 4).toUpperCase()}
                    </td>
                    <td className="py-3 px-2">{order.customer.full_name}</td>
                    <td className="py-3 px-2">{order.customer.email}</td>
                    <td className="py-3 px-2">{order.subtotal}</td>
                    <td className="py-3 px-2">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        className={`${
                          statusColors[order.status]
                        } rounded-full px-3 py-1 text-xs font-medium`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { profile } = useProfile();
  const {store} = useStoreStore();
  const storeId = store?.id;

  async function loadData() {
    try {
      setLoading(true);
      const product_data = await getProductsByStore(storeId);
      const orders_data = await getStoreOrders(storeId);
      setProducts(product_data);
      setOrders(orders_data);
      setCustomers(
        Array.from(
          new Map(
            orders_data.map((order) => [order.customer.id, order.customer])
          ).values()
        )
      );
      setRevenue(
        orders_data
          .filter((order) => order.status === "delivered") // only include received orders
          .reduce((sum, order) => sum + (order.subtotal || 0), 0) // sum their net_amounts
      );
      setLoading(false);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function refreshProducts() {
    try {
      const data = await getProductsByStore(storeId);
      setProducts(data);
    } catch (err) {
      console.error(err.message);
    }
  }
  useEffect(() => {
    loadData();
  }, [storeId]);

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              revenue={revenue}
              customers={customers}
              products={products}
              orders={orders}
              loading={loading}
            />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive storeId={storeId} />
            </div>

            <div className="px-4 lg:px-6">
              <OrdersTable orders={orders} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
