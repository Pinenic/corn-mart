"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function OrderDetails({ order = {}, loading = false }) {
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
          <div className="flex items-center justify-center min-h-[50vh]">
            <Spinner className="size-8 text-blue-500" />
          </div>
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
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2">{index + 1}</td>
                    <td className="py-3 px-2">{item.products?.name}</td>
                    <td className="py-3 px-2">{item.quantity}</td>
                    <td className="py-3 px-2">{item.unit_price}</td>
                    <td className="py-3 px-2">{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex mt-8 justify-end">
              <div className="flex flex-col space-y-1 w-56">
                <h2 className="text-md font-medium text-text flex">Order summary</h2>
                <p className="text-sm text-muted-foreground flex justify-between mt-2">Sub Total <span>K{order.subtotal}</span></p>
                <p className="text-sm text-muted-foreground flex justify-between mb-2">Platfor fee(5%)<span>-K{order.platform_fee}</span></p>
                <p className="font-medium flex justify-between">Total<span>K{order.subtotal - order.platform_fee}</span></p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
