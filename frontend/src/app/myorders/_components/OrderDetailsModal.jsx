"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderDetailsModal({ order, open, onClose }) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Order #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Placed on {order.date}</p>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Items</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>K{item.price}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Shipping Info</h4>
            <p className="text-sm text-gray-600">
              {order.shipping?.address ?? "123 Main St, Lusaka, Zambia"}
            </p>
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <h4 className="font-semibold">Total</h4>
            <p className="text-lg font-bold">K{order.total}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
