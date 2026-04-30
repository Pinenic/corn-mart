"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, MapPin, CreditCard, MessageSquare, Check, Clock, RotateCcw, Package } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { ORDERS, STATUS_CONFIG } from "@/lib/orders-data";
import { notFound } from "next/navigation";

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--color-text-tertiary)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const order   = ORDERS.find((o) => o.id === id);
  if (!order) notFound();

  const cfg        = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.Processing;
  const totalItems = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div>
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/orders"
          className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <ArrowLeft size={14} /> Orders
        </Link>
        <span style={{ color: "var(--color-border-md)" }}>/</span>
        <span className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>#{order.id}</span>
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              Order #{order.id}
            </h1>
            <Badge variant={cfg.variant}>{order.status}</Badge>
          </div>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Placed {new Date(order.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            {" · "}{totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Printer size={14} /> Print</Button>
          {order.status !== "Cancelled" && order.status !== "Delivered" && order.status !== "Refunded" && (
            <Button variant="primary"><Package size={14} /> Mark as shipped</Button>
          )}
          {order.status === "Delivered" && (
            <Button variant="secondary"><RotateCcw size={14} /> Issue refund</Button>
          )}
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* Left column */}
        <div className="space-y-5">

          {/* Items */}
          <Card noPadding>
            <div className="px-5 py-3.5 border-b" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Items ({totalItems})
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {order.items.map((item, i) => (
                <div key={item.id + i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "var(--color-bg)" }}>
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {item.name}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {item.variant}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      ${item.price.toFixed(2)} × {item.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="px-5 py-4 space-y-2 border-t" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
              {[
                { label: "Subtotal", value: `$${order.subtotal.toFixed(2)}` },
                { label: "Shipping", value: order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}` },
                { label: "Tax",      value: `$${order.tax.toFixed(2)}` },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-[13px]"
                  style={{ color: "var(--color-text-secondary)" }}>
                  <span>{r.label}</span><span>{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between text-[15px] font-semibold pt-2 border-t"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}>
                <span>Total</span><span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <Section title="Order timeline">
              <div className="mt-1">
                {order.timeline.map((step, i) => {
                  const isLast = i === order.timeline.length - 1;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                          style={{
                            background: step.done ? "var(--color-accent)" : "white",
                            borderColor: step.done ? "var(--color-accent)" : "var(--color-border-md)",
                          }}>
                          {step.done
                            ? <Check size={12} color="white" strokeWidth={3} />
                            : <Clock size={11} style={{ color: "var(--color-text-tertiary)" }} />
                          }
                        </div>
                        {!isLast && (
                          <div className="w-px my-1.5" style={{
                            flex: 1, minHeight: 24,
                            background: step.done ? "var(--color-accent)" : "var(--color-border)",
                            opacity: step.done ? 0.25 : 1,
                          }} />
                        )}
                      </div>
                      <div className="pb-5 flex-1">
                        <p className="text-[14px] font-medium"
                          style={{ color: step.done ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
                          {step.event}
                        </p>
                        <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                          {step.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <Section title="Notes">
                <p className="text-[13px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  {order.notes}
                </p>
              </Section>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Customer */}
          <Card>
            <Section title="Customer">
              <div className="flex items-center gap-3 mt-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
                  style={{ background: order.customer.avatarBg, color: order.customer.avatarColor }}>
                  {order.customer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                    {order.customer.name}
                  </p>
                  <p className="text-[12px] truncate" style={{ color: "var(--color-text-secondary)" }}>
                    {order.customer.email}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                    {order.customer.phone}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full mt-3">
                <MessageSquare size={13} /> Send message
              </Button>
            </Section>
          </Card>

          {/* Shipping */}
          <Card>
            <Section title="Shipping address">
              <div className="flex items-start gap-2.5 mt-1">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }} />
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {order.shippingAddress.line1}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                    {order.shippingAddress.country}
                  </p>
                </div>
              </div>
            </Section>
          </Card>

          {/* Payment */}
          <Card>
            <Section title="Payment">
              <div className="flex items-center gap-2.5 mt-1">
                <CreditCard size={14} style={{ color: "var(--color-text-tertiary)" }} />
                <span className="text-[13px] font-medium flex-1" style={{ color: "var(--color-text-primary)" }}>
                  {order.paymentMethod}
                </span>
                <Badge variant={order.paymentStatus === "Paid" ? "success" : "warning"}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </Section>
          </Card>

          {/* Danger zone */}
          {order.status !== "Cancelled" && (
            <Card>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--color-text-tertiary)" }}>
                Actions
              </p>
              <Button variant="danger" className="w-full">
                Cancel order
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
