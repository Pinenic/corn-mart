"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { formatNumber } from "@/utils/numberFormatter";

const statusColors = {
  delivered: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersTable({ orders, loading }) {
  const Status = ["all", "pending", "processing", "delivered", "cancelled"];
  const [activeStatus, setActiveStatus] = useState("all");

  const filteredStatus =
    activeStatus === "all"
      ? orders
      : orders.filter(
          (p) => p.status.trim().toLowerCase() === activeStatus.toLowerCase()
        );
  const router = useRouter();
  const handleNav = (id) => {
    router.push(`/store/dashboard/orders/${id}`);
  };
  return (
    <Card className="rounded-2xl shadow-none mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-lg">Orders</h2>
            <p className="text-sm text-muted-foreground">
              Your orders from most recent
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input placeholder="Search..." className="w-40 sm:w-60" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="capitalize">{activeStatus}</span>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Status.map((stat) => (
                  <DropdownMenuItem
                    key={stat}
                    onClick={() => setActiveStatus(stat)}
                    className={`capitalize`}
                  >
                    {stat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline">Last 7 Days</Button>
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
          <div className="flex max-h-[50vh] overflow-y-scroll overflow-x-auto">
            <table className="w-full h-full text-sm rounded-lg">
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
                {filteredStatus.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    onClick={() => handleNav(order.id)}
                  >
                    <td className="py-3 px-2">
                      STO-{order.id.slice(0, 4).toUpperCase()}
                    </td>
                    <td className="py-3 px-2 capitalize">{order.customer.full_name}</td>
                    <td className="py-3 px-2">{order.customer.email}</td>
                    <td className="py-3 px-2">K{formatNumber(order.subtotal)}</td>
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
