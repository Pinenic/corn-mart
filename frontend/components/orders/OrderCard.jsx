"use client";
import Link from "next/link";
import { Package, ChevronRight, Clock } from "lucide-react";
import { OrderStatusBadge, Badge } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function OrderCard({ order }) {
  const storeOrders = order.store_orders ?? [];
  const itemCount   = storeOrders.reduce((s, so) => s + (so.items?.length ?? 0), 0);

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="bg-white rounded-2xl border border-[var(--color-border)] hover:shadow-md hover:border-[var(--color-border-md)] transition-all duration-200 overflow-hidden cursor-pointer">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div>
            <p className="text-[12px] text-[var(--color-text-muted)]">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
          </div>
        </div>

        {/* Store orders preview */}
        <div className="p-4 space-y-3">
          {storeOrders.slice(0, 2).map((so) => (
            <div key={so.id} className="flex items-start gap-3">
              {/* Thumbnails */}
              <div className="flex -space-x-2 flex-shrink-0">
                {(so.items ?? []).slice(0, 3).map((item, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl border-2 border-white bg-[var(--color-bg)] overflow-hidden">
                    {item.product?.thumbnail_url
                      ? <img src={item.product.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                    }
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">
                  {so.store?.name ?? "Store"}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {so.items?.length ?? 0} item{(so.items?.length ?? 0) !== 1 ? "s" : ""} · {formatPrice(so.subtotal)}
                </p>
              </div>
            </div>
          ))}
          {storeOrders.length > 2 && (
            <p className="text-[11px] text-[var(--color-text-muted)]">+{storeOrders.length - 2} more store{storeOrders.length - 2 > 1 ? "s" : ""}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <p className="text-[12px] text-[var(--color-text-secondary)]">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
          <p className="text-[14px] font-bold text-[var(--color-text-primary)]">{formatPrice(order.total_amount)}</p>
        </div>
      </div>
    </Link>
  );
}

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];
const STATUS_LABELS = {
  pending:    "Order placed",
  confirmed:  "Confirmed by seller",
  processing: "Being prepared",
  shipped:    "Out for delivery",
  delivered:  "Delivered",
};

export function OrderTimeline({ status }) {
  const currentIdx = STATUS_STEPS.indexOf(status?.toLowerCase());
  const isCancelled = status === "cancelled" || status === "refunded";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--color-danger-bg)] border border-[var(--color-danger)]">
        <div className="w-8 h-8 rounded-full bg-[var(--color-danger)] flex items-center justify-center text-white flex-shrink-0">✕</div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-danger)] capitalize">{status}</p>
          <p className="text-[12px] text-[var(--color-text-secondary)]">This order has been {status}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const done    = i <= currentIdx;
        const current = i === currentIdx;
        const last    = i === STATUS_STEPS.length - 1;
        return (
          <div key={step} className="flex gap-4">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-all",
                done
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border-2 border-[var(--color-border)]"
              )}>
                {done ? (current ? "●" : "✓") : i + 1}
              </div>
              {!last && <div className={cn("w-0.5 flex-1 my-1 transition-colors", done ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]")} style={{ minHeight: 24 }} />}
            </div>
            {/* Label */}
            <div className={cn("pb-5 pt-1.5", last && "pb-0")}>
              <p className={cn("text-[13px] font-semibold", done ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]")}>
                {STATUS_LABELS[step]}
              </p>
              {current && (
                <p className="text-[11px] text-[var(--color-primary)] font-medium mt-0.5 flex items-center gap-1">
                  <Clock size={10} /> In progress
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
