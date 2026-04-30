"use client";

import { ExternalLink, Package } from "lucide-react";
import Link from "next/link";
import { ORDERS, STATUS_CONFIG } from "@/lib/orders-data";
import { Badge } from "@/components/ui";

/**
 * Renders an inline order summary card within the chat thread.
 * Used when a message has an order_id, or when a "order_ref"
 * system message is shown.
 */
export function OrderContextCard({ orderId, compact = false }) {
  const order = ORDERS.find((o) => o.id === orderId);
  if (!order) return null;

  const cfg        = STATUS_CONFIG[order.status];
  const totalItems = order.items.reduce((s, i) => s + i.qty, 0);

  if (compact) {
    // Minimal inline pill — shown alongside a regular message
    return (
      <Link href={`/orders/${order.id}`}>
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg border transition-colors hover:bg-[var(--color-bg)] cursor-pointer"
          style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)", background: "white" }}
        >
          <Package size={11} />
          Order #{order.id}
          <Badge variant={cfg.variant} className="text-[9px] px-1.5">{order.status}</Badge>
        </span>
      </Link>
    );
  }

  // Full card — used for "order_ref" system messages
  return (
    <div
      className="rounded-xl border overflow-hidden my-1"
      style={{ borderColor: "var(--color-border)", background: "white", maxWidth: 320 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
      >
        <div className="flex items-center gap-2">
          <Package size={13} style={{ color: "var(--color-text-tertiary)" }} />
          <span className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Order #{order.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={cfg.variant}>{order.status}</Badge>
          <Link href={`/orders/${order.id}`}>
            <ExternalLink size={12} style={{ color: "var(--color-text-tertiary)" }} className="hover:opacity-70" />
          </Link>
        </div>
      </div>

      {/* Items preview */}
      <div className="px-3 py-2">
        {order.items.slice(0, 2).map((item, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <span className="text-base">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                {item.name}
              </p>
              <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                {item.variant} · Qty {item.qty}
              </p>
            </div>
            <span className="text-[12px] font-semibold flex-shrink-0" style={{ color: "var(--color-text-secondary)" }}>
              ${(item.price * item.qty).toFixed(2)}
            </span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-[10px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            +{order.items.length - 2} more item{order.items.length - 2 > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Footer total */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
      >
        <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          {totalItems} item{totalItems !== 1 ? "s" : ""} ·{" "}
          {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <span className="text-[13px] font-bold" style={{ color: "var(--color-text-primary)" }}>
          ${order.total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
