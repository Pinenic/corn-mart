"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

//Stat helper funtion
function getStoreOrderStats(orders) {
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(o => o.status === "pending").length;

  const completedOrders = orders.filter(o =>
    ["confirmed", "completed", "delivered"].includes(o.status)
  ).length;

  const completionRate =
    totalOrders === 0 ? 0 : (completedOrders / totalOrders) * 100;

  // You can replace subtotal with net_amount when you start calculating payout rules
  const potentialPayout = orders
    .filter(o => ["confirmed", "completed", "delivered"].includes(o.status))
    .reduce((sum, o) => sum + o.subtotal, 0);

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    completionRate,
    potentialPayout
  };
}

export default function OrdersOverview({ orders, loading }) {
    const stats = getStoreOrderStats(orders);
  return (
    <Card className="rounded-2xl shadow-none mb-4">
      <CardContent className="p-2 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Overview</h2>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            + Create Order
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Orders</p>
            <h3 className="text-2xl font-semibold mt-1">{orders?.length || "0"}</h3>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Pending orders</p>
            <h3 className="text-2xl font-semibold mt-1">{stats.pendingOrders}</h3>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Completion </p>
            <h3 className="text-2xl font-semibold mt-1">{stats.completionRate}</h3>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Potential Payout</p>
            <h3 className="text-2xl font-semibold mt-1">K{stats.potentialPayout}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
