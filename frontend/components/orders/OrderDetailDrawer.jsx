"use client";

import { useEffect } from "react";
import {
  X,
  MapPin,
  CreditCard,
  Package,
  MessageSquare,
  Check,
  Clock,
  Printer,
  RotateCcw,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { STATUS_CONFIG } from "@/lib/orders-data";
import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { ArrowUpRightFromSquare } from "lucide-react";
import { Loader2 } from "lucide-react";

function Avatar({ customer }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
      style={{ background: customer.avatarBg, color: customer.avatarColor }}
    >
      <img src={customer.avatar_url} alt="item" className="rounded-full" />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p
        className="text-[11px] font-semibold uppercase tracking-wider mb-2.5"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

export function OrderDetailDrawer({ order, onClose, onStatusChange }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.Processing;
  const totalItems = order.order_items.reduce((s, i) => s + i.qty, 0);

  const handleStatusChange = async () => {
    order.status === "pending"
      ? onStatusChange(order.id, "confirmed")
      : order.status === "confirmed"
      ? onStatusChange(order.id, "processing")
      : onStatusChange(order.id, "shipped");
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl"
        style={{
          width: "min(520px, 100vw)",
          borderLeft: "0.5px solid var(--color-border)",
          animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2
                className="text-[16px] font-semibold tracking-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                Order #STO-
                {String(order.id || "")
                  .slice(0, 4)
                  .toUpperCase()}
              </h2>
              <Badge variant={cfg.variant}>{order.status}</Badge>
            </div>
            <p
              className="text-[12px] mt-0.5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Placed{" "}
              {new Date(order.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {" · "}
              {order.order_items.length} item
              {order.order_items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="secondary" size="sm">
              <Printer size={13} /> Print
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg)]"
              style={{ color: "var(--color-text-secondary)" }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Customer */}
          <Section title="Customer">
            <div
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
              }}
            >
              <Avatar customer={order.customer} />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[14px] font-semibold truncate"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {order.customer.name}
                </p>
                <p
                  className="text-[12px] truncate"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {order.customer.email}
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {order.customer.phone}
                </p>
              </div>
              <button
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors hover:bg-white"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-secondary)",
                }}
                title="Message customer"
              >
                <MessageSquare size={14} />
              </button>
            </div>
          </Section>

          {/* Items */}
          <Section title={`Items (${order.order_items.length})`}>
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--color-border)" }}
            >
              {order.order_items.map((item, i) => (
                <div
                  key={item.id + i}
                  className="flex items-center gap-3 px-3 py-2.5 border-b last:border-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "var(--color-bg)" }}
                  >
                    <img
                      src={item?.products?.thumbnail_url}
                      alt="item"
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13px] font-medium truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item?.products?.name}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {item.variant} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span
                    className="text-[13px] font-semibold flex-shrink-0"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    K{(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {/* Totals */}
              <div
                className="px-3 py-2.5 space-y-1.5"
                style={{ background: "var(--color-bg)" }}
              >
                {[
                  { label: "Subtotal", value: `K${order.subtotal.toFixed(2)}` },
                  // { label: "Shipped", value: order.shipped === 0 ? "Free" : `$${order.shipped.toFixed(2)}` },
                  // { label: "Tax",      value: `$${order.tax.toFixed(2)}` },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex justify-between text-[12px]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    <span>{r.label}</span>
                    <span>{r.value}</span>
                  </div>
                ))}
                <div
                  className="flex justify-between text-[14px] font-semibold pt-1.5 mt-1 border-t"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <span>Total</span>
                  <span>K{order.subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Payment + Shipping */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: "var(--color-text-tertiary)" }}>Payment</p>
              <div className="rounded-xl border p-3" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={13} style={{ color: "var(--color-text-tertiary)" }} />
                  <span className="text-[12px] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{order.paymentMethod}</span>
                </div>
                <Badge variant={order.paymentStatus === "Paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
              </div>
            </div> */}
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider mb-2.5"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Ship to
              </p>
              <div
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-start gap-2">
                  <MapPin
                    size={13}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                  <div>
                    <p
                      className="text-[11px] leading-snug"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {order.shipping_info.address}, {order.shipping_info.city},{" "}
                      {order.shipping_info.country}
                    </p>
                    {/* <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{order.shipping_info.country}</p> */}
                    <p
                      className="text-[12px] font-medium leading-snug"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {order.shipping_info.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline will be integrated later */}
          {/* <Section title="Order timeline">
            <div>
              {order.timeline.map((step, i) => {
                const isLast = i === order.timeline.length - 1;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                        style={{ background: step.done ? "var(--color-accent)" : "white", borderColor: step.done ? "var(--color-accent)" : "var(--color-border-md)" }}>
                        {step.done
                          ? <Check size={11} color="white" strokeWidth={3} />
                          : <Clock size={10} style={{ color: "var(--color-text-tertiary)" }} />
                        }
                      </div>
                      {!isLast && <div className="w-px my-1" style={{ flex: 1, minHeight: 20, background: step.done ? "var(--color-accent)" : "var(--color-border)", opacity: step.done ? 0.3 : 1 }} />}
                    </div>
                    <div className="pb-3.5 flex-1">
                      <p className="text-[13px] font-medium" style={{ color: step.done ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
                        {step.event}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{step.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section> */}

          {/* Notes */}
          {order.notes && (
            <Section title="Notes">
              <div
                className="rounded-xl border px-3 py-2.5 text-[13px]"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {order.notes}
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex gap-2 px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          {order.status === "pending" && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => handleStatusChange()}
            >
              <CheckCircleIcon size={14} /> Confirm
            </Button>
          )}
          {order.status === "confirmed" && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => handleStatusChange()}
            >
              <Loader2 size={14} /> Start Processing
            </Button>
          )}
          {order.status === "processing" && order.status !== "refunded" && (
            <Button variant="primary" className="flex-1">
              <Package size={14} /> Ship
            </Button>
          )}
          {order.status === "delivered" && (
            <Button variant="secondary" className="flex-1">
              <RotateCcw size={14} /> Issue refund
            </Button>
          )}
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <Button variant="danger">Cancel</Button>
          )}

          <Button variant="secondary" className="flex-1">
            <ArrowUpRightFromSquare size={14} />{" "}
            <Link href={`orders/${order.id}`}>Details</Link>
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
