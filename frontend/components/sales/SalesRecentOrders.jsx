"use client";
import Link from "next/link";
import { Package } from "lucide-react";
import { Card, OrderStatusBadge } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

export function SalesRecentOrders({ orders = [] }) {
  return (
    <Card noPadding className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">Recent Orders</h3>
        <Link href="/dashboard/orders" className="text-[12px] font-semibold text-[var(--color-accent)] hover:underline">
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-[13px] text-[var(--color-text-tertiary)] py-6 text-center">No orders yet</p>
      ) : (
        <div className="space-y-1">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/orders/${o.id}`}
              className="flex items-center gap-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg)] transition-colors -mx-1 px-1"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center flex-shrink-0 text-[var(--color-accent)]">
                <Package size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
                  {o.order_number}
                </p>
                <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">{o.customer_name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[13px] font-bold text-[var(--color-text-primary)]">{formatPrice(o.amount)}</p>
                <OrderStatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
